import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sign in — VOID" };

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-surface p-8 text-center">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-text-3">
            Server #111
          </p>
          <h1 className="font-mono text-2xl uppercase tracking-[0.18em] text-text">
            VOID
          </h1>
          <p className="text-sm text-text-2">
            Guild manager — sign in with the Discord account that&apos;s in
            VOID&apos;s server.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/" });
          }}
        >
          <Button type="submit" className="w-full">
            Sign in with Discord
          </Button>
        </form>
        <p className="text-xs text-text-3">
          Access is limited to members of VOID&apos;s Discord server.
        </p>
      </div>
    </main>
  );
}
