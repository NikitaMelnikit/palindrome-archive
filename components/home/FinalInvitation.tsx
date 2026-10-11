import Link from "next/link";
import { pad } from "@/lib/format";

export function FinalInvitation({ records, categories, branches }: { records: number; categories: number; branches: number }) {
  return (
    <section aria-labelledby="invite-title" className="bg-lime text-ink">
      <div className="shell py-20 lg:py-32">
        <p className="label flex flex-wrap gap-x-6 gap-y-1">
          <span>End of index</span>
          <span className="tnum">{pad(records, 3)} records</span>
          <span className="tnum">{pad(categories)} categories</span>
          <span className="tnum">{pad(branches)} branches</span>
          <span>0 guarantees</span>
        </p>
        <h2 id="invite-title" className="display mt-8 max-w-[14ch] text-[clamp(3rem,10.5vw,11.5rem)]">
          Every record is a door.
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <p className="serif text-2xl leading-snug italic lg:col-span-5">
            Some of them open in both directions. The archive is complete as of today, and will be different tomorrow.
          </p>
          <div className="flex flex-wrap items-end gap-3 lg:col-span-6 lg:col-start-7 lg:justify-end">
            <Link href="/archive" className="btn btn-solid" data-cursor="Enter">
              Open the complete archive <span aria-hidden="true">→</span>
            </Link>
            <Link href="/about" className="btn">
              How records are kept
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
