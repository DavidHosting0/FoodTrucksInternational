import Image from "next/image";
import { cn } from "@/lib/utils";

export function FigLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/fig-logo.png"
      alt="FIG"
      width={320}
      height={160}
      priority={priority}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}

export function FigBrandMark({
  className,
  showTagline = true,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-10 w-[4.5rem] shrink-0">
        <Image
          src="/brand/fig-logo.png"
          alt="FIG"
          fill
          className="object-contain object-left"
          sizes="72px"
          priority
        />
      </div>
      {showTagline ? (
        <div className="min-w-0">
          <p className="text-base font-semibold leading-none tracking-tight">
            FIG Finance
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Personal finance</p>
        </div>
      ) : null}
    </div>
  );
}
