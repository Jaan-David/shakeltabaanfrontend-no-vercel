interface FooterColumnProps {
  title: string;
  children: React.ReactNode;
}

export default function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      {children}
    </div>
  );
}
