import {shippingQuoteReason} from './bulky-products';
export function parseShippingProduct(body:{weightKg?:unknown;requiresShippingQuote?:unknown;name?:unknown;category?:unknown}){
  if(body.weightKg!==undefined&&body.weightKg!==null&&typeof body.weightKg!=='string'&&typeof body.weightKg!=='number')throw Error('น้ำหนักไม่ถูกต้อง');
  const weightKg=body.weightKg===undefined||body.weightKg===null||body.weightKg===''?null:Number(body.weightKg);
  if(weightKg!==null&&(!Number.isFinite(weightKg)||weightKg<=0))throw Error('น้ำหนักต้องมากกว่า 0 หรือเว้นว่าง');
  if(body.requiresShippingQuote!==undefined&&typeof body.requiresShippingQuote!=='boolean')throw Error('เงื่อนไขจัดส่งไม่ถูกต้อง');
  return {weightKg,requiresShippingQuote:false};
}
