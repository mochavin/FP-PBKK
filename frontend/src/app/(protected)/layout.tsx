"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LogoutButton } from "@/components/logout-button";
import { UserProvider, useUser } from "@/contexts/user-context";
import { LoadingState } from "@/components/LoadingState";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Kanban</h1>
            <div className="flex items-center gap-4">
              {user && <span>Welcome, <strong>{user.username}</strong></span>}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <AuthGuard>
        <Layout>{children}</Layout>
      </AuthGuard>
    </UserProvider>
  );
}
