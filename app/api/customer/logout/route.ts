import { NextResponse } from "next/server";

import { deleteCustomerSession } from "@/lib/customer-session";

export async function POST() {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    await deleteCustomerSession();

    return NextResponse.json({
      success: true,
      message: "ออกจากระบบสำเร็จ",
    });
  } catch (error) {
    console.error("CUSTOMER_LOGOUT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถออกจากระบบได้",
      },
      { status: 500 }
    );
  }
}
