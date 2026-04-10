export default function AuthStepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-6">
        {children}
      </div>
    </div>
  );
}