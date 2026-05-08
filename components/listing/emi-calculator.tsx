"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface EMICalculatorProps {
  propertyPrice: number;
}

export function EMICalculator({ propertyPrice }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(Math.round(propertyPrice * 0.8));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  const emi = monthlyRate > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
    : Math.round(loanAmount / months);

  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanAmount;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5" style={{ color: "#1a73e8" }} />
          <h3 className="font-heading text-base font-semibold" style={{ color: "#202124" }}>EMI Calculator</h3>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs" style={{ color: "#727785" }}>Loan Amount (₹)</Label>
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs" style={{ color: "#727785" }}>Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: "#727785" }}>Tenure (Years)</Label>
              <Input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="mt-4 rounded-lg p-4" style={{ background: "#e8f0fe" }}>
          <p className="text-xs font-medium" style={{ color: "#727785" }}>Monthly EMI</p>
          <p className="font-heading text-2xl font-bold" style={{ color: "#1a73e8" }}>
            {formatPrice(emi)}
          </p>
          <div className="mt-2 flex gap-4 text-xs" style={{ color: "#414754" }}>
            <span>Principal: {formatPrice(loanAmount)}</span>
            <span>Interest: {formatPrice(totalInterest)}</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "#727785" }}>
            Total: {formatPrice(totalPayment)} over {tenure} years
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
