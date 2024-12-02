"use client";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from './ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/login');
  };

  return (
    <Button onClick={handleLogout} variant="ghost">
      Logout
    </Button>
  );
}