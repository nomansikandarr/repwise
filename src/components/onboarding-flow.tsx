"use client";

import { ArrowRight, Dumbbell, Loader2, UserRound } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { Field, GhostButton, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/form";
import { applyAsCoach, finishAsMember } from "@/app/onboarding/actions";
import { SPECIALTIES } from "@/lib/mock";
import { cn } from "@/lib/utils";

const GOALS = ["Build strength", "Lose fat", "Cricket fitness", "Run further", "Train at home", "Move without pain"];

export function OnboardingFlow({ name, startAsCoach }: { name: string; startAsCoach?: boolean }) {
  const [step, setStep] = useState<"role" | "apply">(startAsCoach ? "apply" : "role");
  const [role, setRole] = useState<"client" | "trainer">(startAsCoach ? "trainer" : "client");
  const [goals, setGoals] = useState<string[]>(["Build strength"]);
  const [picked, setPicked] = useState<string[]>(["Strength"]);
  const [finishing, startFinishing] = useTransition();
  const [state, apply, applying] = useActionState(applyAsCoach, undefined);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const err = (field: string) =>
    state?.fieldErrors?.[field] && <span className="mt-1.5 block text-xs text-destructive">{state.fieldErrors[field]}</span>;

  if (step === "apply") {
    return (
      <form action={apply} className="space-y-5">
        <div>
          <p className="eyebrow text-lime mb-3">Step 2 of 2</p>
          <h1 className="display text-3xl">Apply as a coach</h1>
          <p className="mt-2 text-muted-foreground">Tell us about your coaching. This becomes your public profile once approved.</p>
        </div>
        {state?.error && <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City">
            <TextInput name="city" placeholder="Lahore" required />
            {err("city")}
          </Field>
          <Field label="Years of experience">
            <TextInput name="years" type="number" min={0} placeholder="5" required />
            {err("years")}
          </Field>
        </div>
        <Field label="Headline" hint="Example: Strength coach for busy professionals">
          <TextInput name="headline" placeholder="Who do you help?" required minLength={10} maxLength={90} />
          {err("headline")}
        </Field>
        <Field label="About you">
          <TextArea name="bio" placeholder="Certifications, where you have coached, and how you work with clients." required minLength={40} />
          {err("bio")}
        </Field>
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
                  onChange={() => toggle(picked, setPicked, s)}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
          {err("specialties")}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Session price (Rs)">
            <TextInput name="price" type="number" min={500} placeholder="3000" required />
            {err("price")}
          </Field>
          <Field label="Session length">
            <SelectInput name="minutes" defaultValue="60">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </SelectInput>
            {err("minutes")}
          </Field>
        </div>
        <div className="flex justify-between gap-3 pt-2">
          <GhostButton type="button" onClick={() => setStep("role")}>
            Back
          </GhostButton>
          <PrimaryButton type="submit" disabled={applying}>
            {applying ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit application <ArrowRight className="size-4" />
          </PrimaryButton>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-lime mb-3">Salam, {name.split(" ")[0]}</p>
        <h1 className="display text-3xl">How will you use Repwise?</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["client", UserRound, "I want to train", "Find a coach, follow programs and book live sessions."],
            ["trainer", Dumbbell, "I am a coach", "Sell programs, run sessions and manage your clients."],
          ] as const
        ).map(([value, Icon, title, body]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn("rounded-lg border p-5 text-left transition-colors", role === value ? "border-brand bg-brand/10" : "hover:border-foreground/40")}
          >
            <Icon className={cn("size-7", role === value && "text-lime")} strokeWidth={1.5} />
            <p className="display mt-4 text-lg">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </button>
        ))}
      </div>

      {role === "client" && (
        <div>
          <p className="eyebrow mb-2 text-[11px] text-muted-foreground">What are your goals?</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggle(goals, setGoals, g)}
                className={cn(
                  "h-10 rounded-sm border px-4 text-sm",
                  goals.includes(g) ? "border-brand bg-brand text-brand-foreground" : "text-muted-foreground hover:border-foreground/40",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {role === "client" ? (
        <PrimaryButton className="w-full" disabled={finishing} onClick={() => startFinishing(() => finishAsMember(goals))}>
          {finishing ? <Loader2 className="size-4 animate-spin" /> : null}
          Start training <ArrowRight className="size-4" />
        </PrimaryButton>
      ) : (
        <PrimaryButton className="w-full" onClick={() => setStep("apply")}>
          Continue <ArrowRight className="size-4" />
        </PrimaryButton>
      )}
    </div>
  );
}
