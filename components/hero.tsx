import { BrandLogo } from "./brand-logo";

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-8 py-4 text-center">
      <BrandLogo />
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#20392e] lg:text-5xl">
          Make room for the work you do best.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#68766c]">
          CraftDesk keeps client details, jobs, and follow-ups together for
          contractors and growing crews.
        </p>
      </div>
      <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
    </div>
  );
}
