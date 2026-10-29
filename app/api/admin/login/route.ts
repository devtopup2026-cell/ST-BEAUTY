import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  createAdminSessionToken,
} from "@/lib/admin-session";

export async function POST(req: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {
    const body = await req.json();

    const email =
      String(body.email || "")
        .trim()
        .toLowerCase();

    const password =
      String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // หา Admin
    const admin =
      await prisma.adminUser.findUnique({
        where: {
          email,
        },
      });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Email or password is incorrect",
        },
        {
          status: 401,
        }
      );
    }

    // ตรวจ Password
    const passwordValid =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Email or password is incorrect",
        },
        {
          status: 401,
        }
      );
    }

    // สร้าง Session
    const token =
      createAdminSessionToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

    const response =
      NextResponse.json({
        success: true,

        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });

    response.cookies.set(
      "stvbeauty_admin_session",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",

        // 8 ชั่วโมง
        maxAge: 60 * 60 * 8,
      }
    );

    return response;

  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}
