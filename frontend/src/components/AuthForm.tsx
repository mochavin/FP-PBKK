"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  title: string;
  description: string;
  submitText: string;
  fields: {
    label: string;
    type: "text" | "email" | "password";
    id: string;
    placeholder?: string;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoComplete?: string;
    autoCorrect?: "on" | "off";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isMutating: boolean;
  error: any;
  extraContent?: ReactNode;
  linkText: string;
  linkHref: string;
  linkDescription: string;
}

export default function AuthForm({
  title,
  description,
  submitText,
  fields,
  onSubmit,
  isMutating,
  error,
  extraContent,
  linkText,
  linkHref,
  linkDescription,
}: AuthFormProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {extraContent}
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label
                    htmlFor={field.id}
                    className="text-sm font-medium leading-none"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                    autoCapitalize={field.autoCapitalize}
                    autoComplete={field.autoComplete}
                    autoCorrect={field.autoCorrect}
                    required
                  />
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={isMutating}>
                {isMutating ? `${submitText}...` : submitText}
              </Button>
            </div>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
          )}
          <div className="mt-4 text-center text-sm">
            {linkDescription}{" "}
            <Link href={linkHref} className="underline">
              {linkText}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
