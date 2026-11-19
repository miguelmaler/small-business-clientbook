"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/auth/login/actions";

const initialState: SignInState = { error: null };

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#bd6845]">Welcome back</p>
      <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#20392e]">Sign in</h2>
      <p className="mt-3 text-sm leading-6 text-[#68766c]">
        Pick up right where your work left off.
      </p>

      <form action={formAction} className="mt-9">
        <div className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#30463a]">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@yourbusiness.com"
              autoComplete="email"
              required
              className="h-12 rounded-xl border-[#d9ded6] bg-white px-4 text-[#20392e] placeholder:text-[#99a39a] focus-visible:ring-[#41644e]"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-sm font-medium text-[#30463a]">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-[#41644e] underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="h-12 rounded-xl border-[#d9ded6] bg-white px-4 text-[#20392e] focus-visible:ring-[#41644e]"
            />
          </div>
          {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-xl bg-[#bd6845] text-sm font-semibold text-white shadow-sm transition hover:bg-[#a95737]"
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Sign in to CraftDesk"}
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-[#68766c]">
          New to CraftDesk?{" "}
          <Link href="/auth/sign-up" className="font-semibold text-[#41644e] underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
