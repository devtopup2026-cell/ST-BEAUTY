export type ShippingMethod='pickup'|'local'|'courier';
export type ShippingEstimate={status:'priced'|'quote';method:ShippingMethod;subtotal:number;fee:number|null;total:number|null;vatRate:number;vatAmount:number|null;distanceKm:number|null;reason:string;token?:string;expiresAt?:number};
