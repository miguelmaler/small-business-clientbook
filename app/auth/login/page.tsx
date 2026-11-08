import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";

export default function Page() {
  return (
    <main className="min-h-svh bg-[#f7f6f1] text-[#20392e] lg:grid lg:grid-cols-[1.04fr_0.96fr]">
      <section className="relative hidden min-h-svh overflow-hidden bg-[#20392e] px-12 py-12 text-white lg:flex lg:flex-col xl:px-20">
        <div className="pointer-events-none absolute -right-32 -top-24 size-[30rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-8 size-[22rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-[27rem] rounded-full bg-[#b96948]/20 blur-3xl" />
        <BrandLogo light />

        <div className="relative my-auto max-w-xl py-16">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#efad85]">
            Made for the people who make it happen
          </p>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.055em] xl:text-6xl">
            Good work deserves a smoother workday.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
            Keep your clients, jobs, and follow-ups together—so you can spend
            more time on the work that matters.
          </p>

          <div className="mt-12 flex items-center gap-4 border-t border-white/15 pt-6">
            <div className="flex -space-x-2" aria-hidden="true">
              <span className="grid size-9 place-items-center rounded-full border-2 border-[#20392e] bg-[#edc4a3] text-xs font-semibold text-[#20392e]">J</span>
              <span className="grid size-9 place-items-center rounded-full border-2 border-[#20392e] bg-[#d58c68] text-xs font-semibold text-white">M</span>
              <span className="grid size-9 place-items-center rounded-full border-2 border-[#20392e] bg-[#d6d6b5] text-xs font-semibold text-[#20392e]">A</span>
            </div>
            <p className="text-sm text-white/65">
              One clear place for the whole job, from first call to final walk-through.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-white/45">Built for independent contractors and growing crews.</p>
      </section>

      <section className="flex min-h-svh flex-col px-6 py-8 sm:px-10 lg:px-14 xl:px-24">
        <div className="lg:hidden">
          <BrandLogo />
        </div>
        <div className="flex flex-1 items-center justify-center py-12 lg:py-0">
          <div className="w-full max-w-[420px]">
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-xs text-[#68766c]">Your work, a little more organized.</p>
      </section>
    </main>
  );
}
