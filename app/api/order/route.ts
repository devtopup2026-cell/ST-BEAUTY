import {calculateOrderTotals} from '@/lib/order-totals';
import {verifyShipping} from '@/lib/shipping-token';
import {fingerprintShipping} from '@/lib/shipping-server';
import {paymentSettings} from '@/lib/payment-policy';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getCustomerSession } from "@/lib/customer-session";

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// ======================================================
// POST - Create Order
// ======================================================

export async function POST(req: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  const settings = paymentSettings(process.env);
  const testMode = settings.mode === 'test';
  if (settings.mode === 'closed') {
    return NextResponse.json({error:'ร้านยังไม่เปิดรับชำระเงินออนไลน์ กรุณาติดต่อร้าน'}, {status:503});
  }
  try {
    const body = await req.json();

    const member = await getCustomerSession();
    if (!member) return NextResponse.json({error:'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'}, {status:401});

const {
  id: requestedId,
  customer,
  items,
  total,
  paymentMethod: requestedPaymentMethod,
  paymentSlip: requestedSlip,
} = body;

    if(typeof requestedId !== 'string' || !/^[A-Za-z0-9-]{1,100}$/.test(requestedId) || requestedId.startsWith('TEST-')) return NextResponse.json({error:'Invalid order ID'},{status:400});
    if(testMode && body.testAcknowledged !== true) return NextResponse.json({error:'กรุณายืนยันว่าเป็นการทดสอบ'},{status:400});
    if(!testMode && (!['PromptPay','Bank Transfer'].includes(requestedPaymentMethod) || (requestedSlip != null && (typeof requestedSlip !== 'string' || !requestedSlip.startsWith('https://res.cloudinary.com/'))))) return NextResponse.json({error:'Invalid payment information'},{status:400});
    const id = testMode ? 'TEST-'+requestedId : requestedId;
    const paymentMethod = testMode ? 'TEST — ไม่มีการรับเงินจริง' : requestedPaymentMethod;
    const paymentSlip = typeof requestedSlip === 'string' && requestedSlip.startsWith('https://res.cloudinary.com/') ? requestedSlip : null;
    // ตรวจข้อมูลเบื้องต้น

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // ======================================================
// ป้องกัน Order ซ้ำ
// ======================================================

const existingOrder = await prisma.order.findUnique({
  where: {
    id,
  },
});

if (existingOrder) {
  return NextResponse.json(
    {
      success: false,
      error: "Order already exists",
    },
    {
      status: 409,
    }
  );
}


    if (!customer || ![customer.fullname,customer.phone,customer.address,customer.postalCode].every(v => typeof v === "string" && v.trim())) {
      return NextResponse.json(
        { error: "Customer information is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 100 || items.some(item => !item || !Number.isInteger(item.productId))) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      );
    }


    // ======================================================
    // ตรวจว่าสินค้าทั้งหมดมีอยู่ใน Database
    // ======================================================

    const productIds = items.map(
      (item: { productId: number }) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products were not found" },
        { status: 400 }
      );
    }

    // ======================================================
// ตรวจ Quantity + ใช้ราคาจริงจาก Database
// ======================================================

const validatedItems = [];

for (const item of items) {
  const product = products.find(
    (product) => product.id === item.productId
  );

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 400 }
    );
  }

  const quantity = Number(item.quantity);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return NextResponse.json(
      { error: "Invalid product quantity" },
      { status: 400 }
    );
  }

  if (quantity > product.stock) {
    return NextResponse.json(
      {
        error: `${product.name} มีสินค้าไม่เพียงพอ`,
      },
      { status: 400 }
    );
  }

  validatedItems.push({
    productId: product.id,
    quantity,
    price: product.price,
    unit: product.unit,
  });
}

const calculatedTotal = validatedItems.reduce(
  (sum, item) =>
    sum + item.price * item.quantity,
  0
);


    // ======================================================
    // สร้าง / หา Customer
    // ======================================================

const shipping = verifyShipping(body.shippingToken);
if(!shipping||shipping.memberId!==member.id||shipping.method!=='courier'||shipping.fingerprint!==fingerprintShipping(member.id,validatedItems,products,customer.address,customer.postalCode,shipping.method,body.normalAccess===true)||shipping.subtotal!==Math.round(calculatedTotal*100)/100||typeof shipping.fee!=='number'||!Number.isFinite(shipping.fee)||shipping.fee<0||shipping.fee!==50||shipping.vatRate!==0.07||shipping.vatAmount!==calculateOrderTotals(calculatedTotal,50).vatAmount||shipping.total!==calculateOrderTotals(calculatedTotal,50).total) return NextResponse.json({error:'ข้อมูลค่าส่งหมดอายุหรือสินค้า/ที่อยู่เปลี่ยน กรุณากลับไปคำนวณใน Checkout ใหม่'},{status:409});
const savedCustomer = member;

    // สร้าง Order + OrderItem
    // ======================================================

    const order = await prisma.order.create({
  data: {
    id,

    customerId: savedCustomer.id,

    // ======================================================
    // Shipping Snapshot
    // เก็บข้อมูลผู้รับ ณ เวลาที่สร้าง Order
    // ======================================================

    recipientName: customer.fullname,
    recipientEmail: member.email,
    recipientPhone: customer.phone,
    shippingAddress: customer.address,
    shippingPostalCode: customer.postalCode,

    total: shipping.total,
    itemsSubtotal: Math.round(calculatedTotal*100)/100,
    shippingFee: shipping.fee,
    vatAmount: shipping.vatAmount,
    vatRate: shipping.vatRate,
    shippingMethod: shipping.method,

    paymentMethod,

    paymentSlip: paymentSlip || null,

    status: "Pending Payment",

    items: {
      create: validatedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
      })),
    },
  },

  include: {
    customer: true,

    items: {
      include: {
        product: true,
      },
    },
  },
});


    return NextResponse.json({
      success: true,
      order: {id: order.id, total: order.total, status: order.status},
    });

  } catch (error) {

    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 }
    );
  }
}


// ======================================================
// GET - Get All Orders
// ======================================================

export async function GET() {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {

    const session = await getAdminSession();

if (!session) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        customer: {select:{id:true,fullName:true,email:true,phone:true,address:true,postalCode:true}},

        items: {
          include: {
            product: true,
          },
        },
      },
    });


    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {

    console.error("GET ORDERS ERROR:", error);

    const transientCodes = ['P1001','P1002','P1008','P1017','P2024','P2028'];
    if(error && typeof error === 'object' && 'code' in error && transientCodes.includes(String(error.code))) {
      return NextResponse.json({success:false,error:'ฐานข้อมูลตอบกลับไม่ทันเวลา กรุณาลองโหลดใหม่'}, {status:503,headers:{'Retry-After':'1','Cache-Control':'no-store'}});
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}


// ======================================================
// PATCH - Update Order Status
// ======================================================

// ======================================================
// PATCH - Update Order Status
// ======================================================

export async function PATCH(req: Request) {
if(process.env.DEMO_CATALOG === "true") return new Response(JSON.stringify({success:false,error:"โหมดตัวอย่าง ยังไม่เปิดรับสมาชิกหรือคำสั่งซื้อ"}),{status:503,headers:{"Content-Type":"application/json"}});
  try {

    const session = await getAdminSession();

if (!session) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

    const body = await req.json();

    const {
      id,
      status,
    } = body;

    // ======================================================
    // ตรวจข้อมูล
    // ======================================================

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          error: "Order status is required",
        },
        {
          status: 400,
        }
      );
    }


    // ======================================================
    // Status ที่อนุญาต
    // ======================================================

    const allowedStatuses = [
      "Pending Payment",
      "Paid",
      "Shipping",
      "Completed",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid order status",
        },
        {
          status: 400,
        }
      );
    }


    // ======================================================
    // Transaction
    // ======================================================

const result = await prisma.$transaction(
  async (tx: TransactionClient) => {

      // หา Order พร้อมรายการสินค้า
      const existingOrder = await tx.order.findUnique({
        where: {
          id,
        },

        include: {
          items: true,
        },
        }
);


      if (!existingOrder) {
        throw new Error("ORDER_NOT_FOUND");
      }



      // ======================================================
      // ตรวจสอบการเปลี่ยน Order Status
      // ======================================================

      const allowedTransitions: Record<string, string[]> = {
      "Pending Payment": ["Paid", "Rejected"],
        "Paid": ["Shipping", "Rejected"],
        "Shipping": ["Completed"],
        "Completed": [],
        "Rejected": [],
      };

      if(status === 'Paid' && !existingOrder.id.startsWith('TEST-') && !existingOrder.paymentSlip) throw new Error('PAYMENT_SLIP_REQUIRED');
      const currentStatus = existingOrder.status;

      if (
        status !== currentStatus &&
        !allowedTransitions[currentStatus]?.includes(status)
      ) {
        throw new Error(
          `INVALID_STATUS_TRANSITION:${currentStatus}:${status}`
        );
      }

      // ======================================================
      // ป้องกันการ Approve ซ้ำ
      // ======================================================

      if (
        status === "Paid" &&
        existingOrder.status === "Paid"
      ) {
        return await tx.order.findUnique({
          where: {
            id,
          },

          include: {
            customer: true,

            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }


      // ======================================================
      // Pending Payment → Paid
      // ตัด Stock
      // ======================================================

      if(status !== existingOrder.status){
        const claim = await tx.order.updateMany({where:{id,status:existingOrder.status},data:{status}});
        if(claim.count !== 1) throw new Error('ORDER_CONFLICT');
      }

      if (
        existingOrder.status === "Pending Payment" &&
        status === "Paid"
      ) {

        for (const item of existingOrder.items) {

          // ลด Stock เฉพาะเมื่อ Stock เพียงพอ
          const updatedProduct =
            await tx.product.updateMany({
              where: {
                id: item.productId,

                stock: {
                  gte: item.quantity,
                },
              },

              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });


          // Stock ไม่พอ
          if (updatedProduct.count === 0) {
            throw new Error(
              `INSUFFICIENT_STOCK:${item.productId}`
            );
          }
        }
      }

      // ======================================================
// Paid → Rejected
// คืน Stock
// ======================================================

if (
  existingOrder.status === "Paid" &&
  status === "Rejected"
) {
  for (const item of existingOrder.items) {
    await tx.product.update({
      where: {
        id: item.productId,
      },

      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }
}


      // ======================================================
      // Update Order Status
      // ======================================================

      return await tx.order.update({
        where: {
          id,
        },

        data: {
          status,
        },

        include: {
          customer: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }, { maxWait: 15000, timeout: 30000 });


    return NextResponse.json({
      success: true,
      order: result,
    });

  } catch (error) {

    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );


    // ======================================================
    // Order ไม่พบ
    // ======================================================

    if (
      error instanceof Error &&
      error.message === "ORDER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }


    // ======================================================
    // Stock ไม่พอ
    // ======================================================

    if (
      error instanceof Error &&
      error.message.startsWith(
        "INSUFFICIENT_STOCK:"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "สินค้าใน Stock ไม่เพียงพอ",
        },
        {
          status: 400,
        }
      );
    }


    // ======================================================
    // เปลี่ยน Order Status ไม่ถูกต้อง
    // ======================================================

    if (
      error instanceof Error &&
      error.message.startsWith(
    "INVALID_STATUS_TRANSITION:"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "ไม่สามารถเปลี่ยนสถานะ Order แบบนี้ได้",
          },
          {
            status: 400,
          }
        );
      }


    // ======================================================
    // Error อื่น ๆ
    // ======================================================

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2028') {
      return NextResponse.json({error:'ฐานข้อมูลเริ่มหรือทำธุรกรรมไม่ทันเวลา กรุณารีเฟรชตรวจสถานะและสต็อกก่อนลองอีกครั้ง หากยังเกิดซ้ำให้ตรวจการเชื่อมต่อฐานข้อมูล'}, {status:503});
    }
    if(error instanceof Error && error.message === 'PAYMENT_SLIP_REQUIRED') return NextResponse.json({error:'ลูกค้ายังไม่ได้แนบสลิป กรุณารอหลักฐานก่อนอนุมัติ'},{status:409});
    if(error instanceof Error && error.message === 'ORDER_CONFLICT') return NextResponse.json({error:'ออเดอร์ถูกอัปเดตแล้ว กรุณารีเฟรชหน้า'},{status:409});
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order status",
      },
      {
        status: 500,
      }
    );
  }
}
