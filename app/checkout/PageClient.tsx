"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/Footer';
import {useCart} from '@/store/cart.store';
import {useCustomerStore} from '@/store/customer.store';
import type {ShippingEstimate,ShippingMethod} from '@/types/shipping';

export default function CheckoutPage(){
  const router=useRouter();const cart=useCart();const {setCustomer}=useCustomerStore();
  const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const [name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[address,setAddress]=useState(''),[postal,setPostal]=useState('');
  const [method,setMethod]=useState<ShippingMethod>('courier');const [normalAccess,setNormalAccess]=useState(false);const [paymentMethod,setPaymentMethod]=useState('PromptPay');
  const [estimate,setEstimate]=useState<ShippingEstimate|null>(null);const request=useRef<AbortController|null>(null);
  const [estimateKey,setEstimateKey]=useState('');
  const key=JSON.stringify({name,phone,address,postal,method,normalAccess,items:cart.items.map(i=>({productId:i.product.id,quantity:i.quantity}))});
  const validEstimate=estimateKey===key?estimate:null;
  const latestKey=useRef(key); latestKey.current=key;
  useEffect(()=>{const c=new AbortController();fetch('/api/customer/me',{cache:'no-store',signal:c.signal}).then(async r=>{if(!r.ok){router.replace('/login');return;}const d=await r.json();if(!d.success||!d.customer){router.replace('/login');return;}const m=d.customer;setName(m.fullName);setPhone(m.phone);setEmail(m.email);setAddress(m.address);setPostal(m.postalCode);setReady(true);}).catch(()=>{if(!c.signal.aborted)setError('โหลดข้อมูลสมาชิกไม่สำเร็จ กรุณารีเฟรช');});return()=>{c.abort();request.current?.abort();};},[router]);
  async function calculate(){
    if(!name.trim()||!phone.trim()||!address.trim()||!/^\d{5}$/.test(postal)||!cart.items.length){setError('กรอกชื่อ โทรศัพท์ ที่อยู่ รหัสไปรษณีย์ และตรวจสินค้าให้ครบ');return;}
    request.current?.abort();const c=new AbortController();request.current=c;setBusy(true);setError('');setEstimate(null);
    try{const r=await fetch('/api/shipping',{method:'POST',headers:{'Content-Type':'application/json'},signal:c.signal,body:JSON.stringify({items:cart.items.map(i=>({productId:i.product.id,quantity:i.quantity})),address,postalCode:postal,method,normalAccess})});const d=await r.json();if(!r.ok)throw Error(d.error||'คำนวณไม่สำเร็จ');if(!c.signal.aborted){setEstimate(d.estimate);setEstimateKey(key);return d.estimate as ShippingEstimate;}}
    catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'คำนวณไม่สำเร็จ');}finally{if(!c.signal.aborted)setBusy(false);}
  }
  function proceed(value:ShippingEstimate|null=validEstimate){const validEstimate=value;if(!validEstimate||validEstimate.status!=='priced'||!validEstimate.token||!validEstimate.expiresAt||validEstimate.expiresAt<=Date.now()){setError('กรุณาคำนวณค่าส่งใหม่');return;}setCustomer({fullName:name,phone,email,address,postalCode:postal,paymentMethod,shippingMethod:method,normalAccess,shippingEstimate:validEstimate});router.push('/payment');}
  return <><Header/><main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14 text-slate-900"><h1 className="mb-8 text-4xl font-bold">ดำเนินการสั่งซื้อ</h1>
    {!ready?<p role="status">{error||'กำลังโหลดข้อมูลสมาชิก…'}</p>:!cart.items.length?<p>ตะกร้าว่าง <Link className="underline" href="/products">เลือกสินค้า</Link></p>:<div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6"><section className="rounded-2xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">ข้อมูลผู้รับสินค้า</h2><div className="grid gap-4 sm:grid-cols-2">
        <label>ชื่อผู้รับ<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-lg bg-slate-100 p-3"/></label>
        <label>โทรศัพท์<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-lg bg-slate-100 p-3"/></label>
        <label>อีเมล<input readOnly value={email} className="mt-2 w-full rounded-lg bg-slate-100 p-3 text-slate-600"/></label>
        <label>รหัสไปรษณีย์<input inputMode="numeric" maxLength={5} value={postal} onChange={e=>setPostal(e.target.value)} className="mt-2 w-full rounded-lg bg-slate-100 p-3"/></label>
        <label className="sm:col-span-2">ที่อยู่พร้อมตำบล อำเภอ และจังหวัด<textarea maxLength={1000} value={address} onChange={e=>setAddress(e.target.value)} className="mt-2 min-h-28 w-full rounded-lg bg-slate-100 p-3"/></label>
      </div></section>
      <section className="rounded-2xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">จัดส่งถึงที่อยู่ผู้รับ</h2><p className="mb-3">สินค้าทั่วไป ค่าส่งเหมา <strong>50 บาทต่อออเดอร์</strong></p><p className="mb-3">VAT 7% คิดจากยอดสินค้าและค่าจัดส่ง</p><p className="text-stone-500">จัดส่งพัสดุตามที่อยู่ที่ระบุ กรุณาตรวจสอบข้อมูลผู้รับให้ครบถ้วน</p><button type="button" disabled={busy} onClick={()=>void calculate()} className="mt-6 rounded-xl border border-slate-300 px-6 py-3 disabled:opacity-40">{busy?'กำลังคำนวณ…':'ดูยอดรวม'}</button></section>
      <section className="rounded-2xl bg-white p-6"><h2 className="mb-4 text-xl font-bold">วิธีชำระเงิน</h2><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full rounded-lg bg-slate-100 p-3"><option value="PromptPay">พร้อมเพย์ QR</option><option value="Bank Transfer">โอนผ่านบัญชีธนาคาร</option></select></section></div>
      <aside className="h-fit rounded-2xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">สรุปรายการ</h2>{cart.items.map(i=><p key={i.product.id} className="mb-3">{i.product.name} × {i.quantity} {i.product.unit||'ชิ้น'}</p>)}
        <div className="my-5 space-y-4 border-y border-slate-300 py-5"><p className="flex justify-between"><span>ยอดสินค้า</span><span>฿{(validEstimate?.subtotal??cart.totalPrice()).toLocaleString('th-TH')}</span></p><p className="flex justify-between gap-4"><span>ค่าจัดส่ง</span><span>{validEstimate?.status==='priced'?'฿'+validEstimate.fee?.toLocaleString('th-TH'):'รอคำนวณ / ยืนยัน'}</span></p><p className="flex justify-between gap-4"><span>VAT 7% (สินค้า + ค่าส่ง)</span><span>{validEstimate?.status==='priced'?'฿'+validEstimate.vatAmount?.toLocaleString('th-TH',{minimumFractionDigits:2}):'รอยืนยันค่าส่ง'}</span></p><p className="flex justify-between text-xl font-bold"><span>ยอดรวม</span><span>{validEstimate?.status==='priced'?'฿'+validEstimate.total?.toLocaleString('th-TH'):'—'}</span></p></div>
        {validEstimate&&<p className="mb-4 text-amber-800">{validEstimate.reason}{validEstimate.distanceKm!==null?' (ประมาณ '+validEstimate.distanceKm.toFixed(2)+' กม.)':''}</p>}
        {validEstimate?.status==='quote'?<Link href="/contact" className="block rounded-xl border border-amber-500 p-4 text-center text-amber-800">ติดต่อร้านเพื่อขอค่าจัดส่ง — ยังไม่ชำระเงิน</Link>:<button type="button" disabled={busy} onClick={async()=>{if(validEstimate?.status==='priced'&&(validEstimate.expiresAt??0)>Date.now()){proceed(validEstimate);return;}const currentKey=key;const result=await calculate();if(latestKey.current!==currentKey){setError('ข้อมูลเปลี่ยน กรุณากดดำเนินการอีกครั้ง');return;}if(result?.status==='priced')proceed(result);}} className="w-full rounded-xl bg-rose-600 p-4 font-bold disabled:opacity-40">{busy?"กำลังคำนวณ…":"คำนวณยอดและไปชำระเงิน"}</button>}
        {error&&<p role="alert" className="mt-4 text-rose-700">{error}</p>}
      </aside>
    </div>}
  </main><Footer/></>;
}
