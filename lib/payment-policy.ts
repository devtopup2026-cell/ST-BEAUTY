type PaymentEnvironment = { NODE_ENV?: string; PAYMENT_TEST_MODE?: string; NEXT_PUBLIC_PAYMENT_QR_URL?: string; NEXT_PUBLIC_PAYMENT_ACCOUNT_LABEL?: string };
export function paymentSettings(env: PaymentEnvironment) {
  if (env.PAYMENT_TEST_MODE === 'true' && env.NODE_ENV !== 'production') return {mode:'test' as const,image:'/icon.svg',accountLabel:'บัญชีทดสอบ STV BEAUTY'};
  if (env.NEXT_PUBLIC_PAYMENT_QR_URL?.trim()) return {mode:'live' as const,image:env.NEXT_PUBLIC_PAYMENT_QR_URL,accountLabel:env.NEXT_PUBLIC_PAYMENT_ACCOUNT_LABEL||''};
  return {mode:'closed' as const,image:'',accountLabel:''};
}
export function isTestOrder(id:string){return id.startsWith('TEST-');}
