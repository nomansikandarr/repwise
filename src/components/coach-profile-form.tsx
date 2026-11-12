"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveCoachProfile } from "@/app/trainer/profile/actions";
import { Panel } from "@/components/dashboard-ui";
import { Field, PrimaryButton, TextArea, TextInput } from "@/components/form";
import { SPECIALTIES } from "@/lib/mock";
import { cn } from "@/lib/utils";

type Values = {
  name: string;
  city: string;
  headline: string;
  bio: string;
  years: number;
  languages: string[];
  specialties: string[];
};

export function CoachProfileForm({ values }: { values: Values }) {
  const [state, action, pending] = useActionState(saveCoachProfile, undefined);
  const [picked, setPicked] = useState(values.specialties);

  useEffect(() => {
    if (state?.ok) toast.success("Profile saved");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  const err = (f: string) =>
    state?.fieldErrors?.[f] && <span className="mt-1.5 block text-xs text-destructive">{state.fieldErrors[f]}</span>;

  return (
    <form action={action}>
      <Panel title="About you" action={<PrimaryButton type="submit" disabled={pending} className="h-9 px-4 text-[11px]">{pending && <Loader2 className="size-4 animate-spin" />}Save changes</PrimaryButton>}>
        <div className="space-y-5 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <TextInput name="name" defaultValue={values.name} required />
              {err("name")}
            </Field>
            <Field label="City">
              <TextInput name="city" defaultValue={values.city} required />
              {err("city")}
            </Field>
          </div>
          <Field label="Headline" hint="One line under your name. Say who you help.">
            <TextInput name="headline" defaultValue={values.headline} required />
            {err("headline")}
          </Field>
          <Field label="Bio">
            <TextArea name="bio" defaultValue={values.bio} className="min-h-40" required />
            {err("bio")}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Years of experience">
              <TextInput name="years" type="number" min={0} defaultValue={values.years} />
              {err("years")}
            </Field>
            <Field label="Languages" hint="Comma separated">
              <TextInput name="languages" defaultValue={values.languages.join(", ")} />
            </Field>
          </div>
          <div>
            <p className="eyebrow mb-2 text-[11px] text-muted-foreground">Specialties (up to 4)</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <label
                  key={s}
                  className={cn(
                    "eyebrow inline-flex h-9 cursor-pointer items-center rounded-sm border px-3 text-[11px]",
                    picked.includes(s) ? "border-brand bg-brand text-brand-foreground" : "text-muted-foreground hover:border-foreground/40",
                  )}
                >
                  <input
                    type="checkbox"
                    name="specialties"
                    value={s}
                    checked={picked.includes(s)}
                    onChange={() => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
            {err("specialties")}
          </div>
        </div>
      </Panel>
    </form>
  );
}
