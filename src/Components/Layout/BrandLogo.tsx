import Image from "next/image";
import appIcon from "@/app/icon.png";

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
    <span
      className={[
        "inline-flex items-center gap-2 font-headline font-black tracking-tight",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={appIcon}
        alt=""
        width={747}
        height={482}
        className="h-[1.05em] w-auto rounded-[0.22em] object-contain"
        priority
      />
      <span>
        <span className={["text-primary", skillClassName].filter(Boolean).join(" ")}>
          Skill
        </span>
        <span
          className={["text-secondary", bridgeClassName].filter(Boolean).join(" ")}
        >
          Bridge
        </span>
      </span>
    </span>
  );
}
