import {parseShippingProduct} from '@/lib/shipping-product';
import {normalizeUnit} from '@/lib/product-units';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

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
// GET - Product by ID
// ======================================================

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const productId = Number(id);

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

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load product",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PATCH - Update Product
// ======================================================

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const productId = Number(id);

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

    const body = await req.json();
    let shipping;
    try {shipping=parseShippingProduct(body);}catch(error){return NextResponse.json({success:false,error:error instanceof Error?error.message:'ข้อมูลจัดส่งไม่ถูกต้อง'},{status:400});}
    const unit = normalizeUnit(body.unit);
    if(!unit) return NextResponse.json({success:false,error:'หน่วยขายไม่ถูกต้อง'},{status:400});

const {
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

    if (!name || !slug || !image) {
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

    const productPrice = Number(price);
    const productStock = Number(stock);

    const productCompareAtPrice =
    compareAtPrice === null ||
    compareAtPrice === undefined ||
    compareAtPrice === ""
    ? null
    : Number(compareAtPrice);

    if (!brand || !category) {
  return NextResponse.json(
    {
      success: false,
      error: "Brand and category are required",
    },
    {
      status: 400,
    }
  );
}

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

    if (
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
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
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const slugOwner =
      await prisma.product.findFirst({
        where: {
          slug,
          NOT: {
            id: productId,
          },
        },
      });

    if (slugOwner) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },

      data: {
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

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}


// ======================================================
// DELETE - Delete Product
// ======================================================

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;
    const productId = Number(id);

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

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const orderItemCount =
      await prisma.orderItem.count({
        where: {
          productId,
        },
      });

    if (orderItemCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "สินค้านี้มีประวัติคำสั่งซื้ออยู่ จึงไม่สามารถลบได้",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      {
        status: 500,
      }
    );
  }
}
