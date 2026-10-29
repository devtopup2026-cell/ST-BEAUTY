import {calculateOrderTotals} from './order-totals';
import type {ShippingMethod,ShippingEstimate} from '../types/shipping';
export type ShippingProduct={id:number;price:number;unit:string;stock:number;weightKg:number|null;requiresShippingQuote:boolean;name?:string;category?:string};
export type ShippingItem={productId:number;quantity:number};
export function priceShipping(input:{method:ShippingMethod;subtotal:number;distanceMeters:number|null;eligible:boolean;totalWeightKg:number|null;maxWeightKg:number;normalAccess:boolean;postalCode:string}):ShippingEstimate{
 const {method,subtotal}=input;
 if(!Number.isFinite(subtotal)||subtotal<0)throw Error('ยอดสินค้าไม่ถูกต้อง');
 const quote=(reason:string):ShippingEstimate=>({status:'quote',method,subtotal,fee:null,total:null,vatRate:0.07,vatAmount:null,distanceKm:null,reason});
 if(method!=='courier')return quote('ร้านรองรับการจัดส่งพัสดุเท่านั้น');

 return {status:'priced',method,...calculateOrderTotals(subtotal,50),distanceKm:null,reason:'สินค้าทั่วไป ค่าส่งเหมา 50 บาทต่อออเดอร์ คิด VAT 7% จากยอดสินค้าและค่าจัดส่ง'};
}
