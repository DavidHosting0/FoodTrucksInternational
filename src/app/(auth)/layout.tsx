import Image from "next/image";
import { FigLogo } from "@/components/brand/fig-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div className="relative h-44 w-full overflow-hidden sm:h-56">
        <Image
          src="/brand/fig-banner.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-2">
          <FigLogo priority className="w-40 drop-shadow-[0_0_24px_rgba(45,255,156,0.35)] sm:w-48" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-6">
        <p className="mb-6 text-center text-sm text-muted-foreground">
          FIG Finance — deine Ausgaben im Griff
        </p>
        {children}
      </div>
    </div>
  );
}
