import { Link } from "react-router-dom";

export default function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-6">
      <Link to="/" className="flex justify-center mb-4">
        <img
          src="https://i.ibb.co/chMhLF6T/steel-logo-transparent.png"
          alt="Steel Platform"
          className="h-25"
        />
      </Link>

      <h1 className="text-xl font-bold text-[#0F2854]">{title}</h1>

      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}