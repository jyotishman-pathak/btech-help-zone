import "../globals.css";

import { Providers } from "../providers";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 dark:bg-zinc-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}