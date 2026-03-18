import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, mobile } = await req.json();

  const orderId = "ORD" + Date.now(); // unique

  const formData = new URLSearchParams();
  formData.append("customer_mobile", mobile);
  formData.append("user_token", process.env.XTRA_USER_TOKEN!);
  formData.append("amount", amount.toString());
  formData.append("order_id", orderId);
  formData.append("redirect_url", `${process.env.NEXT_PUBLIC_BASE_URLU}/wallet/payment-complete`);
  formData.append("remark1", "wallet-topup");
  formData.append("remark2", "upi");

  const resp = await fetch("https://xyzpay.site/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const data = await resp.json();

  if (!data.status) {
    return NextResponse.json({ success: false, message: data.message });
  }

  return NextResponse.json({
    success: true,
    paymentUrl: data.result.payment_url,
    orderId: orderId,
  });
}
