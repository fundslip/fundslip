"use client";

import type { PersonalDetails } from "@/types";

interface PersonalDetailsFormProps {
  details: PersonalDetails;
  onChange: (details: PersonalDetails) => void;
}

export function PersonalDetailsForm({ details, onChange }: PersonalDetailsFormProps) {
  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[13px] text-on-surface-variant">4.</span>
        <h2 className="font-headline text-base font-medium text-brand-black">
          Personal Details <span className="text-on-surface-variant font-normal text-sm">(Optional)</span>
        </h2>
      </div>
      <div className="space-y-3 max-w-lg">
        <div>
          <label className="block text-xs text-on-surface-variant uppercase tracking-wide mb-1.5">Full Name</label>
          <input type="text" value={details.fullName}
            onChange={(e) => onChange({ ...details, fullName: e.target.value })}
            className="w-full bg-surface border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-navy/20 outline-none"
            placeholder="e.g. Alex Richardson" />
        </div>
        <div>
          <label className="block text-xs text-on-surface-variant uppercase tracking-wide mb-1.5">Address</label>
          <input type="text" value={details.address}
            onChange={(e) => onChange({ ...details, address: e.target.value })}
            className="w-full bg-surface border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-navy/20 outline-none"
            placeholder="e.g. 42 Maple Street, London, UK" />
        </div>
      </div>
      <p className="text-[11px] text-on-surface-variant mt-3">
        Added to your PDF only. Never stored or sent to any server.
      </p>
    </section>
  );
}
