import Image from "next/image";
import logoDarkImg from "@/assets/logo-dark.png";
import logoImg from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  height?: number;
  priority?: boolean;
}

export default function Logo({ className, height = 32, priority }: LogoProps) {
  return (
    <>
      <Image
        src={logoImg}
        alt="WebTools Logo"
        height={height}
        priority={priority}
        className={cn("block h-8 w-auto object-contain dark:hidden", className)}
      />
      <Image
        src={logoDarkImg}
        alt="WebTools Logo"
        height={height}
        priority={priority}
        className={cn("hidden h-8 w-auto object-contain dark:block", className)}
      />
    </>
  );
}
