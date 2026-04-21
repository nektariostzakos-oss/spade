"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EventFormData = {
  eventName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  artistName: string;
};

export const EMPTY_FORM: EventFormData = {
  eventName: "",
  date: "",
  time: "",
  venueName: "",
  venueAddress: "",
  artistName: "",
};

type Props = {
  value: EventFormData;
  onChange: (next: EventFormData) => void;
};

export function EventForm({ value, onChange }: Props) {
  const set = <K extends keyof EventFormData>(key: K, v: EventFormData[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Event name" required className="sm:col-span-2">
        <Input
          value={value.eventName}
          onChange={(e) => set("eventName", e.target.value)}
          placeholder="Sunset Sessions Vol. 4"
        />
      </Field>

      <Field label="Date" required>
        <Input
          type="date"
          value={value.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </Field>

      <Field label="Time">
        <Input
          type="time"
          value={value.time}
          onChange={(e) => set("time", e.target.value)}
        />
      </Field>

      <Field label="Venue name" required>
        <Input
          value={value.venueName}
          onChange={(e) => set("venueName", e.target.value)}
          placeholder="Club Atlas"
        />
      </Field>

      <Field label="Venue address">
        <Input
          value={value.venueAddress}
          onChange={(e) => set("venueAddress", e.target.value)}
          placeholder="12 Seaside Rd, Athens"
        />
      </Field>

      <Field label="DJ / Artist (optional)" className="sm:col-span-2">
        <Input
          value={value.artistName}
          onChange={(e) => set("artistName", e.target.value)}
          placeholder="DJ Helios"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>
        {label}
        {required ? (
          <span className="ml-1 text-destructive" aria-label="required">
            *
          </span>
        ) : null}
      </Label>
      {children}
    </div>
  );
}
