import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    const order = await prisma.order.findUnique({
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

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load order",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

if (session.role !== "SUPER_ADMIN") {
  return NextResponse.json(
    {
      success: false,
      error: "Forbidden",
    },
    {
      status: 403,
    }
  );
}

    const { id } = await context.params;
    const body = await req.json();

    const {
  recipientName,
  recipientEmail,
  recipientPhone,
  shippingAddress,
  shippingPostalCode,
  total,
  createdAt,
} = body;

    // ตรวจ Order ก่อน
    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // ตรวจ Total
    const parsedTotal = Number(total);

    if (!Number.isFinite(parsedTotal) || parsedTotal < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid total",
        },
        { status: 400 }
      );
    }

    if(existingOrder.shippingMethod !== 'legacy' && parsedTotal !== Math.round((existingOrder.itemsSubtotal+existingOrder.shippingFee+existingOrder.vatAmount)*100)/100) return NextResponse.json({error:'ยอดรวมต้องเท่ากับยอดสินค้า ค่าจัดส่ง และ VAT ที่บันทึกไว้'},{status:400});
    // ตรวจวันเวลา
    const parsedCreatedAt = new Date(createdAt);

    if (Number.isNaN(parsedCreatedAt.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date/time",
        },
        { status: 400 }
      );
    }

    // แก้ Customer + Order พร้อมกัน
    // ======================================================
// แก้เฉพาะ Order Shipping Snapshot
// ไม่แก้ Customer Profile
// ======================================================

const result = await prisma.order.update({
  where: {
    id,
  },

  data: {
    recipientName,
    recipientEmail,
    recipientPhone,
    shippingAddress,
    shippingPostalCode,

    total: parsedTotal,
    createdAt: parsedCreatedAt,
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
      order: result,
    });

  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
      },
      { status: 500 }
    );
  }
}
