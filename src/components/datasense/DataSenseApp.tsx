"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [pickedResourceId, setPickedResourceId] = useState<string | null>(null);
  const { conversations, refresh: refreshConversations } = useConversations();
  const {
    datasets,
    loading: datasetsLoading,
    refresh: refreshDatasets,
  } = useDatasets();

  const conversationMatch = useMemo(
    () =>
      conversationId
        ? conversations.find((c) => c.id === conversationId)
        : undefined,
    [conversationId, conversations],
  );

  const resourceId = useMemo(() => {
    if (pickedResourceId) return pickedResourceId;
    if (conversationMatch?.resourceId) return conversationMatch.resourceId;
    if (!conversationId && datasets.length > 0) return datasets[0].resourceId;
    return null;
  }, [pickedResourceId, conversationMatch, conversationId, datasets]);

  const activeDatasetLabel = useMemo(() => {
    if (!resourceId) return null;
    return datasets.find((d) => d.resourceId === resourceId)?.title ?? null;
  }, [resourceId, datasets]);

  const { messages, isSending, isLoading, sendMessage, reset } = useChat({
    conversationId,
    resourceId,
    onDatasetResolved: (id) => setPickedResourceId(id),
    onConversationCreated: (id) => {
      // Swap the URL to the new conversation WITHOUT a router navigation.
      // router.replace would remount this component (keyed by id) and refetch
      // the conversation mid-stream, which races the live stream and can show
      // the reply twice. history.replaceState keeps the streaming instance.
      window.history.replaceState(null, "", `/chat/${id}`);
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

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const startNewChat = useCallback(() => {
    reset();
    router.push("/chat");
  }, [reset, router]);

  const selectConversation = useCallback(
    (id: string) => {
      router.push(`/chat/${id}`);
    },
    [router],
  );

  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: "/" });
  }, []);

  const handleResourceIdChange = useCallback((id: string) => {
    setPickedResourceId(id);
  }, []);

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
