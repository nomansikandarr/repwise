import { desc, eq } from "drizzle-orm";
import { Bell, CalendarDays, CheckCircle2, MessageSquare, PlayCircle, RotateCcw, Star } from "lucide-react";
import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { markAllRead } from "./actions";

export const metadata: Metadata = { title: "Notifications" };

const ICONS = { calendar: CalendarDays, message: MessageSquare, check: CheckCircle2, play: PlayCircle, refund: RotateCcw, star: Star };

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function ago(date: Date) {
  const mins = Math.round((date.getTime() - Date.now()) / 60_000);
  if (mins > -60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (hours > -24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <PageTitle
        title="Notifications"
        body={unread ? `${unread} unread` : "You're all caught up"}
        action={
          unread > 0 && (
            <form action={markAllRead}>
              <button className="eyebrow h-10 rounded-sm border px-4 text-[11px] hover:border-brand">Mark all as read</button>
            </form>
          )
        }
      />
      <Panel className="max-w-3xl">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="divide-y">
            {items.map((n) => {
              const Icon = ICONS[n.type as keyof typeof ICONS] ?? Bell;
              const isUnread = !n.readAt;
              return (
                <li key={n.id} className={cn("flex gap-4 p-4 sm:px-5", isUnread && "bg-brand/5")}>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", isUnread ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground")}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      {n.title}
                      {isUnread && <span className="size-2 rounded-full bg-brand" />}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{ago(n.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
