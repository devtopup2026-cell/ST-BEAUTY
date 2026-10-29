"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import {fetchOrderList} from '@/lib/load-orders';

export function useAdminOrders<T>(){
  const [orders,setOrders]=useState<T[]>([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const pending=useRef<AbortController|null>(null);
  const loadOrders=useCallback(async()=>{
    pending.current?.abort();
    const controller=new AbortController();pending.current=controller;
    setLoading(true);setLoadError('');
    try{const data=await fetchOrderList<T>(controller.signal);if(!controller.signal.aborted)setOrders(data);}
    catch(error){if(!controller.signal.aborted)setLoadError(error instanceof Error?error.message:'โหลดข้อมูลไม่สำเร็จ');}
    finally{if(!controller.signal.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{void loadOrders();return()=>pending.current?.abort();},[loadOrders]);
  return {orders,setOrders,loading,loadError,loadOrders};
}
