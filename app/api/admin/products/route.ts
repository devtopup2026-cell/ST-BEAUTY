import {parseShippingProduct} from '@/lib/shipping-product';
import {normalizeUnit} from '@/lib/product-units';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

// ======================================================
// ตรวจ SUPER_ADMIN
// ======================================================

async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (
    session.role !== "ADMIN" &&
    session.role !== "SUPER_ADMIN"
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Forbidden",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    session,
  };
}

// ======================================================
// GET - ดึงสินค้าทั้งหมด
// ======================================================

export async function GET() {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const products = await prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (error) {
    console.error("GET ADMIN PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load products",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST - เพิ่มสินค้าใหม่
// ======================================================

export async function POST(req: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const body = await req.json();
    let shipping;
    try {shipping=parseShippingProduct(body);}catch(error){return NextResponse.json({success:false,error:error instanceof Error?error.message:'ข้อมูลจัดส่งไม่ถูกต้อง'},{status:400});}
    const unit = normalizeUnit(body.unit);
    if(!unit) return NextResponse.json({success:false,error:'หน่วยขายไม่ถูกต้อง'},{status:400});

    const {
      id,
      name,
      slug,
      brand,
      category,
      description,
      price,
      compareAtPrice,
      image,
      stock,
      featured,
      isNew,
    } = body;

    if (
      !name ||
      !slug ||
      !brand ||
      !category ||
      !image
      ) {
      return NextResponse.json(
        {
          success: false,
          error: "Required product information is missing",
        },
        {
          status: 400,
        }
      );
    }

    const productId = Number(id);
    const productPrice = Number(price);
    const productStock = Number(stock);

    const productCompareAtPrice =
  compareAtPrice === null ||
  compareAtPrice === undefined ||
  compareAtPrice === ""
    ? null
    : Number(compareAtPrice);


    if (
  productCompareAtPrice !== null &&
  (
    !Number.isFinite(productCompareAtPrice) ||
    productCompareAtPrice < 0
  )
) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid compare price",
    },
    {
      status: 400,
    }
  );
}

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid price",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(productStock) ||
      productStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid stock",
        },
        {
          status: 400,
        }
      );
    }

    const existingProduct =
      await prisma.product.findFirst({
        where: {
          OR: [
            {
              id: productId,
            },
            {
              slug,
            },
          ],
        },
      });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID or slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    const product = await prisma.product.create({
data: {
  id: productId,
  name: name.trim(),
  slug: slug.trim(),

  brand: brand.trim(),
  category: category.trim(),

  description:
    description?.trim() || null,

  price: productPrice,
  compareAtPrice: productCompareAtPrice,

  image: image.trim(),
  stock: productStock,
  ...shipping,
  unit,

  featured: Boolean(featured),
  isNew: Boolean(isNew),
},
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}
