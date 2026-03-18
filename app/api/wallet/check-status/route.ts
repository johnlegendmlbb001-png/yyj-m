import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";   // ✅ Your correct path
import User from "@/models/User";            // Make sure this path is correct

export async function POST(req: Request) {
  try {
    await connectDB(); // 🔥 required for DB operations

    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId or userId" },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append("user_token", process.env.XTRA_USER_TOKEN!);
    formData.append("order_id", orderId);

    const resp = await fetch("https://xyzpay.site/api/check-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await resp.json();
    console.log("Gateway Response:", data);

    // 💳 Gateway success logic
    const gatewaySuccess =
      data?.status == true ||
      data?.result?.txnStatus == "COMPLETED" ||
      data?.result?.txnStatus == "SUCCESS";

    if (!gatewaySuccess) {
      return NextResponse.json({
        success: false,
        message: "Payment Pending or Failed",
      });
    }

    const amount = Number(data?.result?.amount || 0);

    if (!amount) {
      return NextResponse.json({
        success: false,
        message: "Invalid amount",
      });
    }

    // 💰 Update User Wallet
    const user = await User.findOne({ userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.wallet = (user.wallet || 0) + amount;
    user.order = (user.order || 0) + 1;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment Successful",
      amount,
      newWallet: user.wallet,
    });
  } catch (error) {
    console.error("Check-status error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
