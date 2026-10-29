"use client";
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/Footer';
import {useCart} from '@/store/cart.store';
import {useCustomerStore} from '@/store/customer.store';
import {generateOrderId} from '@/lib/generateOrderId';
type Settings={mode:'test'|'live'|'closed';image:string;accountLabel:string};
export default function PaymentPage(){
  const router=useRouter();const cart=useCart();const customer=useCustomerStore();
  const [settings,setSettings]=useState<Settings|null>(null);
  const [now,setNow]=useState(0);
  useEffect(()=>{setNow(Date.now());const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const shippingReady=customer.shippingEstimate?.status==='priced'&&customer.shippingEstimate.vatRate===0.07&&customer.shippingEstimate.method!=='pickup'&&!!customer.shippingEstimate.token&&(customer.shippingEstimate.expiresAt??0)>now;
  const [error,setError]=useState('');const [preview,setPreview]=useState('');
  const [uploading,setUploading]=useState(false);const [submitting,setSubmitting]=useState(false);
  const [ack,setAck]=useState(false);const busy=useRef(false);const orderId=useRef('');
  useEffect(()=>{fetch('/api/payment-settings',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();setSettings(await r.json());}).catch(()=>setError('โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้า'));},[]);
  async function upload(file?:File){
    if(!file)return;setPreview('');setError('');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('เลือกรูป JPG, PNG หรือ WEBP ไม่เกิน 5 MB');return;}
    setUploading(true);
    try{const form=new FormData();form.append('file',file);const r=await fetch('/api/upload',{method:'POST',body:form});const d=await r.json();if(!r.ok||!d.url)throw Error(d.error||'อัปโหลดไม่สำเร็จ');setPreview(d.url);}
    catch(e){setError(e instanceof Error?e.message:'อัปโหลดไม่สำเร็จ');}finally{setUploading(false);}
  }
  async function submit(){
    if(busy.current||uploading||!settings||settings.mode==='closed')return;
    const test=settings.mode==='test';
    if(!cart.items.length){setError('ตะกร้าว่าง');return;}
    if(!customer.shippingEstimate?.token||!customer.shippingEstimate.expiresAt||customer.shippingEstimate.expiresAt<=Date.now()){setError('กรุณากลับไป Checkout เพื่อคำนวณค่าส่งใหม่');return;}
    if(test&&!ack){setError('กรุณายืนยันว่าเป็นการทดสอบ');return;}
    busy.current=true;setSubmitting(true);setError('');
    try{orderId.current ||= generateOrderId();
      const r=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:orderId.current,customer:{fullname:customer.fullName,email:customer.email,phone:customer.phone,address:customer.address,postalCode:customer.postalCode},items:cart.items.map(i=>({productId:i.product.id,quantity:i.quantity})),shippingToken:customer.shippingEstimate?.token,normalAccess:customer.normalAccess,testAcknowledged:ack,paymentMethod:customer.paymentMethod,paymentSlip:preview||undefined})});
      const d=await r.json();if(!r.ok)throw Error(d.error||'บันทึกไม่สำเร็จ');cart.clear();customer.clearCustomer();router.push('/order-success?order='+encodeURIComponent(d.order.id));
    }catch(e){setError(e instanceof Error?e.message:'บันทึกไม่สำเร็จ');}finally{busy.current=false;setSubmitting(false);}
  }
  const test=settings?.mode==='test';
  return <><Header/><main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14 text-slate-900">
    {!settings?<p role="status">{error||'กำลังโหลด…'}</p>:!shippingReady?<><h1 className="mb-6 text-3xl font-bold">กรุณาคำนวณค่าส่งก่อน</h1><p className="mb-6">ข้อมูลค่าส่งยังไม่พร้อมหรือหมดอายุ ต้องคำนวณใหม่ก่อนแสดงข้อมูลรับชำระเงิน</p><Link href="/checkout" className="rounded-xl bg-rose-600 px-6 py-3">กลับไป Checkout</Link></>:settings.mode==='closed'?<><h1 className="mb-6 text-3xl font-bold">ยังไม่เปิดรับชำระเงินออนไลน์</h1><p className="mb-6">ติดต่อร้านเพื่อยืนยันราคาและค่าจัดส่งก่อนชำระเงิน</p><Link href="/contact" className="rounded-xl bg-rose-600 px-6 py-3">ติดต่อร้าน</Link></>:<>
      <h1 className="mb-6 text-4xl font-bold">{test?'ทดสอบการสั่งซื้อ':'แจ้งชำระเงิน'}</h1>
      {test&&<div className="mb-8 rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 text-amber-900"><h2 className="text-2xl font-bold">ทดสอบระบบเท่านั้น — ห้ามโอนเงินจริง</h2><p className="mt-3">รูปด้านล่างเป็นรูปสินค้า ไม่ใช่ QR ข้อมูลบัญชีเป็นข้อมูลสมมุติ</p><p className="mt-2">ออเดอร์ขึ้นต้น TEST- และไม่นับเป็นยอดขายจริง การอนุมัติในหลังบ้านจะตัดสต็อกจริงของสินค้าที่เลือก จึงควรใช้เฉพาะสินค้าทดสอบ</p></div>}
      <section className="rounded-2xl bg-white p-6 sm:p-10">
        <img src={settings.image} alt={test?'รูปสินค้าสำหรับทดสอบ ไม่ใช่ QR':'QR รับชำระเงินของร้าน'} className="mx-auto max-h-80 rounded-xl bg-white object-contain p-4"/>
        <div className="my-6 space-y-2"><p>ชื่อบัญชี: {settings.accountLabel}</p>{test&&<><p>เลขบัญชี: XXX-X-XXXXX-X</p><p>ธนาคาร: ธนาคารสมมุติ</p></>}</div>
        <p className="mb-6 text-2xl font-bold">{test?'ยอดทดสอบรวม VAT':'ยอดชำระรวม VAT'}: ฿{(customer.shippingEstimate?.total??cart.totalPrice()).toLocaleString('th-TH')}</p>
        <div className="mb-6 rounded-xl border border-slate-300 p-4"><p>ยอดสินค้า: ฿{customer.shippingEstimate?.subtotal.toLocaleString('th-TH') ?? '—'}</p><p>ค่าจัดส่ง: {customer.shippingEstimate?.status === 'priced' ? '฿'+customer.shippingEstimate.fee?.toLocaleString('th-TH') : 'ยังไม่ยืนยัน'}</p><p>VAT 7%: {customer.shippingEstimate?.vatAmount!=null?'฿'+customer.shippingEstimate.vatAmount.toLocaleString('th-TH',{minimumFractionDigits:2}):'—'}</p><p>{customer.shippingEstimate?.reason}</p><Link href="/checkout" className="mt-2 inline-block underline">กลับไปคำนวณ / เปลี่ยนวิธีรับสินค้า</Link></div><div className="mb-8 rounded-xl bg-slate-100 p-5"><h2 className="mb-3 text-xl font-bold">ข้อมูลผู้รับ</h2><p>{customer.fullName}</p><p>{customer.email}</p><p>{customer.phone}</p><p>{customer.address} {customer.postalCode}</p></div>
        <label className="block font-semibold" htmlFor="payment-image">{test?'แนบรูปสินค้าทดแทนสลิป (ไม่บังคับ)':'แนบสลิปชำระเงิน (แนบภายหลังในประวัติคำสั่งซื้อได้)'}</label>
        <input id="payment-image" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading||submitting} onChange={e=>void upload(e.target.files?.[0])} className="my-4 w-full rounded-xl border border-slate-300 p-3"/>
        {uploading&&<p role="status">กำลังอัปโหลด…</p>}
        {preview&&<img src={preview} alt={test?'รูปแนบทดสอบ ไม่ใช่หลักฐานการโอน':'สลิปที่แนบ'} className="mb-6 max-h-64 rounded-xl"/>}
        {test&&<label className="my-6 flex items-start gap-3"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)} className="mt-1"/><span>ฉันเข้าใจว่าไม่มีการโอนเงินจริง และการอนุมัติจะตัดสต็อกสินค้าทดสอบ</span></label>}
        {error&&<p role="alert" className="my-4 text-rose-700">{error}</p>}
        <button disabled={submitting||uploading||!cart.items.length||(test&&!ack)} onClick={()=>void submit()} className="w-full rounded-xl bg-rose-600 px-6 py-4 font-bold disabled:opacity-40">{submitting?'กำลังบันทึก…':test?'สร้างออเดอร์ทดสอบ — ไม่มีการชำระเงิน':preview?'ยืนยันแจ้งชำระเงิน':'สร้างคำสั่งซื้อ — แนบสลิปภายหลัง'}</button>
      </section>
    </>}
  </main><Footer/></>;
}
