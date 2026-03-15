interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatBadge({ label, value, color }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center bg-[rgba(250,250,229,0.05)] border border-[rgba(250,250,229,0.15)] rounded-[4px] px-[14px] py-2 min-w-[80px]">
      <span
        className="text-base font-semibold"
        style={{ color: color ?? "#FAFAE5" }}
      >
        {value}
      </span>
      <span className="text-xs text-[rgba(250,250,229,0.6)] tracking-widest mt-0.5">
        {label}
      </span>
    </div>
  );
}
