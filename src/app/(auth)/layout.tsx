export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#13161a]">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
