"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { CountryCodeSelect } from "./country-code-select";

const phoneSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number").max(15, "Enter a valid phone number"),
});

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const handleSendOTP = async (data: z.infer<typeof phoneSchema>) => {
    setLoading(true);
    setError("");
    setInfo("");
    const { error } = await supabase.auth.signInWithOtp({
      phone: `${countryCode}${data.phone}`,
    });
    if (error) {
      setError(error.message);
    } else {
      setPhoneNumber(data.phone);
      setOtpSent(true);
      setInfo(`OTP sent to ${countryCode} ${data.phone}`);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (data: z.infer<typeof otpSchema>) => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      phone: `${countryCode}${phoneNumber}`,
      token: data.otp,
      type: "sms",
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleEmailLogin = async (data: z.infer<typeof emailSchema>) => {
    setLoading(true);
    setError("");
    setInfo("");

    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before signing in.");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Don't have an account? Sign up first.");
      } else {
        setError(error.message);
      }
    } else if (result.session) {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to Zameen</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md p-3 text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-md p-3 text-sm" style={{ background: "#F0F7FF", color: "#006AFF" }}>
            {info}
          </div>
        )}

        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone" className="gap-2">
              <Phone className="h-4 w-4" /> Phone
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" /> Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone" className="mt-4">
            {!otpSent ? (
              <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
                    <Input
                      id="phone"
                      placeholder="Phone number"
                      {...phoneForm.register("phone")}
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-sm text-red-500">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full text-white" style={{ background: "#006AFF" }} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                <p className="text-sm" style={{ color: "#585858" }}>
                  OTP sent to {countryCode} {phoneNumber}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="6-digit OTP"
                    maxLength={6}
                    {...otpForm.register("otp")}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-sm text-red-500">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full text-white" style={{ background: "#006AFF" }} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify OTP
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setOtpSent(false); setError(""); setInfo(""); }}
                >
                  Change Number
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <form onSubmit={emailForm.handleSubmit(handleEmailLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  {...emailForm.register("password")}
                />
                {emailForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full text-white" style={{ background: "#006AFF" }} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-6">
          <Separator />
          <p className="my-3 text-center text-sm text-muted-foreground">or continue with</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => handleSocialLogin("google")}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
          <Button variant="outline" onClick={() => handleSocialLogin("facebook")}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium hover:underline" style={{ color: "#006AFF" }}>
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
