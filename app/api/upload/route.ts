import {getCustomerSession} from '@/lib/customer-session';
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    if (!await getCustomerSession()) return NextResponse.json({error:'Unauthorized'},{status:401});
    if (Number(req.headers.get('content-length')) > 6*1024*1024) return NextResponse.json({error:'File too large'},{status:413});
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!(file instanceof File) || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
      return NextResponse.json(
        { error: "No file" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "stvbeauty/slips",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
