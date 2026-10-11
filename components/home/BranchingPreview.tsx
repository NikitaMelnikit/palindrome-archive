import Link from "next/link";
import { TONE_STROKE, branchSpan, laneFor, rankScale } from "@/components/timeline/layout";
import { pad } from "@/lib/format";
import type { TimelineBranch, TimelineEvent } from "@/types";

const VIEW_W = 1000;
const VIEW_H = 360;
const LANE_Y = [70, 180, 290];

/** A dark exhibition section: the archive's history drawn as a single line that forks three ways. */
export function BranchingPreview({ branches, events }: { branches: TimelineBranch[]; events: TimelineEvent[] }) {
  const { xForYear: x, years } = rankScale(events, VIEW_W, 30);
  const byId = new Map(branches.map((b) => [b.id, b]));
  const consensus = byId.get("consensus")!;
  const forks = branches.filter((b) => b.forksFrom);

  const branchPath = (branch: TimelineBranch) => {
    const { start, end } = branchSpan(branch, events);
    const y = LANE_Y[laneFor(branch.id)];
    const x0 = x(start);
    if (y === LANE_Y[1]) return `M${x0} ${y}H${x(end)}`;
    return `M${x0} ${LANE_Y[1]}C${x0 + 40} ${LANE_Y[1]} ${x0 + 30} ${y} ${x0 + 80} ${y}H${x(end)}`;
  };

  return (
    <section aria-labelledby="branches-title" className="on-dark overflow-hidden">
      <div className="shell py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-gray">Section 02 / Timelines</p>
            <h2 id="branches-title" className="display reveal mt-5 text-[clamp(2.75rem,8vw,8.5rem)]">
              History is not
              <br />a <span className="text-lime">line.</span>
            </h2>
          </div>
          <p className="serif self-end text-xl leading-snug text-paper/85 lg:col-span-4 lg:col-start-9 lg:text-2xl">
            Every record in the archive belongs to a version of events. The consensus line runs until 1958, when a vote
            goes the other way in one branch, and until today, when a radio carrier asks to be answered.
          </p>
        </div>

        <div className="relative mt-14 hidden md:block">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" aria-hidden="true">
            <g stroke="var(--color-void-3)" strokeWidth="1">
              {years.map((year) => (
                <line key={year} x1={x(year)} y1={20} x2={x(year)} y2={VIEW_H - 34} />
              ))}
            </g>
            {years.map((year) => (
              <text
                key={`t${year}`}
                x={x(year)}
                y={VIEW_H - 14}
                fill="var(--color-gray)"
                fontSize="10"
                textAnchor="middle"
                className="t-art"
              >
                {year}
              </text>
            ))}
            <line x1={x(2026)} y1={20} x2={x(2026)} y2={VIEW_H - 30} stroke="var(--color-lime)" strokeDasharray="3 4" />
            <text x={x(2026) + 6} y={34} fill="var(--color-lime)" fontSize="11" className="t-art">
              TODAY
            </text>
            <path d={`M${x(1889)} ${LANE_Y[1]}H${x(2026)}`} stroke={TONE_STROKE.consensus} strokeWidth="2" fill="none" />
            {forks.map((branch) => (
              <path
                key={branch.id}
                d={branchPath(branch)}
                stroke={TONE_STROKE[branch.tone]}
                strokeWidth="2"
                fill="none"
                strokeDasharray={branch.id === "alpha" ? "6 5" : undefined}
              />
            ))}
          </svg>
          {events.map((event) => {
            const branch = byId.get(event.branchId) ?? consensus;
            const left = (x(event.year) / VIEW_W) * 100;
            const top = (LANE_Y[laneFor(event.branchId)] / VIEW_H) * 100;
            return (
              <Link
                key={event.id}
                href={`/timelines?event=${event.id}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
                style={{ left: `${left}%`, top: `${top}%` }}
                aria-label={`${event.year}, ${branch.name}: ${event.title}`}
                data-cursor={String(event.year)}
              >
                <span
                  className="block size-3 border transition-transform group-hover:scale-150 group-focus-visible:scale-150"
                  style={{ borderColor: TONE_STROKE[branch.tone], background: "var(--color-void)" }}
                />
              </Link>
            );
          })}
        </div>

        <ul className="mt-12 grid gap-px bg-paper/15 md:mt-16 md:grid-cols-3">
          {forks.map((branch) => {
            const own = events.filter((e) => e.branchId === branch.id);
            return (
              <li key={branch.id} className="bg-void">
                <Link href={`/timelines?event=${own[0]?.id ?? ""}`} className="group flex h-full flex-col gap-4 p-6 md:p-8">
                  <span className="flex items-center justify-between">
                    <span className="font-display text-5xl leading-none" style={{ color: TONE_STROKE[branch.tone] }}>
                      {branch.sigil}
                    </span>
                    <span className="label text-gray">
                      Forks {branch.forkYear} · {pad(own.length)} events
                    </span>
                  </span>
                  <span className="display-tight text-2xl">
                    <span className="link-u">{branch.name}</span>
                  </span>
                  <span className="text-sm leading-relaxed text-paper/75">{branch.description}</span>
                  <span className="label mt-auto pt-2 text-lime">Explore branch →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
