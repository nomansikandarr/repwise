"use client";

import { MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Settings, Video, VideoOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Static mock of the 1:1 call screen. Stream Video replaces the tiles in
 * phase 5; the layout and controls stay.
 */
export function CallRoom({
  title,
  remote,
  local,
  exitHref,
}: {
  title: string;
  remote: { name: string; img: string; focus?: string };
  local: { name: string; img: string };
  exitHref: string;
}) {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  const control = "grid size-12 place-items-center rounded-full transition-colors";

  return (
    <div className="flex h-svh flex-col bg-black text-white">
      <header className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 rounded-sm bg-red-600 px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-white" /> Live
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        <span className="text-sm tabular-nums text-white/70">24:18</span>
      </header>

      <div className="relative mx-2 min-h-0 flex-1 overflow-hidden rounded-lg bg-neutral-900 sm:mx-6">
        <Image src={remote.img} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: remote.focus }} />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
        <p className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm bg-black/60 px-2.5 py-1.5 text-sm backdrop-blur">
          <Mic className="size-3.5 text-brand" /> {remote.name}
        </p>

        {/* Self view */}
        <div className="absolute top-4 right-4 aspect-[3/4] w-24 overflow-hidden rounded-md border border-white/20 bg-neutral-800 shadow-2xl sm:w-40">
          {cam ? (
            <Image src={local.img} alt="" fill sizes="160px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-white/60">
              <VideoOff className="size-6" />
            </div>
          )}
          <p className="absolute bottom-1.5 left-1.5 rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px]">You</p>
        </div>
      </div>

      <footer className="flex items-center justify-center gap-3 px-4 py-5">
        <button onClick={() => setMic((v) => !v)} aria-label="Toggle microphone" className={cn(control, mic ? "bg-white/10 hover:bg-white/20" : "bg-white text-black")}>
          {mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </button>
        <button onClick={() => setCam((v) => !v)} aria-label="Toggle camera" className={cn(control, cam ? "bg-white/10 hover:bg-white/20" : "bg-white text-black")}>
          {cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </button>
        <button aria-label="Share screen" className={cn(control, "hidden bg-white/10 hover:bg-white/20 sm:grid")}>
          <MonitorUp className="size-5" />
        </button>
        <button aria-label="Chat" className={cn(control, "bg-white/10 hover:bg-white/20")}>
          <MessageSquare className="size-5" />
        </button>
        <button aria-label="Settings" className={cn(control, "hidden bg-white/10 hover:bg-white/20 sm:grid")}>
          <Settings className="size-5" />
        </button>
        <Link href={exitHref} aria-label="Leave call" className={cn(control, "w-16 bg-red-600 hover:bg-red-500")}>
          <PhoneOff className="size-5" />
        </Link>
      </footer>
    </div>
  );
}
