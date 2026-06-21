"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { CHAT } from "@/lib/copy";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { useDatasets } from "@/hooks/useDatasets";
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

type DataSenseAppProps = {
  conversationId?: string;
};

export function DataSenseApp({ conversationId }: DataSenseAppProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [activeDatasetLabel, setActiveDatasetLabel] = useState<string | null>(
    null,
  );
  const { conversations, refresh: refreshConversations } = useConversations();
  const {
    datasets,
    loading: datasetsLoading,
    refresh: refreshDatasets,
  } = useDatasets();

  const { messages, isSending, isLoading, sendMessage, reset } = useChat({
    conversationId,
    resourceId,
    onDatasetResolved: (_id, label) => setActiveDatasetLabel(label),
    onConversationCreated: (id) => {
      router.replace(`/chat/${id}`);
      void refreshConversations();
    },
    onMessageComplete: () => {
      void refreshConversations();
    },
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const hasConversation = messages.length > 0;

  useEffect(() => {
    if (conversationId) {
      const match = conversations.find((c) => c.id === conversationId);
      if (match?.resourceId) {
        setResourceId(match.resourceId);
        const label = datasets.find(
          (d) => d.resourceId === match.resourceId,
        )?.title;
        if (label) setActiveDatasetLabel(label);
      }
    }
  }, [conversationId, conversations, datasets]);

  useEffect(() => {
    if (!resourceId && datasets.length > 0 && !conversationId) {
      setResourceId(datasets[0].resourceId);
      setActiveDatasetLabel(datasets[0].title);
    }
  }, [conversationId, datasets, resourceId]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const startNewChat = useCallback(() => {
    reset();
    setActiveDatasetLabel(
      datasets.find((d) => d.resourceId === resourceId)?.title ?? null,
    );
    router.push("/chat");
  }, [datasets, reset, resourceId, router]);

  const selectConversation = useCallback(
    (id: string) => {
      router.push(`/chat/${id}`);
    },
    [router],
  );

  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: "/" });
  }, []);

  const handleResourceIdChange = useCallback(
    (id: string) => {
      setResourceId(id);
      const label = datasets.find((d) => d.resourceId === id)?.title ?? null;
      setActiveDatasetLabel(label);
    },
    [datasets],
  );

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

  const sidebarProps = {
    collapsed: sidebarCollapsed,
    resourceId,
    onResourceIdChange: handleResourceIdChange,
    datasets,
    datasetsLoading,
    onDatasetsRefresh: refreshDatasets,
    onToggleCollapse: () => setSidebarCollapsed((c) => !c),
    onNewChat: () => {
      startNewChat();
      toast.success(CHAT.newChat);
    },
    onSearch: openSearch,
    onSettings: () =>
      toast.message("Dataset picker", {
        description:
          "Open your profile menu (bottom-left) to pick or add a data.gov.in dataset.",
      }),
    conversations,
    activeConversationId: conversationId ?? null,
    onSelectConversation: selectConversation,
    user: session?.user,
    onSignOut: handleSignOut,
  };

  return (
    <div
      className={
        theme === "dark"
          ? "relative flex h-dvh w-full overflow-hidden bg-[#0d0d0d] text-neutral-100"
          : "relative flex h-dvh w-full overflow-hidden bg-[#f4f4f5] text-neutral-900"
      }
    >
      <BackgroundBlobs />

      <Sidebar {...sidebarProps} />

      <MobileSidebarDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Sidebar
          {...sidebarProps}
          collapsed={false}
          onToggleCollapse={() => {}}
          onNewChat={() => {
            startNewChat();
            setMobileMenuOpen(false);
            toast.success(CHAT.newChat);
          }}
          onSearch={() => {
            openSearch();
            setMobileMenuOpen(false);
          }}
          onSettings={() => {
            toast.message("Dataset picker", {
              description:
                "Open your profile menu to pick or add a data.gov.in dataset.",
            });
            setMobileMenuOpen(false);
          }}
          mobile
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </MobileSidebarDrawer>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-transparent">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
              {CHAT.loading}
            </div>
          ) : hasConversation ? (
            <MessageList messages={messages} />
          ) : (
            <WelcomeHero onTryExample={sendMessage} />
          )}
          <ChatInput
            onSend={sendMessage}
            disabled={isSending || isLoading}
            datasetLabel={activeDatasetLabel}
            resourceId={resourceId}
          />
        </main>
      </div>

      <MobileSidebarFab
        onOpen={() => setMobileMenuOpen(true)}
        theme={theme}
      />

      <SearchChatsDialog
        open={searchOpen}
        onClose={closeSearch}
        conversations={conversations}
        onSelectConversation={selectConversation}
      />
    </div>
  );
}
