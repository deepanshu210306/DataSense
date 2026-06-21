export function getSidebarBar(isLight: boolean) {
  return {
    bg: isLight ? "bg-[#f0f2f6]" : "bg-[#0a0a0c]",
    border: isLight ? "border-neutral-200/90" : "border-white/[0.07]",
    text: isLight ? "text-neutral-900" : "text-neutral-100",
    muted: isLight ? "text-neutral-500" : "text-neutral-500",
    hover: isLight ? "hover:bg-black/[0.05]" : "hover:bg-white/[0.06]",
    pill: isLight
      ? "bg-black/[0.05] hover:bg-black/[0.08]"
      : "bg-white/[0.07] hover:bg-white/[0.1]",
    ghost: isLight ? "hover:bg-black/[0.05]" : "hover:bg-white/[0.06]",
    active: isLight ? "bg-black/[0.07]" : "bg-white/[0.09]",
  };
}

export type SidebarBar = ReturnType<typeof getSidebarBar>;
