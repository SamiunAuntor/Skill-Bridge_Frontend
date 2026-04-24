type BrandLogoProps = {
  className?: string;
  skillClassName?: string;
  bridgeClassName?: string;
};

export default function BrandLogo({
  className,
  skillClassName,
  bridgeClassName,
}: BrandLogoProps) {
  return (
    <span className={["font-headline font-black tracking-tight", className].filter(Boolean).join(" ")}>
      <span className={["text-primary", skillClassName].filter(Boolean).join(" ")}>Skill</span>
      <span className={["text-secondary", bridgeClassName].filter(Boolean).join(" ")}>Bridge</span>
    </span>
  );
}
