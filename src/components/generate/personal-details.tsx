"use client";

import type { PersonalDetails } from "@/types";

interface PersonalDetailsFormProps {
  details: PersonalDetails;
  onChange: (details: PersonalDetails) => void;
}

export function PersonalDetailsForm({ details, onChange }: PersonalDetailsFormProps) {
  return (
    <section className="bg-white rounded-xl p-7">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold">4</span>
        <h2 className="font-headline text-lg font-bold text-gray-900">
          Personal Details <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span>
        </h2>
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="section-label block mb-1.5">Full Name</label>
          <input
            type="text"
            value={details.fullName}
            onChange={(e) => onChange({ ...details, fullName: e.target.value })}
            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-navy focus:ring-[3px] focus:ring-navy/[0.08] transition-all outline-none"
            placeholder="e.g. Alex Richardson"
          />
        </div>
        <div>
          <label className="section-label block mb-1.5">Address</label>
          <input
            type="text"
            value={details.address}
            onChange={(e) => onChange({ ...details, address: e.target.value })}
            className="w-full bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-navy focus:ring-[3px] focus:ring-navy/[0.08] transition-all outline-none"
            placeholder="e.g. 42 Maple Street, London, UK"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Added to your PDF statement only. Never stored or sent to any server.
      </p>
    </section>
  );
}
