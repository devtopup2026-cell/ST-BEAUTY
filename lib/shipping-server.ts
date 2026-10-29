import type {ShippingItem,ShippingProduct} from './shipping-policy';
import {priceShipping} from './shipping-policy';
import {signShipping,shippingFingerprint} from './shipping-token';
import type {ShippingMethod} from '@/types/shipping';
import {store} from './store-config';
import {shippingQuoteReason} from './bulky-products';

export function fingerprintShipping(memberId:string,items:ShippingItem[],products:ShippingProduct[],address:string,postalCode:string,method:ShippingMethod,normalAccess:boolean){return shippingFingerprint({policyVersion:'bloom-parcel-v1',memberId,method,normalAccess,address:address.trim(),postalCode:postalCode.trim(),items:[...items].sort((a,b)=>a.productId-b.productId).map(item=>{const p=products.find(p=>p.id===item.productId)!;return {id:p.id,quantity:item.quantity,price:p.price,unit:p.unit,weight:p.weightKg,quote:false};})});}
export async function estimateShipping(input:{memberId:string;items:ShippingItem[];products:ShippingProduct[];address:string;postalCode:string;method:ShippingMethod;normalAccess:boolean},request:typeof fetch=fetch){
  const {items,products}=input;
  const subtotal=Math.round(items.reduce((sum,i)=>sum+products.find(p=>p.id===i.productId)!.price*i.quantity,0)*100)/100;
  const eligible=true;
  const totalWeightKg=products.every(p=>p.weightKg!==null&&p.weightKg>0)?items.reduce((sum,i)=>sum+products.find(p=>p.id===i.productId)!.weightKg!*i.quantity,0):null;
  const maxWeightKg=Number(process.env.SHIPPING_MAX_WEIGHT_KG);
  const base={method:input.method,subtotal,eligible,totalWeightKg,maxWeightKg,normalAccess:input.normalAccess,postalCode:input.postalCode};
  let estimate=priceShipping({...base,distanceMeters:null});
  if(estimate.status!=='priced')return estimate;
  const expiresAt=Date.now()+10*60*1000;
  const token=signShipping({...estimate,version:1,memberId:input.memberId,fingerprint:fingerprintShipping(input.memberId,items,products,input.address,input.postalCode,input.method,input.normalAccess),expiresAt});
  return {...estimate,expiresAt,token};
}
