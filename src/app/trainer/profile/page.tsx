import { BadgeCheck, Camera, Eye } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoachProfileForm } from "@/components/coach-profile-form";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { getMyTrainerProfile, requireUser } from "@/lib/dal";
import { PLACEHOLDER_PHOTO } from "@/lib/queries";

export const metadata: Metadata = { title: "Profile" };

export default async function TrainerProfilePage() {
  const user = await requireUser();
  const coach = await getMyTrainerProfile(user.id);
  if (!coach) notFound();

  return (
    <>
      <PageTitle
        title="Public profile"
        body="This is what clients see before they book you."
        action={
          <Link href={`/trainers/${coach.slug}`} className="eyebrow inline-flex h-11 items-center gap-2 rounded-sm border px-5 text-[11px] hover:border-foreground/40">
            <Eye className="size-4" /> View profile
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <CoachProfileForm
          values={{
            name: user.profile.displayName,
            city: user.profile.city ?? "",
            headline: coach.headline,
            bio: coach.bio,
            years: coach.yearsExperience,
            languages: coach.languages,
            specialties: coach.specialties,
          }}
        />

        <div className="space-y-6">
          <Panel title="Profile photo">
            <div className="p-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                <Image
                  src={coach.photoUrl ?? PLACEHOLDER_PHOTO}
                  alt=""
                  fill
                  sizes="340px"
                  className="object-cover"
                  style={{ objectPosition: coach.photoFocus ?? undefined }}
                />
                <span className="eyebrow absolute right-3 bottom-3 inline-flex h-9 items-center gap-2 rounded-sm bg-black/70 px-3 text-[11px] text-white backdrop-blur">
                  <Camera className="size-4" /> Uploads in phase 4
                </span>
              </div>
            </div>
          </Panel>
          <Panel title="Verification">
            <div className="flex items-start gap-3 p-5 text-sm">
              <BadgeCheck className="text-lime size-5 shrink-0" />
              <p>
                <span className="font-medium">Verified coach</span>
                <span className="block text-muted-foreground">
                  Approved by the Repwise team
                  {coach.reviewedAt && ` on ${coach.reviewedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}.
                </span>
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
