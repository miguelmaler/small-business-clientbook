"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#bd6845]">
          Get started
        </p>
        <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#20392e]">
          Create your account
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#68766c]">
          A smoother workday starts with one clear place for your clients and jobs.
        </p>
      </div>

      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#30463a]">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@yourbusiness.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-[#d9ded6] bg-white px-4 text-[#20392e] placeholder:text-[#99a39a] focus-visible:ring-[#41644e]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-[#30463a]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-[#d9ded6] bg-white px-4 text-[#20392e] focus-visible:ring-[#41644e]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repeat-password" className="text-sm font-medium text-[#30463a]">
              Confirm password
            </Label>
            <Input
              id="repeat-password"
              type="password"
              autoComplete="new-password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="h-12 rounded-xl border-[#d9ded6] bg-white px-4 text-[#20392e] focus-visible:ring-[#41644e]"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-xl bg-[#bd6845] text-sm font-semibold text-white shadow-sm transition hover:bg-[#a95737]"
            disabled={isLoading}
          >
            {isLoading ? "Creating your account…" : "Create account"}
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-[#68766c]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-[#41644e] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
