import {products} from '@/data/products';
export async function catalogProducts(){if(process.env.DEMO_CATALOG==='true')return products;const {prisma}=await import('./prisma');return prisma.product.findMany({orderBy:{id:'asc'}});}
export async function catalogProduct(slug:string){if(process.env.DEMO_CATALOG==='true')return products.find(p=>p.slug===slug);const {prisma}=await import('./prisma');return prisma.product.findUnique({where:{slug}});}
