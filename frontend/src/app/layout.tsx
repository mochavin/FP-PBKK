import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import FontLoader from "./components/FontLoader";

export const metadata: Metadata = {
  title: "Trello Clone",
  description: "Trello clone made for PBKK Final Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FontLoader>
          {children}
          <Toaster />
        </FontLoader>
      </body>
    </html>
  );
}
