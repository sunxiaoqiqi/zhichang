import type { Metadata } from "next";
import "./globals.css";
import { AccountMenu } from "./components/account-menu";

export const metadata: Metadata = {
  title: "61职场沟通训练营｜26个真实职场场景",
  description:
    "从敢沟通、会协作到建立影响力，通过情境判断、课程阅读和即时反馈练习职场表达。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}<AccountMenu /></body>
    </html>
  );
}
