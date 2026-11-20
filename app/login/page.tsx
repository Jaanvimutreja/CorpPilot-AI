import { signIn } from "@/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-md rounded-xl border border-[#E2E7E2] bg-white p-10 text-center shadow-sm">
        <Link href="/" className="text-2xl font-semibold text-[#173F3D]">
          CorpPilot.
        </Link>

        <h1 className="mt-10 text-3xl font-semibold text-[#18242D]">
          Welcome Back
        </h1>

        <p className="mt-4 text-[#748087]">
          Your workplace journey starts here.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className="mt-10"
        >
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-[#DDE3DD] bg-white px-6 py-4 font-medium text-[#173F3D] transition hover:bg-[#F0F6F1]"
          >
            Continue with Google →
          </button>
        </form>
      </div>
    </main>
  );
}