"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { registerUser } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { trigger, isMutating, error } = useSWRMutation("/auth/register", () =>
    registerUser({ username, email, password })
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const loadingToast = toast.loading("Creating account...");

    try {
      await trigger();
      router.push("/login");
      toast.dismiss(loadingToast);
      toast.success("Account created successfully!");
    } catch (err) {
      toast.error("Registration failed. Please try again.");
      toast.dismiss(loadingToast);
      console.log("Registration failed:", err);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your information below to create your account
            </p>
          </div>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium leading-none">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
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
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect="off"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isMutating}>
                {isMutating ? "Creating account..." : "Sign Up"}
              </Button>
            </div>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-4 text-center">
              Registration failed. Please try again.
            </p>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}