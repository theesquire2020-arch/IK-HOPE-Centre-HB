import Link from "next/link";
import { btn } from "@/components/ui";
import { HomeIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
        <HomeIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 font-display text-4xl font-semibold text-forest-950">
        This page wandered off
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-600">
        The page you're looking for doesn't exist — or the campaign isn't live yet.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className={btn.forest + " !text-xs"}>
          Back home
        </Link>
        <Link href="/campaigns" className={btn.outline + " !text-xs"}>
          View campaigns
        </Link>
      </div>
    </div>
  );
}
