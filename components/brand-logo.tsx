import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  light?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  href,
  light = false,
  compact = false,
  className = "",
}: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`grid size-11 place-items-center rounded-2xl ${
          light ? "bg-white/10 text-white" : "bg-[#20392e] text-[#fbf8ef]"
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-7" fill="none">
          <path
            d="M5.5 14.5 16 6l10.5 8.5M9 13.5V26h14V13.5M13 18h6m-6 4h6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="25.5" cy="7" r="3" fill="#ef9560" />
        </svg>
      </span>
      {!compact && (
        <span
          className={`text-[1.35rem] font-semibold tracking-[-0.055em] ${
            light ? "text-white" : "text-[#20392e]"
          }`}
        >
          Craft<span className={light ? "text-[#ef9560]" : "text-[#bd6845]"}>Desk</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="CraftDesk home" className="inline-flex">
      {content}
    </Link>
  );
}
