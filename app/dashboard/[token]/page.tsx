import { notFound } from "next/navigation";
import { getSessionByToken } from "@/lib/db";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage({ params }: { params: { token: string } }) {
  const session = await getSessionByToken(params.token);
  if (!session) notFound();
  return <Dashboard session={session} />;
}
