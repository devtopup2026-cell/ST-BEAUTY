import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    success: true,
    admin: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
