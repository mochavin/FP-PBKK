"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogoutButton } from "@/components/logout-button";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
