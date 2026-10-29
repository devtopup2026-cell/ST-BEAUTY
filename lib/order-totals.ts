export function calculateOrderTotals(subtotal:number,shippingFee:number){
  if(!Number.isFinite(subtotal)||!Number.isFinite(shippingFee)||subtotal<0||shippingFee<0)throw Error('ยอดเงินไม่ถูกต้อง');
  const subtotalCents=Math.round(subtotal*100),shippingCents=Math.round(shippingFee*100);
  const vatCents=Math.round((subtotalCents+shippingCents)*7/100);
  return {subtotal:subtotalCents/100,fee:shippingCents/100,vatRate:0.07,vatAmount:vatCents/100,total:(subtotalCents+shippingCents+vatCents)/100};
}
