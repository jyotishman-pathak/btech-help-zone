export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {children}
    </div>
  );
}