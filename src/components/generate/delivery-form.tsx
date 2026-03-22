"use client";

import { Mail } from "lucide-react";

interface DeliveryFormProps {
  email: string;
  onEmailChange: (email: string) => void;
}

export function DeliveryForm({ email, onEmailChange }: DeliveryFormProps) {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
          5
        </span>
        <h2 className="font-headline text-xl font-bold">
          Delivery{" "}
          <span className="text-on-surface-variant font-normal text-sm ml-2">
            (Optional)
          </span>
        </h2>
      </div>
      <div className="max-w-md">
        <label className="block text-xs uppercase text-on-surface-variant mb-2 ml-1 font-semibold tracking-wide">
          Send a copy to (optional)
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-lg pl-12 py-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
            placeholder="email@address.com"
          />
        </div>
      </div>
    </section>
  );
}
