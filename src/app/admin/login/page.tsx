import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-gold-300">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-forest-950">Staff sign in</h1>
          <p className="mt-1 text-sm text-ink-600">
            IK Hope Centre administration · two-factor required
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
