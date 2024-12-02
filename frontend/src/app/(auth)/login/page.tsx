"use client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { loginUser } from "@/lib/api";
import type { LoginResponse } from "@/types/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (Cookies.get('token')) {
      router.replace('/boards');
    }
  }, [router]);

  const { trigger, isMutating, error } = useSWRMutation("/auth/login", () =>
    loginUser({ email, password })
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const loadingToast = toast.loading("Logging in...");

    try {
      const data: LoginResponse = await trigger();
      Cookies.set("token", data.token, { expires: 7, secure: true });
      toast.dismiss(loadingToast);
      toast.success("Login successful!");
      router.push("/boards");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Login failed. Please check your credentials.");
      console.log("Login failed:", err);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isMutating}>
                {isMutating ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-4 text-center">
              Login failed. Please check your credentials.
            </p>
          )}
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
