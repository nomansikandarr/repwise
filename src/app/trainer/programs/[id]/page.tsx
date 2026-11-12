import { ChevronLeft, Eye, GripVertical, ImagePlus, Pencil, Plus, Trash2, UploadCloud, Video } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Panel, StatusPill } from "@/components/dashboard-shell";
import { Field, GhostButton, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/form";
import { getProgram, programs } from "@/lib/mock";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit program" };

export function generateStaticParams() {
  return [{ id: "new" }, ...programs.map((p) => ({ id: p.id }))];
}

export default async function ProgramEditorPage({ params }: Props) {
  const program = getProgram((await params).id); // undefined => blank "new program" form

  return (
    <>
      <Link href="/trainer/programs" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Programs
      </Link>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="display text-3xl">{program ? program.title : "New program"}</h1>
          <StatusPill status={program ? "Published" : "Draft"} />
        </div>
        <div className="flex gap-2">
          {program && (
            <Link href={`/programs/${program.id}`} className="eyebrow inline-flex h-11 items-center gap-2 rounded-sm border px-5 text-[11px] hover:border-foreground/40">
              <Eye className="size-4" /> Preview
            </Link>
          )}
          <PrimaryButton>{program ? "Save changes" : "Save draft"}</PrimaryButton>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Details" className="self-start">
          <div className="space-y-5 p-5">
            <Field label="Title">
              <TextInput defaultValue={program?.title} placeholder="e.g. Desi Strength 12" />
            </Field>
            <Field label="Short tagline">
              <TextInput defaultValue={program?.tagline} placeholder="One line that sells the result" />
            </Field>
            <Field label="Description">
              <TextArea defaultValue={program?.description} placeholder="Who is it for, what equipment is needed, what results to expect." />
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Level">
                <SelectInput defaultValue={program?.level ?? "Beginner"}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </SelectInput>
              </Field>
              <Field label="Length (weeks)">
                <TextInput type="number" defaultValue={program?.weeks} placeholder="8" />
              </Field>
              <Field label="Price (Rs)">
                <TextInput type="number" defaultValue={program?.price} placeholder="4500" />
              </Field>
            </div>
            <Field label="Cover image" hint="JPG or PNG, at least 1600 px wide.">
              {program ? (
                <div className="relative aspect-video overflow-hidden rounded-md border">
                  <Image src={program.cover} alt="" fill sizes="600px" className="object-cover" style={{ objectPosition: program.focus }} />
                  <span className="eyebrow absolute right-3 bottom-3 inline-flex h-9 items-center gap-2 rounded-sm bg-black/70 px-3 text-[11px] text-white backdrop-blur">
                    <ImagePlus className="size-4" /> Replace
                  </span>
                </div>
              ) : (
                <div className="grid aspect-video place-items-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
                  <span>
                    <UploadCloud className="mx-auto mb-2 size-8" strokeWidth={1.25} />
                    Drop an image here or click to upload
                  </span>
                </div>
              )}
            </Field>
          </div>
        </Panel>

        <Panel
          title={`Lessons (${program?.lessons.length ?? 0})`}
          action={
            <span className="text-xs text-muted-foreground">Drag to reorder</span>
          }
          className="self-start"
        >
          <ol className="divide-y">
            {(program?.lessons ?? []).map((l, i) => (
              <li key={l.id} className="flex items-center gap-3 p-3 sm:px-4">
                <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-muted">
                  <Video className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {i + 1}. {l.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {l.minutes} min{l.preview && " · Free preview"}
                  </p>
                </div>
                <button aria-label="Edit lesson" className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button aria-label="Delete lesson" className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ol>
          <div className="space-y-4 border-t p-5">
            <div className="grid place-items-center rounded-md border border-dashed px-4 py-8 text-center">
              <UploadCloud className="mb-2 size-8 text-muted-foreground" strokeWidth={1.25} />
              <p className="text-sm font-medium">Upload a lesson video</p>
              <p className="mt-1 text-xs text-muted-foreground">MP4 or MOV, up to 100 MB per video</p>
            </div>
            <GhostButton className="w-full">
              <Plus className="size-4" /> Add lesson
            </GhostButton>
          </div>
        </Panel>
      </div>
    </>
  );
}
