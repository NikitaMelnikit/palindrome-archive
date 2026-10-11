import type { Collection } from "@/types";

/** Curated collections. `artifactIds` is ordered and is the single source of collection membership. */
export const collections: Collection[] = [
  {
    id: "COL-01",
    slug: "cities-that-never-existed",
    title: "Cities That Never Existed",
    code: "C·01",
    kicker: "Harbours, junctions and valleys",
    description:
      "Places that are not there yet, are no longer there, or are there twice. A survey of addresses with an unreliable relationship to the ground.",
    introduction: [
      "A place, for the purposes of this archive, is a set of coordinates that more than one person agrees on. The records in this collection meet that definition and then keep going. Varnholm agrees with itself across a century. Quell agreed with eleven atlases and then stopped. The corridor at Kessel cannot agree with itself about its own length.",
      "Read together, they suggest that geography is less a fact than a consensus, and that consensus, like any agreement, can be withdrawn.",
    ],
    curatorNote:
      "If you visit any of these places, please write down what you find before you discuss it with anyone else. The archive receives too many reports that were correct until they were compared.",
    artifactIds: ["PL-0220-LP", "PL-0880-LP", "PL-1001-LP", "PL-1441-LP", "EV-1991-VE", "DC-1881-CD"],
    visualization: {
      kind: "contour",
      seed: 101,
      variant: 2,
      tone: "light",
      alt: "Topographic contour lines of a valley with a highlighted elevation band and a measured grid.",
    },
  },
  {
    id: "COL-02",
    slug: "objects-from-tomorrow",
    title: "Objects From Tomorrow",
    code: "C·02",
    kicker: "Things that arrived early",
    description:
      "A watch that counts down, a key for a lock not yet patented, a lamp lit from elsewhere. Objects that are ahead of their own history.",
    introduction: [
      "Every object in this collection can be held, weighed and photographed. That is where their cooperation ends. Each one carries a date, or a direction, or a shape, that belongs to a moment other than the one it is sitting in.",
      "We have arranged them roughly by how far ahead they are. The mineral is the exception: it is exactly as far ahead as whoever happens to be looking at it.",
    ],
    curatorNote:
      "Handle with gloves, and with patience. Several of these objects respond to attention, and none of them respond to being hurried.",
    artifactIds: ["OB-2112-BO", "OB-0990-BO", "OB-0550-BO", "OB-2002-BO", "LT-1661-TL"],
    visualization: {
      kind: "crystal",
      seed: 202,
      variant: 1,
      tone: "light",
      alt: "Engraving of a tetrahedral specimen with hatched faces and measurement lines.",
    },
  },
  {
    id: "COL-03",
    slug: "the-last-known-signals",
    title: "The Last Known Signals",
    code: "C·03",
    kicker: "Transmissions, tones and replies",
    description:
      "A dial tone from an exchange that was never built, a lullaby in prime intervals, a carrier that arrives before it is sent.",
    introduction: [
      "A signal is a promise that someone, somewhere, meant something. The transmissions in this collection keep that promise in every respect except the obvious ones: who sent them, when, and from where.",
      "They are filed as the last known signals because each has, at some point, been the most recent thing the archive heard. That distinction never lasts long.",
    ],
    curatorNote:
      "All recordings are available in the reading room. Please do not hum along. We cannot be sure who is listening at the other end.",
    artifactIds: ["SG-2332-GS", "SG-1221-GS", "SG-0660-GS", "SG-0440-GS", "EV-1551-VE"],
    visualization: {
      kind: "waveform",
      seed: 303,
      variant: 2,
      tone: "dark",
      alt: "Stacked oscilloscope traces with one irregular burst highlighted.",
    },
  },
  {
    id: "COL-04",
    slug: "documents-without-origins",
    title: "Documents Without Origins",
    code: "C·04",
    kicker: "Letters, minutes, tables and cards",
    description:
      "Paper that knows more than it should: a letter from 2113, minutes of a meeting not yet held, a tide table for a removed coast.",
    introduction: [
      "Paper is the archive’s oldest technology and its most reliable witness. It does not change its mind. The documents gathered here have each been checked for forgery, and each has passed, which is the problem.",
      "They are ordinary in every physical respect. Their only irregularity is the date, and the uncomfortable precision with which they describe it.",
    ],
    curatorNote:
      "Several of these documents are addressed to us. We have not replied. Correspondence policy is under review, and will be until the Esker Accord is settled in this branch.",
    artifactIds: ["DC-2442-CD", "DC-1111-CD", "DC-0330-CD", "DC-1881-CD", "EV-1771-VE"],
    visualization: {
      kind: "document",
      seed: 404,
      variant: 0,
      tone: "light",
      alt: "A typed page with redaction bars and a circular stamp.",
    },
  },
  {
    id: "COL-05",
    slug: "technologies-we-never-invented",
    title: "Technologies We Never Invented",
    code: "C·05",
    kicker: "Machines without workshops",
    description:
      "An engine that has been calculating since 1889, a machine that records forgotten dreams, a pantograph that drew coasts before they were found.",
    introduction: [
      "None of these machines appears in a patent office, a trade catalogue or a workshop ledger. Each works. Some work better than anything that does appear in those places.",
      "They share a manner more than a mechanism: a quiet, clockwork confidence, as if built by someone who already knew how the story ended and simply wanted to see it written down.",
    ],
    curatorNote:
      "Please do not wind, open, oil, reset or otherwise assist any of these machines. They do not need help. Several have said so.",
    artifactIds: ["LT-1331-TL", "LT-0110-TL", "LT-0770-TL", "LT-1661-TL", "OB-2002-BO"],
    visualization: {
      kind: "schematic",
      seed: 505,
      variant: 0,
      tone: "dark",
      alt: "Technical drawing of meshed gears and a counter with dimension lines.",
    },
  },
  {
    id: "COL-06",
    slug: "weather-from-elsewhere",
    title: "Weather From Elsewhere",
    code: "C·06",
    kicker: "Snow, light and stopped clocks",
    description:
      "Conditions reported from the wrong place or the wrong year: upward snow, a warmer sea, a noon that lasts eleven seconds too long.",
    introduction: [
      "Weather is the one thing everyone in a place experiences together. That is what makes these records difficult: whole towns agree on what happened, and the instruments agree with them, and still the weather does not belong where it fell.",
      "We have come to think of these events as leaks: small places where the conditions of one branch drip through into another.",
    ],
    curatorNote:
      "If you experience weather that seems to belong elsewhere, note the time, the direction and your own pulse. Then go indoors.",
    artifactIds: ["EV-1991-VE", "EV-2222-VE", "SG-0440-GS", "PL-1441-LP", "OB-0990-BO"],
    visualization: {
      kind: "particles",
      seed: 606,
      tone: "dark",
      alt: "Small marks rising above a low skyline toward a dashed vanishing line.",
    },
  },
];
