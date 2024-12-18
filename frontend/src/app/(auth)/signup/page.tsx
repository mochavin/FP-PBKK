"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { registerUser } from "../auth-service";
import { toast } from "react-hot-toast";
import { ChangeEvent } from "react";
import AuthForm from "@/components/AuthForm";

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
    <AuthForm
      title="Create an account"
      description="Enter your information below to create your account"
      submitText="Sign Up"
      fields={[
        {
          label: "Username",
          type: "text",
          id: "username",
          placeholder: "johndoe",
          value: username,
          onChange: (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
        },
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
          autoCapitalize: "none",
          autoComplete: "new-password",
          autoCorrect: "off",
        },
      ]}
      onSubmit={onSubmit}
      isMutating={isMutating}
      error={error ? "Registration failed. Please try again." : null}
      linkText="Log in"
      linkHref="/login"
      linkDescription="Already have an account?"
    />
  );
}