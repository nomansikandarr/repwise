"use client";

import { ArrowLeft, CornerUpLeft, MessageSquareText, Paperclip, Search, Send, Smile, Video } from "lucide-react";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import type { ChatMessage, Conversation } from "@/lib/mock";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "💪", "🔥", "🙏"];

/**
 * Static chat mock-up (list + thread, reactions, replies, thread counts).
 * Stream Chat replaces this in phase 6; the layout is what carries over.
 */
export function Chat({ conversations }: { conversations: Conversation[] }) {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [showThread, setShowThread] = useState(false); // mobile: list vs thread
  const [extra, setExtra] = useState<Record<string, ChatMessage[]>>({});
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId)!;
  const messages = [...active.messages, ...(extra[activeId] ?? [])];

  function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = { id: `local-${messages.length}`, from: "me", text, time: "Now", replyTo: replyTo ?? undefined };
    setExtra((x) => ({ ...x, [activeId]: [...(x[activeId] ?? []), msg] }));
    setDraft("");
    setReplyTo(null);
  }

  function react(id: string, emoji: string) {
    setReactions((r) => {
      const current = r[id] ?? [];
      return { ...r, [id]: current.includes(emoji) ? current.filter((e) => e !== emoji) : [...current, emoji] };
    });
  }

  return (
    <div className="grid h-[calc(100svh-13rem)] min-h-[480px] overflow-hidden rounded-lg border bg-card lg:h-[calc(100svh-11rem)] md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className={cn("flex min-h-0 flex-col border-r", showThread && "hidden md:flex")}>
        <label className="relative m-3">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search chats" className="h-10 w-full rounded-md border bg-background pr-3 pl-9 text-sm outline-none focus:border-brand" />
        </label>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  setActiveId(c.id);
                  setShowThread(true);
                  setReplyTo(null);
                }}
                className={cn("flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/50", c.id === activeId && "bg-accent")}
              >
                <span className="relative shrink-0">
                  <Image src={c.avatar} alt="" width={44} height={44} className="size-11 rounded-full object-cover object-top" />
                  {c.online && <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-brand" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{c.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{c.when}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{c.last}</span>
                    {c.unread > 0 && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Thread */}
      <div className={cn("flex min-h-0 flex-col", !showThread && "hidden md:flex")}>
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <button onClick={() => setShowThread(false)} className="md:hidden" aria-label="Back to chats">
            <ArrowLeft className="size-5" />
          </button>
          <Image src={active.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover object-top" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{active.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {active.online ? <span className="text-lime">Online</span> : "Last seen recently"} · {active.role}
            </p>
          </div>
          <button aria-label="Start video call" className="grid size-9 place-items-center rounded-md border hover:border-brand">
            <Video className="size-4" />
          </button>
        </div>

        <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <li className="text-center text-[11px] text-muted-foreground">Today</li>
          {messages.map((m) => {
            const mine = m.from === "me";
            const all = [...(m.reactions ?? []), ...(reactions[m.id] ?? [])];
            return (
              <li key={m.id} className={cn("group flex flex-col", mine ? "items-end" : "items-start")}>
                <div className={cn("flex max-w-[85%] items-center gap-2 sm:max-w-[70%]", mine && "flex-row-reverse")}>
                  <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed", mine ? "rounded-br-sm bg-brand text-brand-foreground" : "rounded-bl-sm bg-muted")}>
                    {m.replyTo && (
                      <p className={cn("mb-1.5 border-l-2 pl-2 text-xs opacity-75", mine ? "border-black/40" : "border-brand")}>{m.replyTo}</p>
                    )}
                    {m.text}
                  </div>
                  <div className="flex shrink-0 gap-0.5 rounded-full border bg-card p-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    {QUICK_REACTIONS.slice(0, 3).map((e) => (
                      <button key={e} onClick={() => react(m.id, e)} className="grid size-7 place-items-center rounded-full text-sm hover:bg-accent" aria-label={`React ${e}`}>
                        {e}
                      </button>
                    ))}
                    <button onClick={() => setReplyTo(m.text)} className="grid size-7 place-items-center rounded-full hover:bg-accent" aria-label="Reply">
                      <CornerUpLeft className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className={cn("mt-1 flex items-center gap-2 text-[11px] text-muted-foreground", mine && "flex-row-reverse")}>
                  <span>{m.time}</span>
                  {all.length > 0 && (
                    <span className="flex gap-1">
                      {all.map((e, i) => (
                        <span key={i} className="rounded-full border bg-card px-1.5 py-0.5 text-xs">
                          {e}
                        </span>
                      ))}
                    </span>
                  )}
                  {m.thread && (
                    <button className="text-lime flex items-center gap-1 font-medium hover:underline">
                      <MessageSquareText className="size-3.5" /> {m.thread} replies
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <form onSubmit={send} className="border-t p-3">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
              <CornerUpLeft className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">Replying to: {replyTo}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="font-semibold">
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Attach" className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent">
              <Paperclip className="size-4" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:border-brand"
            />
            <button type="button" aria-label="Emoji" className="hidden size-10 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent sm:grid">
              <Smile className="size-4" />
            </button>
            <button type="submit" aria-label="Send" className="grid size-10 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground hover:bg-brand/85">
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
