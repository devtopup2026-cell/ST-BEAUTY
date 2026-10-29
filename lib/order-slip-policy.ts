export function canAttachOrderSlip(order:{customerId:string;status:string;paymentSlip:string|null},customerId:string){
 return order.customerId===customerId && order.status==='Pending Payment' && !order.paymentSlip;
}
