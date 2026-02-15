import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { IconButton } from '@/components/UI/Buttons/Button';

const ContactHelp: React.FC = () => {
  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-40">
      <IconButton
        aria-label="open chat"
        title="محادثة"
        size="lg"
        variant="ghost"
        className="rounded-full bg-white/85 backdrop-blur-md border border-slate-200 shadow-[0_10px_30px_rgba(10,30,51,0.12)] hover:shadow-[0_12px_36px_rgba(10,30,51,0.16)]"
        icon={<MessageCircle className="w-6 h-6 text-primary" />}
      />
      <IconButton
        aria-label="open whatsapp"
        title="واتساب"
        size="lg"
        className="rounded-full bg-[#25D366] border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.16)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
        icon={
          <Image
            src="/icons/whatsapp.svg"
            alt="واتساب"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        }
      />
    </div>
  );
};

export default React.memo(ContactHelp);