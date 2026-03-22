import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-y-auto h-full" style={{ background: "var(--color-background)" }}>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center flex flex-col items-center">
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight max-w-2xl"
          style={{ color: "var(--color-foreground)", fontFamily: "var(--font-header)" }}
        >
          Structure your day.<br />Execute with intention.
        </h1>

        <p className="mt-5 text-lg leading-relaxed max-w-md" style={{ color: "var(--color-text-muted)" }}>
          Connect your goals to daily time blocks, track what gets done, reflect, and improve.
        </p>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href="/day-plans"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold transition-opacity hover:opacity-85 text-base"
            style={{ background: "var(--color-success)", color: "#fff" }}
          >
            Start planning <span aria-hidden>→</span>
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 text-sm mt-1"
            style={{ color: "var(--color-text-muted)", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            or create a free account
          </Link>
        </div>

        <div
          className="mt-16 w-full rounded-2xl flex items-center justify-center select-none"
          style={{
            maxWidth: "52rem",
            aspectRatio: "16/9",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            boxShadow: "0 12px 48px rgba(1,3,38,0.12), 0 2px 12px rgba(1,3,38,0.06)",
          }}
        >
          Product screenshot
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center"
          style={{ color: "var(--color-foreground)", fontFamily: "var(--font-header)" }}
        >
          One system, full loop
        </h2>
        <p className="mt-3 text-center max-w-sm mx-auto text-sm" style={{ color: "var(--color-text-muted)" }}>
          From intention to execution to improvement, every day.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-5">
          <StepCard step="1" title="Set quests">
            Define weekly goals, milestones, or daily habits to track.
          </StepCard>
          <StepCard step="2" title="Plan your day">
            Schedule time blocks and attach quests to give each hour a purpose.
          </StepCard>
          <StepCard step="3" title="Execute">
            Work through your plan and mark blocks complete.
          </StepCard>
          <StepCard step="4" title="Reflect">
            Write a short reflection and log your mood.
          </StepCard>
          <StepCard step="5" title="Get insights">
            Review an AI summary and one suggestion for tomorrow.
          </StepCard>
        </div>
      </section>

      {/* ── Screenshots ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center"
          style={{ color: "var(--color-foreground)", fontFamily: "var(--font-header)" }}
        >
          See it in action
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <ScreenPlaceholder label="Dashboard" />
          <ScreenPlaceholder label="Day Plan" />
          <ScreenPlaceholder label="Quest Progress" />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-xl mx-auto px-6 pt-12 pb-28 text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "var(--color-foreground)", fontFamily: "var(--font-header)" }}
        >
          Build better days, consistently.
        </h2>
        <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Free to use. No setup required.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-base transition-opacity hover:opacity-85"
          style={{ background: "var(--color-success)", color: "#fff" }}
        >
          Create your account <span aria-hidden>→</span>
        </Link>
      </section>

    </main>
  );
}

/* ── Sub-components ── */

function StepCard({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2"
      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
    >
      <span
        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
        style={{ background: "rgba(57,153,191,0.12)", color: "var(--color-success)" }}
      >
        {step}
      </span>
      <h3 className="font-semibold text-base" style={{ color: "var(--color-foreground)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{children}</p>
    </div>
  );
}

function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="rounded-xl aspect-[4/3] flex items-center justify-center text-sm select-none"
      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
    >
      {label}
    </div>
  );
}
