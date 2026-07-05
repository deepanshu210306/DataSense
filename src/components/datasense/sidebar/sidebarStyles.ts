export function getSidebarBar(isLight: boolean) {
  return {
    bg: isLight ? "bg-[#f1f2f7]" : "bg-[#0c0c12]",
    border: isLight ? "border-neutral-200/80" : "border-white/[0.06]",
    text: isLight ? "text-neutral-800" : "text-neutral-200",
    muted: isLight ? "text-neutral-500" : "text-neutral-500",
    hover: isLight ? "hover:bg-black/[0.04]" : "hover:bg-white/[0.05]",
    pill: isLight
      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-500"
      : "bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-400",
    ghost: isLight ? "hover:bg-black/[0.04]" : "hover:bg-white/[0.05]",
    active: isLight
      ? "bg-indigo-500/10 text-indigo-700"
      : "bg-indigo-500/15 text-indigo-200",
  };
}

export type SidebarBar = ReturnType<typeof getSidebarBar>;
