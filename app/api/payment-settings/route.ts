import {NextResponse} from 'next/server';
import {paymentSettings} from '@/lib/payment-policy';
export const dynamic = 'force-dynamic';
export async function GET(){
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});return NextResponse.json(paymentSettings(process.env),{headers:{'Cache-Control':'no-store'}});}
