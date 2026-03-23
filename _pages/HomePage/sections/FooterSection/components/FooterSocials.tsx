import { Facebook, Instagram, Music2 } from "lucide-react";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/19RrLGxbAr/?mibextid=wwXIfr",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/shkelteaban?igsh=bmZtcnlnYWNtcmZj&utm_source=qr",
    icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@shak.el.taaban?_r=1&_t=ZS-94vjfcGEADZ",
    icon: Music2,
  },
];

export default function FooterSocials() {
  return (
    <div className="flex items-center gap-3">
      {socials.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-blue-400 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
        >
          <social.icon className="h-5 w-5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
