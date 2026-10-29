import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/customer-session";

export async function POST(request: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอก Email และ Password",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    // ไม่พบ Customer หรือเป็น Guest ที่ยังไม่มี Password
    if (!customer || !customer.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email หรือ Password ไม่ถูกต้อง",
        },
        { status: 401 }
      );
    }

    const passwordMatched = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatched) {
      return NextResponse.json(
        {
          success: false,
          error: "Email หรือ Password ไม่ถูกต้อง",
        },
        { status: 401 }
      );
    }

    await createCustomerSession(customer.id);

    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        postalCode: customer.postalCode,
      },
    });
  } catch (error) {
    console.error("CUSTOMER_LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  }
}
