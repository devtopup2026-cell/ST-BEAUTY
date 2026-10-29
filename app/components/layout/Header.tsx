"use client";
import Link from 'next/link';
import {Suspense,useEffect,useState} from 'react';
import {Menu,X,ShoppingCart,UserRound,Sparkles} from 'lucide-react';
import BrandLogo from '../BrandLogo';
import SearchBox from '../ui/SearchBox';
import {useCart} from '@/store/cart.store';
const links=[['หน้าแรก','/'],['สินค้าทั้งหมด','/products'],['โปรโมชั่น','/promotions'],['ติดต่อเรา','/contact']];
export default function Header(){
 const [mounted,setMounted]=useState(false),[member,setMember]=useState(false),[open,setOpen]=useState(false);
 const count=useCart(s=>s.totalItems());
 useEffect(()=>{setMounted(true);const c=new AbortController();fetch('/api/customer/me',{cache:'no-store',signal:c.signal}).then(async r=>{const d=await r.json();setMember(r.ok&&d.success&&!!d.customer);}).catch(()=>{});return()=>c.abort();},[]);
 return <header className="sticky top-0 z-50 shadow-sm"><div className="bg-[#71384f] text-[11px] text-stone-100"><div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-2.5"><Sparkles size={12}/> Beauty · Fashion · Brandname — สไตล์ที่เป็นคุณ</div></div><div className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4"><Link href="/" aria-label="STV BEAUTY หน้าแรก"><BrandLogo/></Link><div className="hidden flex-1 px-7 lg:block"><Suspense fallback={<div className="h-11 rounded-lg bg-slate-100"/>}><SearchBox/></Suspense></div><div className="flex items-center gap-5"><Link href={member?'/account':'/login'} className="hidden items-center gap-2 text-sm font-semibold text-[#71384f] sm:flex"><UserRound size={21}/>{member?'บัญชีของฉัน':'เข้าสู่ระบบ'}</Link><Link href="/cart" aria-label="ตะกร้าสินค้า" className="relative rounded-xl bg-rose-50 p-3 text-[#a34f65]"><ShoppingCart size={23}/>{mounted&&count>0&&<span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#71384f] px-1 text-[11px] leading-5 text-white">{count}</span>}</Link><button className="rounded-lg border border-slate-200 p-2 lg:hidden" aria-label={open?'ปิดเมนู':'เปิดเมนู'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button></div></div></div>
 <nav className="hidden border-b border-slate-200 bg-white lg:block" aria-label="เมนูหลัก"><div className="mx-auto flex max-w-7xl items-center justify-between px-5"><div className="flex items-center gap-9">{links.map(([label,href])=><Link key={href} href={href} className="border-b-2 border-transparent py-3 text-sm font-semibold text-[#71384f] transition hover:border-rose-500 hover:text-rose-700">{label}</Link>)}</div><span className="text-xs text-slate-500">Beauty · Fashion · Brandname</span></div></nav>
 {open&&<div className="border-b border-slate-200 bg-white p-5 lg:hidden"><Suspense fallback={null}><SearchBox/></Suspense><nav className="mt-4 grid gap-1">{[...links,[member?'บัญชีของฉัน':'เข้าสู่ระบบ',member?'/account':'/login']].map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="rounded-lg px-2 py-3 text-[#71384f] hover:bg-rose-50">{label}</Link>)}</nav></div>}
 </header>;
}
