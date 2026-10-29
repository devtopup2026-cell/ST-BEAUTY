export const productUnits = ['ชิ้น','ขวด','หลอด','กระปุก','ตลับ','แท่ง','ซอง','กล่อง','ตัว','เรือน','เส้น','วง','คู่','ชุด','ใบ'] as const;
export function normalizeUnit(value: unknown): string | null {
  if(value === undefined) return 'ชิ้น';
  if(typeof value !== 'string') return null;
  return (productUnits as readonly string[]).includes(value.trim()) ? value.trim() : null;
}
