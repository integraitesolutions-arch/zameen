import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { plan_id, billing } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get plan
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", plan_id)
    .single();

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const amount = billing === "yearly" ? plan.price_yearly : plan.price_monthly;

  // In production: create Razorpay order
  // const Razorpay = require("razorpay");
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR" });

  // For now, create a pending payment record
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      type: "subscription",
      amount,
      status: "pending",
      metadata: { plan_id, billing },
    })
    .select()
    .single();

  return NextResponse.json({
    payment_id: payment?.id,
    amount,
    currency: "INR",
    plan: plan.name,
    // order_id: order.id, // Razorpay order ID
  });
}
