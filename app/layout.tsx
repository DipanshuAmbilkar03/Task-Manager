import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager — Daily Tasks",
  description:
    "Manage daily tasks: create, track status, filter, edit and delete.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-stone-200 font-sans text-stone-800 antialiased">
        {children}
      </body>
    </html>
  );
}
