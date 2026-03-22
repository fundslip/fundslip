"use client";

import type { PersonalDetails } from "@/types";

interface PersonalDetailsFormProps {
  details: PersonalDetails;
  onChange: (details: PersonalDetails) => void;
}

export function PersonalDetailsForm({ details, onChange }: PersonalDetailsFormProps) {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
          4
        </span>
        <h2 className="font-headline text-xl font-bold">
          Personal Details{" "}
          <span className="text-on-surface-variant font-normal text-sm ml-2">
            (Optional)
          </span>
        </h2>
      </div>
      <p className="text-xs uppercase text-on-surface-variant mb-4 font-semibold tracking-wide">
        Add your name and address to the statement
      </p>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs uppercase text-on-surface-variant mb-2 ml-1 font-semibold tracking-wide">
            Full Name
          </label>
          <input
            type="text"
            value={details.fullName}
            onChange={(e) =>
              onChange({ ...details, fullName: e.target.value })
            }
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="e.g. Alex Richardson"
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-on-surface-variant mb-2 ml-1 font-semibold tracking-wide">
            Address
          </label>
          <input
            type="text"
            value={details.address}
            onChange={(e) =>
              onChange({ ...details, address: e.target.value })
            }
            className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="e.g. 42 Maple Street, London, UK"
          />
        </div>
      </div>
      <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">
        This information is added to your PDF statement only. It is never stored
        or sent to any server.
      </p>
    </section>
  );
}
