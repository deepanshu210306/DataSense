"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { BackgroundBlobs } from "./BackgroundBlobs";
import { ChatInput } from "./ChatInput";
import {
  MobileSidebarDrawer,
  MobileSidebarFab,
  Sidebar,
} from "./Sidebar";
import { MessageList } from "./MessageList";
import { SearchChatsDialog } from "./SearchChatsDialog";
import { WelcomeHero } from "./WelcomeHero";
import { useTheme } from "@/components/providers/ThemeProvider";

export function DataSenseApp() {
  const { theme } = useTheme();
  const { messages, isSending, sendMessage, reset } = useChat();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const hasConversation = messages.length > 0;

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          setSidebarCollapsed((c) => !c);
        } else {
          setMobileMenuOpen((o) => !o);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={
        theme === "dark"
          ? "relative flex h-dvh w-full overflow-hidden bg-gradient-to-b from-[#0b0b0e] via-[#09090c] to-[#070708] text-neutral-100"
          : "relative flex h-dvh w-full overflow-hidden bg-gradient-to-b from-[#f7f8fc] via-[#f2f4f9] to-[#eef1f8] text-neutral-900"
      }
    >
      <BackgroundBlobs />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onNewChat={() => {
          reset();
          toast.success("Started a new chat");
        }}
        onSearch={openSearch}
        onSettings={() =>
          toast.message("Settings", {
            description: "Preferences and workspace controls belong here.",
          })
        }
      />

      <MobileSidebarDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Sidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          onNewChat={() => {
            reset();
            setMobileMenuOpen(false);
            toast.success("Started a new chat");
          }}
          onSearch={() => {
            openSearch();
            setMobileMenuOpen(false);
          }}
          onSettings={() => {
            toast.message("Settings", {
              description: "Preferences and workspace controls belong here.",
            });
            setMobileMenuOpen(false);
          }}
          mobile
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </MobileSidebarDrawer>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-transparent">
          {hasConversation ? (
            <MessageList messages={messages} />
          ) : (
            <WelcomeHero />
          )}
          <ChatInput onSend={sendMessage} disabled={isSending} />
        </main>
      </div>

      <MobileSidebarFab
        onOpen={() => setMobileMenuOpen(true)}
        theme={theme}
      />

      <SearchChatsDialog open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
