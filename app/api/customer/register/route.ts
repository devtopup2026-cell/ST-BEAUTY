import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const postalCode = String(body.postalCode || "").trim();

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกข้อมูลให้ครบถ้วน",
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "รูปแบบ Email ไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    // Password minimum length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password ต้องมีอย่างน้อย 8 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    // Existing member already has a password
    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: "Email นี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({ data: {fullName,email,password:hashedPassword,phone,address,postalCode} });

    return NextResponse.json(
      {
        success: true,
        message: "สมัครสมาชิกสำเร็จ",
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          postalCode: customer.postalCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CUSTOMER_REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  }
}
