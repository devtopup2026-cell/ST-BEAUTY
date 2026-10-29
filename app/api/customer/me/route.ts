import { NextResponse } from "next/server";

import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";

export async function GET() {
if(process.env.DEMO_CATALOG === "true") return NextResponse.json({success:true,customer:null});
  try {
    const customer = await getCustomerSession();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          customer: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
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
    console.error("CUSTOMER_ME_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        customer: null,
        error: "ไม่สามารถโหลดข้อมูลสมาชิกได้",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(request: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const customer = await getCustomerSession();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาเข้าสู่ระบบ",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const postalCode = String(body.postalCode || "").trim();

    if (!fullName || !phone || !address || !postalCode) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกข้อมูลให้ครบ",
        },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        fullName,
        phone,
        address,
        postalCode,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        postalCode: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลสมาชิกสำเร็จ",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("CUSTOMER_PROFILE_UPDATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถแก้ไขข้อมูลสมาชิกได้",
      },
      { status: 500 }
    );
  }
}
