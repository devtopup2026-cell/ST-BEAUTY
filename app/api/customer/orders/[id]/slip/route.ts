import {canAttachOrderSlip} from '@/lib/order-slip-policy';
import {NextResponse} from 'next/server';
import {getCustomerSession} from '@/lib/customer-session';
import {prisma} from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 if(process.env.DEMO_CATALOG==='true')return NextResponse.json({error:'โหมดตัวอย่างยังไม่เปิดรับสลิป'},{status:503});
 const origin=req.headers.get('origin');
 if(origin){try{if(new URL(origin).host!==new URL(req.url).host)return NextResponse.json({error:'คำขอไม่ถูกต้อง'},{status:403});}catch{return NextResponse.json({error:'คำขอไม่ถูกต้อง'},{status:403});}}
 try{
  const customer=await getCustomerSession();if(!customer)return NextResponse.json({error:'กรุณาเข้าสู่ระบบใหม่'},{status:401});
  const {id}=await params;
  const order=await prisma.order.findFirst({where:{id,customerId:customer.id},select:{id:true,customerId:true,status:true,paymentSlip:true}});
  if(!order)return NextResponse.json({error:'ไม่พบคำสั่งซื้อ'},{status:404});
  if(!canAttachOrderSlip(order,customer.id))return NextResponse.json({error:'คำสั่งซื้อมีสลิปแล้วหรือเปลี่ยนสถานะแล้ว กรุณารีเฟรชหน้า'},{status:409});
  if(Number(req.headers.get('content-length'))>6*1024*1024)return NextResponse.json({error:'ไฟล์ใหญ่เกินไป'},{status:413});
  const form=await req.formData(),file=form.get('file');
  if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size===0||file.size>5*1024*1024)return NextResponse.json({error:'เลือกรูป JPG, PNG หรือ WEBP ไม่เกิน 5 MB'},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer());
  const result=await new Promise<{secure_url:string;public_id:string}>((resolve,reject)=>{cloudinary.uploader.upload_stream({folder:'stvbeauty/slips',resource_type:'image'},(error,result)=>{if(error||!result)reject(error||Error('Upload failed'));else resolve(result);}).end(bytes);});
  try{
   const updated=await prisma.order.updateMany({where:{id,customerId:customer.id,status:'Pending Payment',paymentSlip:null},data:{paymentSlip:result.secure_url}});
   if(updated.count!==1){await cloudinary.uploader.destroy(result.public_id).catch(()=>{});return NextResponse.json({error:'คำสั่งซื้อเปลี่ยนแปลงแล้ว กรุณารีเฟรชหน้า'},{status:409});}
  }catch(error){await cloudinary.uploader.destroy(result.public_id).catch(()=>{});throw error;}
  return NextResponse.json({success:true,url:result.secure_url},{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('ORDER_SLIP_UPLOAD_FAILED');return NextResponse.json({error:'อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่'},{status:500});}
}
