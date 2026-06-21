import { auth } from "@/auth";
import { HomePage } from "@/components/marketing/HomePage";

export default async function Page() {
  const session = await auth();
  return <HomePage session={session} />;
}
