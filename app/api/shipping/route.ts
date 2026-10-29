import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {getCustomerSession} from '@/lib/customer-session';
import {estimateShipping} from '@/lib/shipping-server';
export async function POST(req:Request){
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});try{
  const member=await getCustomerSession();if(!member)return NextResponse.json({error:'กรุณาเข้าสู่ระบบก่อน'},{status:401});
  const body=await req.json();const {items,address,postalCode,method,normalAccess}=body;
  if(method!=='courier'||typeof address!=='string'||!address.trim()||address.length>1000||typeof postalCode!=='string'||!/^\d{5}$/.test(postalCode)||!Array.isArray(items)||!items.length||items.length>100||items.some(i=>!i||!Number.isInteger(i.productId)||!Number.isInteger(i.quantity)||i.quantity<=0)||new Set(items.map(i=>i.productId)).size!==items.length)return NextResponse.json({error:'กรุณาตรวจที่อยู่ รหัสไปรษณีย์ และสินค้า'},{status:400});
  const products=await prisma.product.findMany({where:{id:{in:items.map(i=>i.productId)}}});
  if(products.length!==items.length||items.some(i=>i.quantity>products.find(p=>p.id===i.productId)!.stock))return NextResponse.json({error:'สินค้าไม่เพียงพอหรือไม่มีในระบบ'},{status:409});
  const estimate=await estimateShipping({memberId:member.id,items,products,address,postalCode,method,normalAccess:normalAccess===true});
  return NextResponse.json({success:true,estimate},{headers:{'Cache-Control':'no-store'}});
}catch(error){console.error('SHIPPING ESTIMATE ERROR',error);return NextResponse.json({error:'คำนวณค่าส่งไม่สำเร็จ กรุณาลองใหม่'},{status:503});}}
