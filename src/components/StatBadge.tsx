interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatBadge({ label, value, color }: StatBadgeProps) {
  return (
    <div className="stat-badge">
      <span className="stat-badge-value" style={color ? { color } : undefined}>
        {value}
      </span>
      <span className="stat-badge-label">{label}</span>
    </div>
  );
}
