export async function fetchOrderList<T>(signal: AbortSignal, request: typeof fetch = fetch): Promise<T[]> {
  for (let attempt=0; attempt<2; attempt++) {
    try {
      const res=await request('/api/order',{method:'GET',cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(30000)])});
      if ([502,503,504].includes(res.status) && attempt===0) {
        await new Promise(resolve=>setTimeout(resolve,1000));
        if(signal.aborted) throw new DOMException('Aborted','AbortError');
        continue;
      }
      if(!res.ok) throw new OrderLoadError(res.status===401?'กรุณาเข้าสู่ระบบแอดมินใหม่':'โหลดรายการออเดอร์ไม่สำเร็จ กรุณาลองใหม่');
      const data=await res.json();
      if(!data.success || !Array.isArray(data.orders)) throw new OrderLoadError('ข้อมูลออเดอร์ไม่สมบูรณ์ กรุณาลองใหม่');
      return data.orders;
    } catch(error) {
      if(signal.aborted) throw error;
      if(error instanceof OrderLoadError) throw error;
      if(attempt===1) throw new OrderLoadError('เชื่อมต่อฐานข้อมูลไม่สำเร็จชั่วคราว กรุณาลองใหม่');
    }
  }
  throw new OrderLoadError('โหลดรายการออเดอร์ไม่สำเร็จ');
}
class OrderLoadError extends Error {}
