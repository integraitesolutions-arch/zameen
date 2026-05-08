"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    description: "For individuals listing a few properties",
    features: ["Up to 3 listings", "Basic analytics", "Contact form", "Standard support"],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 999,
    yearlyPrice: 9990,
    description: "For new agents and small businesses",
    features: ["Up to 15 listings", "2 featured listings/month", "Advanced analytics", "Priority in search", "Email support"],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 2999,
    yearlyPrice: 29990,
    description: "For established agents and builders",
    features: ["Up to 50 listings", "10 featured listings/month", "Verified badge", "Priority support", "Lead analytics", "Custom profile page"],
    cta: "Go Professional",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 9999,
    yearlyPrice: 99990,
    description: "For large builders and agencies",
    features: ["Unlimited listings", "50 featured listings/month", "Verified badge", "Dedicated account manager", "API access", "Bulk upload", "White-label options"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const supabase = createClient();

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return;
    if (planId === "enterprise") {
      toast.info("Contact us at enterprise@zameen.in for custom plans");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    // In production, this would create a Razorpay order via API route
    toast.info("Payment integration coming soon! Contact us to get started.");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-heading text-3xl font-bold md:text-4xl" style={{ color: "#2A2A33" }}>
          Simple, Transparent Pricing
        </h1>
        <p className="mt-3 text-base" style={{ color: "#585858" }}>
          Choose the plan that fits your business. Upgrade or downgrade anytime.
        </p>

        {/* Toggle */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-xl p-1" style={{ background: "#f7f7f7" }}>
          <button
            onClick={() => setYearly(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{ background: !yearly ? "#ffffff" : "transparent", color: !yearly ? "#2A2A33" : "#869099", boxShadow: !yearly ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{ background: yearly ? "#ffffff" : "transparent", color: yearly ? "#2A2A33" : "#869099", boxShadow: yearly ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
          >
            Yearly <span className="text-xs" style={{ color: "#00A652" }}>Save 17%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden ${plan.popular ? "ring-2" : ""}`}
            style={{ borderColor: plan.popular ? "#006AFF" : "#e0e0e0" }}
          >
            {plan.popular && (
              <div className="absolute right-4 top-4">
                <Badge className="text-white text-xs" style={{ background: "#006AFF" }}>Most Popular</Badge>
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-bold" style={{ color: "#2A2A33" }}>{plan.name}</h3>
              <p className="mt-1 text-xs" style={{ color: "#869099" }}>{plan.description}</p>

              <div className="mt-4">
                <span className="font-heading text-3xl font-bold" style={{ color: "#2A2A33" }}>
                  {plan.price === 0 ? "Free" : `₹${(yearly ? plan.yearlyPrice / 12 : plan.price).toLocaleString("en-IN")}`}
                </span>
                {plan.price > 0 && <span className="text-sm" style={{ color: "#869099" }}>/month</span>}
                {yearly && plan.price > 0 && (
                  <p className="text-xs" style={{ color: "#00A652" }}>
                    ₹{plan.yearlyPrice.toLocaleString("en-IN")}/year
                  </p>
                )}
              </div>

              <Button
                className="mt-6 w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
                style={plan.popular ? { background: "#006AFF" } : {}}
              >
                {plan.cta}
              </Button>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#585858" }}>
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#00A652" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
