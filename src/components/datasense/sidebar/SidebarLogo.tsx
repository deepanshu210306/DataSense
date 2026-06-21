import Image from "next/image";
import { cn } from "@/lib/utils";

type SidebarLogoProps = {
  size?: number;
  className?: string;
};

export function SidebarLogo({ size = 28, className }: SidebarLogoProps) {
  return (
    <Image
      src="/favicon.ico"
      alt="DataSense"
      width={size}
      height={size}
      className={cn("rounded-md object-contain", className)}
      unoptimized
      priority
    />
  );
}
