import { ArrowRight, Clock, MapPin, PlayCircle, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "@/components/bits";
import { getTrainer, type Program, type Trainer } from "@/lib/mock";
import { cn, formatPrice } from "@/lib/utils";

export function TrainerCard({ trainer, className }: { trainer: Trainer; className?: string }) {
  return (
    <Link
      href={`/trainers/${trainer.slug}`}
      className={cn("group relative block aspect-[4/5] overflow-hidden rounded-lg bg-card", className)}
    >
      <Image
        src={trainer.photo}
        alt={trainer.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: trainer.focus }}
      />
      <div className="photo-shade absolute inset-0" />
      {trainer.badge && (
        <span className="eyebrow absolute top-3 left-3 rounded-sm bg-brand px-2 py-1 text-[10px] text-brand-foreground">
          {trainer.badge}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs text-white/75">
            <MapPin className="size-3" /> {trainer.city}
          </span>
          <Rating value={trainer.rating} count={trainer.reviews} className="text-xs" />
        </div>
        <h3 className="display text-xl">{trainer.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-white/75">{trainer.headline}</p>
        <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
          <span className="text-sm">
            <span className="font-semibold">{formatPrice(trainer.sessionPrice)}</span>
            <span className="text-white/65"> / session</span>
          </span>
          <span className="eyebrow flex items-center gap-2 text-[10px]">
            View <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProgramCard({ program, className }: { program: Program; className?: string }) {
  const trainerName = program.trainerName ?? getTrainer(program.trainer)?.name;
  return (
    <Link
      href={`/programs/${program.id}`}
      className={cn("group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-brand/50", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={program.cover}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: program.focus }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="eyebrow absolute top-3 left-3 rounded-sm bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur">
          {program.level}
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white">
          <PlayCircle className="size-4 text-brand" /> {program.lessons.length} lessons
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="display text-lg">{program.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{program.tagline}</p>
        <p className="mt-3 text-xs text-muted-foreground">by {trainerName}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {program.weeks} wks
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {program.students.toLocaleString("en-US")}
            </span>
            <Rating value={program.rating} className="text-xs text-foreground" />
          </div>
          <span className="font-semibold">{formatPrice(program.price)}</span>
        </div>
      </div>
    </Link>
  );
}
