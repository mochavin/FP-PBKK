"use client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import type { LoginResponse } from "../../../types/auth";
import toast from "react-hot-toast";
import GoogleSignInButton from "../../../components/GoogleSignInButton";
import { ChangeEvent } from "react";
import AuthForm from "../../../components/AuthForm";
import { loginUser } from "../auth-service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (Cookies.get("token")) {
      router.replace("/boards");
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
    <AuthForm
      title="Login to your account"
      description="Enter your email below to login to your account"
      submitText="Sign In"
      fields={[
        {
          label: "Email",
          type: "email",
          id: "email",
          placeholder: "m@example.com",
          value: email,
          onChange: (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
        },
        {
          label: "Password",
          type: "password",
          id: "password",
          value: password,
          onChange: (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
        },
      ]}
      onSubmit={onSubmit}
      isMutating={isMutating}
      error={error ? "Login failed. Please check your credentials." : null}
      extraContent={<div className="flex items-center justify-center w-full mb-4">
        <GoogleSignInButton />
      </div>}
      linkText="Sign up"
      linkHref="/signup"
      linkDescription="Don't have an account?"
    />
  );
}
