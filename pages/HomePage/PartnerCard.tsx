import Image from "next/image";
import Link from "next/link";

interface PartnerCardProps {
  name: string;
  logo: string;
  typeLabel: "مصنع" | "معرض" | "شركة";
  location?: string;
  href: string;
}

export default function PartnerCard({ name, logo, typeLabel, location, href }: PartnerCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-sm">
        <Image
          src={logo}
          alt={name}
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
      </div>
      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{name}</h3>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
        {typeLabel}
      </span>
      {location && (
        <span className="text-xs text-slate-500 line-clamp-1">{location}</span>
      )}
    </Link>
  );
}
