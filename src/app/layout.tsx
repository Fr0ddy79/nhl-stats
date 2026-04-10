import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NHL Stats",
  description: "Live NHL schedule, scores, and standings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fff", color: "#1a1a1a" }}>{children}</body>
    </html>
  );
}
