import { Plus, X } from "lucide-react";
import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/dashboard-shell";
import { Field, PrimaryButton, SelectInput, TextInput } from "@/components/form";
import { Switch } from "@/components/ui/switch";
import { trainerMe, weekAvailability } from "@/lib/mock";

export const metadata: Metadata = { title: "Availability" };

export default function AvailabilityPage() {
  return (
    <>
      <PageTitle title="Availability" body="Set the hours clients can book. Slots are created automatically from these." action={<PrimaryButton>Save changes</PrimaryButton>} />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Weekly hours">
          <ul className="divide-y">
            {weekAvailability.map((d) => (
              <li key={d.day} className="flex flex-wrap items-start gap-4 p-4 sm:px-5">
                <label className="flex w-36 shrink-0 items-center gap-3 pt-1.5">
                  <Switch defaultChecked={d.on} />
                  <span className={d.on ? "font-medium" : "text-muted-foreground"}>{d.day}</span>
                </label>
                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                  {d.on ? (
                    <>
                      {d.ranges.map((r) => (
                        <span key={r} className="inline-flex h-9 items-center gap-2 rounded-sm border bg-background pr-2 pl-3 text-sm">
                          {r}
                          <button aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                            <X className="size-3.5" />
                          </button>
                        </span>
                      ))}
                      <button className="inline-flex h-9 items-center gap-1 rounded-sm border border-dashed px-3 text-sm text-muted-foreground hover:border-brand hover:text-foreground">
                        <Plus className="size-3.5" /> Add hours
                      </button>
                    </>
                  ) : (
                    <span className="pt-1.5 text-sm text-muted-foreground">Day off</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Session settings">
            <div className="space-y-5 p-5">
              <Field label="Session length">
                <SelectInput defaultValue={`${trainerMe.sessionMinutes}`}>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </SelectInput>
              </Field>
              <Field label="Price per session (Rs)" hint="You keep 90%. Clients see this price.">
                <TextInput type="number" defaultValue={trainerMe.sessionPrice} />
              </Field>
              <Field label="Timezone">
                <SelectInput defaultValue="pkt">
                  <option value="pkt">Pakistan Standard Time (GMT+5)</option>
                  <option value="ist">India Standard Time (GMT+5:30)</option>
                  <option value="gst">Gulf Standard Time (GMT+4)</option>
                </SelectInput>
              </Field>
              <Field label="Minimum notice">
                <SelectInput defaultValue="12">
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                </SelectInput>
              </Field>
            </div>
          </Panel>
          <Panel title="Prayer & Ramadan breaks">
            <div className="space-y-4 p-5 text-sm">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block font-medium">Block Jummah time</span>
                  <span className="text-muted-foreground">Fridays 12:30 PM to 2:30 PM</span>
                </span>
                <Switch defaultChecked />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block font-medium">Ramadan schedule</span>
                  <span className="text-muted-foreground">Only offer slots after iftar</span>
                </span>
                <Switch />
              </label>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
