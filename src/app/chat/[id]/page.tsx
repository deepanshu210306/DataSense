import { DataSenseApp } from "@/components/datasense/DataSenseApp";

type ChatThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { id } = await params;
  return <DataSenseApp conversationId={id} />;
}
