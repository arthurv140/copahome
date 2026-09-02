"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * MVP CTAs (brief section 10/23). Real destination URLs aren't wired up yet
 * (no collection/contact pages exist to link to) — swap the hrefs for the
 * live Copahome collection/contact pages when this ships on-site. Phase 2
 * adds product-specific CTAs ("Deze stof bekijken", "Vraag staal aan") once
 * fabric/color selection exists on top of the three curtain categories.
 */
export function CTASection() {
  return (
    <div id="advies" className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:justify-center">
      <a
        href="#"
        onClick={() => trackEvent({ type: "cta_clicked", cta: "collection" })}
        className="w-full rounded-full bg-foreground px-7 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent sm:w-auto"
      >
        Ontdek onze collectie
      </a>
      <a
        href="#"
        onClick={() => trackEvent({ type: "cta_clicked", cta: "advice" })}
        className="w-full rounded-full border border-border px-7 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent sm:w-auto"
      >
        Vraag advies
      </a>
    </div>
  );
}
