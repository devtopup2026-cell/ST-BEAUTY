import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ======================================================
  // ปล่อยหน้า Login ให้เข้าได้เสมอ
  // ======================================================

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ======================================================
  // อ่าน Session Cookie
  // ======================================================

  const token = request.cookies.get(
    "stvbeauty_admin_session"
  )?.value;

  // ไม่มี Session
  if (!token) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  // ตรวจ Session
  const session = verifyAdminSessionToken(token);

  if (!session) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    response.cookies.delete(
      "stvbeauty_admin_session"
    );

    return response;
  }

  // ======================================================
  // Order Manager = SUPER_ADMIN เท่านั้น
  // ======================================================

  if (
    pathname.startsWith("/admin/order-manager") &&
    session.role !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/admin", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
