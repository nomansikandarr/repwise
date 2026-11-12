import type { Metadata } from "next";
import { Chat } from "@/components/chat";
import { trainerConversations } from "@/lib/mock";

export const metadata: Metadata = { title: "Messages" };

export default function TrainerMessagesPage() {
  return (
    <>
      <h1 className="display mb-5 text-3xl">Messages</h1>
      <Chat conversations={trainerConversations} />
    </>
  );
}
