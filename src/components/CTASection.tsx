"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * MVP CTAs (brief section 10/23). Real destination URLs aren't wired up yet
 * (no collection/contact pages exist to link to) — swap the hrefs for the
 * live Copahome collection/contact pages when this ships on-site.
 */
export function CTASection() {
  return (
    <div id="advies" className="animate-fade-up space-y-8 py-6 text-center">
      <div className="space-y-3">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Like what you see?</h2>
        <p className="mx-auto max-w-md text-base leading-relaxed text-muted">
          Discover the Copahome collection behind your visualisation.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5">
        <a
          href="#"
          onClick={() => trackEvent({ type: "cta_clicked", cta: "collection" })}
          className="rounded-full bg-foreground px-9 py-3.5 text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Explore fabrics
        </a>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium">
          <a
            href="#"
            onClick={() => trackEvent({ type: "cta_clicked", cta: "advice" })}
            className="underline decoration-foreground/20 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Request advice
          </a>
          <a
            href="#"
            onClick={() => trackEvent({ type: "cta_clicked", cta: "sample_request" })}
            className="underline decoration-foreground/20 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Request a sample
          </a>
          <a
            href="#"
            onClick={() => trackEvent({ type: "cta_clicked", cta: "quote_request" })}
            className="underline decoration-foreground/20 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Request a quote
          </a>
        </div>
      </div>
    </div>
  );
}
