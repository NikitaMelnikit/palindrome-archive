import type { TimelineBranch, TimelineEvent } from "@/types";

/**
 * History, as the archive models it, is a consensus line that forks.
 * Branch γ leaves the consensus at the Ostra dam vote (1958). Branches α and β leave it today (2026).
 * Events sharing an `anchorId` are the same moment as it plays out in different branches.
 */
export const timelineBranches: TimelineBranch[] = [
  {
    id: "consensus",
    name: "The Consensus Line",
    sigil: "C",
    tone: "consensus",
    description:
      "The record everyone agrees on, up to the moments where they stop agreeing. It runs from the winding of the Patience Engine to the present day.",
    forksFrom: null,
    forkYear: null,
  },
  {
    id: "alpha",
    name: "The Quiet Century",
    sigil: "α",
    tone: "ink",
    description:
      "The accord is signed, the anomalies are catalogued and sealed, and the century grows quiet. Evidence stops arriving. The archive becomes a museum of a door that closed.",
    forksFrom: "consensus",
    forkYear: 2026,
  },
  {
    id: "beta",
    name: "The Long Signal",
    sigil: "β",
    tone: "lime",
    description:
      "The accord fails. The Returning Carrier is answered, and the future begins to write back: slowly at first, then all at once.",
    forksFrom: "consensus",
    forkYear: 2026,
  },
  {
    id: "gamma",
    name: "The Unbuilt World",
    sigil: "γ",
    tone: "alert",
    description:
      "The Ostra dam vote fails by one. Nothing is built where it was meant to be: not the dam, not the railway, not the exchange. A lighter, stranger century, full of gaps.",
    forksFrom: "consensus",
    forkYear: 1958,
  },
];

export const timelineEvents: TimelineEvent[] = [
  // ── Consensus line ───────────────────────────────────────────────────────────
  {
    id: "c-1889",
    branchId: "consensus",
    year: 1889,
    title: "The Patience Engine is wound",
    summary: "A clockmaker on Ostra Street winds a calculating engine once and locks the cabinet.",
    detail:
      "The note on the lid reads “Do not stop it. It is nearly finished.” Every branch inherits the engine. They disagree only about when it stops, and whether anyone is there to read the answer.",
    artifactIds: ["LT-0110-TL"],
    certainty: 0.97,
  },
  {
    id: "c-1931",
    branchId: "consensus",
    year: 1931,
    title: "Varnholm is photographed from the north ridge",
    summary: "A forty-one-second exposure captures the harbour city in two different years.",
    detail:
      "The photographer’s name is lost. The plate is not: it is the earliest object in the archive known to contain more than one branch at once.",
    artifactIds: ["PL-0220-LP"],
    certainty: 0.91,
  },
  {
    id: "c-1951",
    branchId: "consensus",
    year: 1951,
    title: "Model Q draws its last chart",
    summary: "The Cartographic Engine charts the Isle of Quell, then runs out of paper.",
    detail:
      "Eleven atlases print the island over the following seven years. By 1960 it has been removed from all of them, and from every edition since.",
    artifactIds: ["LT-0770-TL", "PL-0880-LP"],
    certainty: 0.88,
  },
  {
    id: "c-1958",
    branchId: "consensus",
    year: 1958,
    title: "The Ostra dam vote",
    summary: "The dam is approved by 212 votes to 211. Branch γ begins where the vote went the other way.",
    detail:
      "The valley floods four years later. Survey flights still photograph the shoreline from the branch in which it did not, eleven metres below our own.",
    artifactIds: ["PL-1441-LP"],
    certainty: 0.94,
  },
  {
    id: "c-2003",
    branchId: "consensus",
    year: 2003,
    title: "Buoy 44 breaks its mooring",
    summary: "A weather buoy is lost in a winter storm and keeps reporting from a sea that is not there.",
    detail:
      "The mooring line was found cut cleanly. Nineteen days later the first report arrived from a pine forest three hundred kilometres inland.",
    artifactIds: ["SG-0440-GS"],
    certainty: 0.86,
  },
  {
    id: "c-2026",
    branchId: "consensus",
    year: 2026,
    title: "The archive accessions its twenty-fourth record",
    summary: "A letter dated 2113 arrives in a returned library book. The line divides here.",
    detail:
      "The Returning Carrier has been arriving early for a month. Whether to answer it is the decision on which branches α and β part company. In our record, it has not yet been made.",
    artifactIds: ["DC-2442-CD", "SG-2332-GS"],
    certainty: 0.99,
  },

  // ── α · The Quiet Century ─────────────────────────────────────────────────────
  {
    id: "a-2029",
    branchId: "alpha",
    year: 2029,
    title: "The eleven seconds pass unremarked",
    summary: "The clocks in Lamm stop at noon, as forecast. Residents wait it out indoors.",
    detail:
      "Warned in advance, nobody is outside to see the birds hang in the air. The statements that reach the archive in 2026 are written by people who did not take the warning.",
    artifactIds: ["EV-2222-VE"],
    certainty: 0.72,
  },
  {
    id: "a-2034",
    branchId: "alpha",
    year: 2034,
    anchorId: "esker",
    title: "The Esker Accord is signed",
    summary: "Three pens, two signatures. Anomalous evidence must be catalogued, sealed and never answered.",
    detail:
      "The Returning Carrier is switched off the following night. The early copy stops arriving two nights before that. The archive closes its reading room to the public.",
    artifactIds: ["EV-1771-VE", "SG-2332-GS"],
    certainty: 0.68,
  },
  {
    id: "a-2048",
    branchId: "alpha",
    year: 2048,
    title: "The Varnholm harbour wall is extended",
    summary: "The right half of the 1931 photograph comes true, brick by brick.",
    detail:
      "Once the towers are finished, the plate slowly fades into an ordinary picture of an ordinary city. The archive files it under Resolved.",
    artifactIds: ["PL-0220-LP"],
    certainty: 0.64,
  },
  {
    id: "a-2052",
    branchId: "alpha",
    year: 2052,
    title: "The Absentimeter reads zero everywhere",
    summary: "In every room tested, nothing at all is missing.",
    detail:
      "Its keepers find this more unsettling than any reading that came before. The instrument is retired to a cupboard, where it reads 0.00 for the next sixty years.",
    artifactIds: ["LT-1661-TL"],
    certainty: 0.51,
  },
  {
    id: "a-2071",
    branchId: "alpha",
    year: 2071,
    title: "The wristwatch reaches zero",
    summary: "At 04:12 on 4 May, the Backwards Wristwatch stops.",
    detail:
      "Its last owner reports that nothing happened, and that this, she now understands, was the point.",
    artifactIds: ["OB-0550-BO"],
    certainty: 0.57,
  },
  {
    id: "a-2113",
    branchId: "alpha",
    year: 2113,
    anchorId: "letter",
    title: "The letter is written",
    summary: "A clerk at the sealed archive writes to the past, thanking it for a quiet century.",
    detail:
      "The Patience Engine finishes in the spring. Nobody laughs. The letter is folded into a library book and returned, eleven years late, to 2026.",
    artifactIds: ["DC-2442-CD", "LT-0110-TL"],
    certainty: 0.46,
  },

  // ── β · The Long Signal ───────────────────────────────────────────────────────
  {
    id: "b-2029",
    branchId: "beta",
    year: 2029,
    title: "The carrier is answered",
    summary: "On the third night, as the letter advises, the archive replies to Signal 7-Ø.",
    detail:
      "The reply arrives at the far end 87 seconds before it is sent. The far end replies in turn. The receiving station is never quiet again.",
    artifactIds: ["SG-2332-GS", "DC-2442-CD"],
    certainty: 0.74,
  },
  {
    id: "b-2034",
    branchId: "beta",
    year: 2034,
    anchorId: "esker",
    title: "The Esker table stays empty",
    summary: "No delegate will sign while the future is still talking.",
    detail:
      "The three pens are photographed, unused. The photograph begins to change soon afterwards, as if the other branches are signing it for us.",
    artifactIds: ["EV-1771-VE", "DC-1111-CD"],
    certainty: 0.7,
  },
  {
    id: "b-2041",
    branchId: "beta",
    year: 2041,
    title: "The committee votes to open the archive",
    summary: "Minuted in advance and carried by one vote.",
    detail:
      "The reading room opens to anyone who asks. The attendees’ names are finally settled, and the minutes held in our archive stop changing.",
    artifactIds: ["DC-1111-CD"],
    certainty: 0.66,
  },
  {
    id: "b-2061",
    branchId: "beta",
    year: 2061,
    title: "A concert in the Ostra Hall",
    summary: "The hall is built after all. The encore is a lullaby the audience already knows.",
    detail:
      "Two hundred and fourteen critics attend. Every one of them mentions the humming, and none of them can explain it.",
    artifactIds: ["EV-1551-VE", "SG-1221-GS"],
    certainty: 0.61,
  },
  {
    id: "b-2088",
    branchId: "beta",
    year: 2088,
    title: "The lock is patented",
    summary: "A patent is granted for a lock that opens only for the person who will need it.",
    detail:
      "The first lock made is fitted to the reading-room door. The archive’s key fits it. The ISBN on card 1,408 is issued the same week.",
    artifactIds: ["OB-2002-BO", "DC-0330-CD"],
    certainty: 0.55,
  },
  {
    id: "b-2113",
    branchId: "beta",
    year: 2113,
    anchorId: "letter",
    title: "The letter is sent",
    summary: "Written in a crowded, noisy century and posted backwards through a library book.",
    detail:
      "The Patience Engine finishes in the spring. The answer is one. Everybody laughs for a week. The letter arrives on 22 September 2026.",
    artifactIds: ["DC-2442-CD", "LT-0110-TL"],
    certainty: 0.49,
  },

  // ── γ · The Unbuilt World ─────────────────────────────────────────────────────
  {
    id: "g-1959",
    branchId: "gamma",
    year: 1959,
    title: "The Kessel line is never surveyed",
    summary: "Without the dam’s power contract, the railway is never planned.",
    detail:
      "The junction, its corridor and its telephone exchange are never built. In our branch they were built and then abandoned, which is how some of γ leaks into the corridor.",
    artifactIds: ["PL-1001-LP", "SG-0660-GS"],
    certainty: 0.8,
  },
  {
    id: "g-1961",
    branchId: "gamma",
    year: 1961,
    anchorId: "esker",
    title: "The Esker Accord is signed early",
    summary: "With no flooded valley to argue over, the delegates sign in an afternoon.",
    detail:
      "All three pens are used. Evidence from other branches is declared “unsuitable for keeping”, and the archive that would have become this one is never founded.",
    artifactIds: ["EV-1771-VE"],
    certainty: 0.77,
  },
  {
    id: "g-1977",
    branchId: "gamma",
    year: 1977,
    title: "Quell is restored to the atlases",
    summary: "A clerical inquiry reverses the removal. The island returns, smaller, and without its lighthouse.",
    detail:
      "Ferries run to the harbour twice a week. The tide tables are printed for a century ahead, and someone marks the bread-boat days in pencil.",
    artifactIds: ["PL-0880-LP", "DC-1881-CD"],
    certainty: 0.69,
  },
  {
    id: "g-1999",
    branchId: "gamma",
    year: 1999,
    title: "The Somnograph goes on sale",
    summary: "A consumer model sells forty thousand units before it is withdrawn.",
    detail:
      "Owners complained that they recognised the dreams it recorded, and that the dreams recognised them. The last surviving unit is the one now in our archive.",
    artifactIds: ["LT-1331-TL"],
    certainty: 0.58,
  },
  {
    id: "g-2062",
    branchId: "gamma",
    year: 2062,
    title: "The Ostra valley village turns two hundred",
    summary: "The village that lies beneath our reservoir holds a fair.",
    detail:
      "There is a brass band and a quarry open day. Divers in our branch report the band; a visitor to the quarry picks up a grey stone and, alone with it, sees a cube.",
    artifactIds: ["PL-1441-LP", "OB-2112-BO"],
    certainty: 0.52,
  },
  {
    id: "g-2113",
    branchId: "gamma",
    year: 2113,
    anchorId: "letter",
    title: "The letter is never written",
    summary: "With nothing kept, there is nothing to thank anyone for.",
    detail:
      "The Patience Engine stops in the spring, in a locked room in an empty house. Nobody is there to read the counter. In this branch, the archive receives no mail.",
    artifactIds: ["LT-0110-TL"],
    certainty: 0.44,
  },
];
