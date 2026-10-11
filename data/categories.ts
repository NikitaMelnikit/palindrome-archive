import type { Category, CategorySlug, Classification, ClassificationLevel } from "@/types";

export const categories: Category[] = [
  {
    slug: "objects",
    code: "OB",
    label: "Objects",
    description: "Things you could hold, if they would hold still.",
  },
  {
    slug: "places",
    code: "PL",
    label: "Places",
    description: "Locations that are not there, not there yet, or there twice.",
  },
  {
    slug: "events",
    code: "EV",
    label: "Events",
    description: "Occurrences recorded before, after or instead of happening.",
  },
  {
    slug: "signals",
    code: "SG",
    label: "Signals",
    description: "Transmissions with an unreliable relationship to their sender.",
  },
  {
    slug: "documents",
    code: "DC",
    label: "Documents",
    description: "Paper that knows more than it should.",
  },
  {
    slug: "lost-technologies",
    code: "LT",
    label: "Lost technologies",
    description: "Machines from workshops that no history records.",
  },
];

export const categorySlugs = categories.map((c) => c.slug) as CategorySlug[];

export const classifications: Record<ClassificationLevel, Classification> = {
  I: {
    level: "I",
    label: "Corroborated",
    description: "Observed by two or more independent recorders. Behaves the same way twice.",
  },
  II: {
    level: "II",
    label: "Contested",
    description: "Consistent with itself, and with nothing else on record.",
  },
  III: {
    level: "III",
    label: "Volatile",
    description: "Changes between observations. The record describes a state, not an object.",
  },
  IV: {
    level: "IV",
    label: "Sealed",
    description: "Access restricted at the request of a party that will not name itself.",
  },
};
