import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
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

export async function POST(req: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file selected",
        },
        {
          status: 400,
        }
      );
    }

    // อนุญาตเฉพาะรูป
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only JPG, PNG and WEBP are allowed",
        },
        {
          status: 400,
        }
      );
    }

    // จำกัด 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Image must be smaller than 5 MB",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "stvbeauty/products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error(
      "PRODUCT IMAGE UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Image upload failed",
      },
      {
        status: 500,
      }
    );
  }
}
