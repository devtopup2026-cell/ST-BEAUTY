import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/admin-session";

export async function getAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "stvbeauty_admin_session"
  )?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}
