import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIレシピ秘書",
  description: "あなただけのAIレシピ秘書",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
