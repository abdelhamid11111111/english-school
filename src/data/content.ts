import { toneBlur, unsplash } from "@/lib/blur";
import type {
  ContactChannel,
  CourseOption,
  FaqItem,
  HeroCard,
  NavLink,
  Persona,
  Service,
  SocialLink,
  Stat,
  Testimonial,
  ValueProp,
} from "@/types";

/**
 * Single source of copy for the whole page. Components import from here and
 * stay presentational, so rewording the site never touches a component.
 */

export const BRAND = {
  name: "Lumen English",
  short: "Lumen",
  tagline: "Speak with confidence, not just correctness.",
} as const;

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Approach", href: "#approach" },
  { label: "Courses", href: "#courses" },
  { label: "Why Lumen", href: "#why" },
  { label: "Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

/* ------------------------------------------------------------------ Hero -- */

export const HERO_CARDS: readonly HeroCard[] = [
  {
    id: "conversation",
    kicker: "Conversation",
    title: "Thursday Speaking Club",
    meta: "6 learners max · B1–C1",
    media: {
      src: unsplash("photo-1523240795612-9a054b0db644", 900),
      alt: "Four adult learners talking around a café table during a Lumen speaking club session.",
      blurDataURL: toneBlur("#8a7a68"),
    },
  },
  {
    id: "business",
    kicker: "Business",
    title: "Negotiation Intensive",
    meta: "8 weeks · Evenings",
    media: {
      src: unsplash("photo-1517048676732-d65bc937f952", 900),
      alt: "Colleagues in a bright meeting room practising a negotiation role-play in English.",
      blurDataURL: toneBlur("#7d8288"),
    },
  },
  {
    id: "exam",
    kicker: "Exam prep",
    title: "IELTS Band 7+ Track",
    meta: "12 weeks · Mock tests weekly",
    media: {
      src: unsplash("photo-1434030216411-0b793f4b4173", 900),
      alt: "A student writing timed practice essays at a desk covered in IELTS preparation notes.",
      blurDataURL: toneBlur("#6f6a60"),
    },
  },
  {
    id: "foundations",
    kicker: "Foundations",
    title: "First 500 Words",
    meta: "Absolute beginners · A0–A2",
    media: {
      src: unsplash("photo-1524178232363-1fb2b075b655", 900),
      alt: "A tutor guiding a small beginner class through vocabulary at a classroom table.",
      blurDataURL: toneBlur("#8b8272"),
    },
  },
];

/* ------------------------------------------------------------ Personas ---- */

export const PERSONAS: readonly Persona[] = [
  {
    id: "beginner",
    index: "01",
    label: "The Beginner",
    title: "You know a hundred words and none of the courage.",
    description:
      "We start with the sentences you'll actually say this week — ordering, introducing yourself, asking someone to repeat. Grammar arrives later, once it has something to hold on to.",
    outcomes: [
      "Hold a five-minute introduction by week three",
      "Phonics-first pronunciation, no phonetic alphabet required",
      "Zero-pressure speaking rooms with two tutors present",
    ],
    glyph: "spark",
  },
  {
    id: "professional",
    index: "02",
    label: "The Professional",
    title: "Your English is fine. The meeting is the problem.",
    description:
      "Fluency at work is a different skill: interrupting politely, disagreeing without damage, presenting under time pressure. We rehearse your real calendar, not a textbook's.",
    outcomes: [
      "Role-plays built from your own meeting recordings",
      "Email and deck reviews with same-week turnaround",
      "Industry vocabulary for finance, tech, medicine or law",
    ],
    glyph: "briefcase",
  },
  {
    id: "traveller",
    index: "03",
    label: "The Traveller",
    title: "You want to arrive somewhere and not feel like a tourist.",
    description:
      "Survival English gets you a hotel room. We aim higher — small talk, humour, asking for the thing that isn't on the menu, and understanding the accent you actually land in.",
    outcomes: [
      "Listening drills across six regional accents",
      "Situational packs: transit, health, housing, nightlife",
      "Conversation partners in the city you're moving to",
    ],
    glyph: "compass",
  },
  {
    id: "candidate",
    index: "04",
    label: "The Candidate",
    title: "There's a band score between you and the next thing.",
    description:
      "IELTS, TOEFL and Cambridge are exams before they are language tests. We teach the rubric as explicitly as the vocabulary, then drill until the timing stops being the hard part.",
    outcomes: [
      "Weekly full mock tests, marked against the live rubric",
      "Writing feedback keyed to each band descriptor",
      "Average +1.2 bands across a twelve-week track",
    ],
    glyph: "certificate",
  },
];

/* ------------------------------------------------------------- Services --- */

export const SERVICES: readonly Service[] = [
  {
    id: "private",
    index: "01",
    title: "Private lessons",
    summary: "One tutor, one plan, entirely your pace.",
    description:
      "A single tutor stays with you for the whole track, so nobody re-explains what you already know. Sessions are 55 minutes, scheduled around your week, with a written recap in your inbox the same day.",
    media: {
      src: unsplash("photo-1544717297-fa95b6ee9643", 1400),
      alt: "A tutor and a single student working through a lesson side by side at a table.",
      blurDataURL: toneBlur("#877c6c"),
    },
    facts: [
      { label: "Format", value: "1-to-1" },
      { label: "Session", value: "55 min" },
      { label: "Start", value: "Any week" },
    ],
  },
  {
    id: "group",
    index: "02",
    title: "Small group classes",
    summary: "Six people, one room, a lot of talking.",
    description:
      "Capped at six so everyone speaks every session — the single biggest predictor of progress we measure. Groups are placed by level and by goal, so nobody is bored and nobody is drowning.",
    media: {
      src: unsplash("photo-1543269865-cbf427effbad", 1400),
      alt: "A small group class of adult learners in discussion around a shared table.",
      blurDataURL: toneBlur("#7f7768"),
    },
    facts: [
      { label: "Class size", value: "6 max" },
      { label: "Rhythm", value: "2× / week" },
      { label: "Levels", value: "A1 – C2" },
    ],
  },
  {
    id: "business",
    index: "03",
    title: "Business English",
    summary: "The English your job actually asks for.",
    description:
      "Built from your own meetings, decks and inbox. We work on the moments that cost you — interrupting, pushing back, presenting a number you're not sure about — until they stop being moments.",
    media: {
      src: unsplash("photo-1600880292203-757bb62b4baf", 1400),
      alt: "Two professionals in a bright office reviewing documents together in English.",
      blurDataURL: toneBlur("#8d8479"),
    },
    facts: [
      { label: "Delivery", value: "On-site or remote" },
      { label: "Cohort", value: "Team or solo" },
      { label: "Track", value: "8 weeks" },
    ],
  },
  {
    id: "exam",
    index: "04",
    title: "Exam preparation",
    summary: "IELTS, TOEFL and Cambridge, taught as exams.",
    description:
      "Weekly full-length mocks marked against the live rubric, with feedback keyed to individual band descriptors. You'll know exactly which half-band you're missing and what fixes it.",
    media: {
      src: unsplash("photo-1546410531-bb4caa6b424d", 1400),
      alt: "A candidate completing a timed written exam paper in a quiet examination room.",
      blurDataURL: toneBlur("#8a8378"),
    },
    facts: [
      { label: "Mocks", value: "Weekly" },
      { label: "Avg. gain", value: "+1.2 bands" },
      { label: "Exams", value: "IELTS · TOEFL · CAE" },
    ],
  },
];

/* --------------------------------------------------------------- Why Us --- */

export const STATS: readonly Stat[] = [
  {
    id: "learners",
    value: 12400,
    suffix: "+",
    label: "Learners taught",
    caption: "Across 47 countries since 2009.",
  },
  {
    id: "bands",
    value: 1.2,
    prefix: "+",
    decimals: 1,
    label: "Average band gain",
    caption: "On the twelve-week IELTS track.",
  },
  {
    id: "retention",
    value: 94,
    suffix: "%",
    label: "Finish their track",
    caption: "Against an industry average near 60%.",
  },
  {
    id: "tutors",
    value: 68,
    label: "Certified tutors",
    caption: "CELTA or DELTA, minimum five years in room.",
  },
];

export const VALUE_PROPS: readonly ValueProp[] = [
  {
    id: "speaking-time",
    title: "Speaking time is the metric",
    description:
      "We measure minutes spoken per learner per session and publish it. Groups are capped at six because seven is where the quiet person stops talking.",
    glyph: "conversation",
  },
  {
    id: "one-tutor",
    title: "One tutor, start to finish",
    description:
      "Your tutor stays with you for the whole track. No re-introductions, no re-explaining the thing you already fixed three weeks ago.",
    glyph: "group",
  },
  {
    id: "evidence",
    title: "Progress you can see",
    description:
      "Levelled assessments every four weeks against the CEFR descriptors, with a written record of exactly what moved and what didn't.",
    glyph: "chart",
  },
  {
    id: "guarantee",
    title: "A track that holds",
    description:
      "Miss a session and it's credited, not lost. Don't reach your target level on an exam track and the next block is on us.",
    glyph: "shield",
  },
];

/* --------------------------------------------------------- Testimonials --- */

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "t1",
    quote:
      "I'd studied English for nine years and still froze on calls. Six weeks in, I ran a client review on my own. Nobody switched to my language once.",
    name: "Mariana Costa",
    country: "Brazil",
    flag: "🇧🇷",
    course: "Business English",
    rating: 5,
    avatar: {
      src: unsplash("photo-1494790108377-be9c29b29330", 200),
      alt: "",
      blurDataURL: toneBlur("#9b8577"),
    },
  },
  {
    id: "t2",
    quote:
      "Band 6.5 to 8.0 in one track. The mock marking was brutal in the best way — I knew my weak descriptor by week two and we just drilled it.",
    name: "Yusuf Demir",
    country: "Türkiye",
    flag: "🇹🇷",
    course: "IELTS Band 7+",
    rating: 5,
    avatar: {
      src: unsplash("photo-1507003211169-0a1dd7228f2d", 200),
      alt: "",
      blurDataURL: toneBlur("#7d7166"),
    },
  },
  {
    id: "t3",
    quote:
      "I started with about forty words. My tutor never once made me feel slow. I ordered dinner in Dublin last month and the waiter didn't blink.",
    name: "Aiko Tanaka",
    country: "Japan",
    flag: "🇯🇵",
    course: "First 500 Words",
    rating: 5,
    avatar: {
      src: unsplash("photo-1438761681033-6461ffad8d80", 200),
      alt: "",
      blurDataURL: toneBlur("#9a8878"),
    },
  },
  {
    id: "t4",
    quote:
      "The six-person cap is the whole product. In my old school of twenty I spoke maybe twice an hour. Here I can't hide, and that's the point.",
    name: "Lukas Berger",
    country: "Germany",
    flag: "🇩🇪",
    course: "Small group · B2",
    rating: 5,
    avatar: {
      src: unsplash("photo-1472099645785-5658abf4ff4e", 200),
      alt: "",
      blurDataURL: toneBlur("#6e6a63"),
    },
  },
  {
    id: "t5",
    quote:
      "We moved to Manchester in March. The accent packs were the thing — I'd trained on American English for a decade and understood nobody.",
    name: "Sofia Ricci",
    country: "Italy",
    flag: "🇮🇹",
    course: "Relocation track",
    rating: 5,
    avatar: {
      src: unsplash("photo-1573497019940-1c28c88b4f3e", 200),
      alt: "",
      blurDataURL: toneBlur("#8b8076"),
    },
  },
  {
    id: "t6",
    quote:
      "My tutor rebuilt the syllabus around my actual sales calls. By month two I was closing in English. That is not something I expected to type.",
    name: "Diego Herrera",
    country: "Mexico",
    flag: "🇲🇽",
    course: "Negotiation Intensive",
    rating: 5,
    avatar: {
      src: unsplash("photo-1500648767791-00dcc994a43e", 200),
      alt: "",
      blurDataURL: toneBlur("#75695e"),
    },
  },
];

/* ------------------------------------------------------------------ FAQ --- */

export const FAQS: readonly FaqItem[] = [
  {
    id: "level",
    question: "How do I know which level I'm in?",
    answer:
      "You'll take a 20-minute placement — a short written task and a live conversation with a tutor, not a multiple-choice quiz. We place you against the CEFR scale and tell you the reasoning. If the first session feels wrong, we move you at no cost.",
  },
  {
    id: "online",
    question: "Are classes online, in person, or both?",
    answer:
      "Both, and you can mix them within a single track. Group classes run in our studio and over video simultaneously, with the same tutor and the same materials. Private lessons are whichever you prefer, changeable week to week.",
  },
  {
    id: "miss",
    question: "What happens if I miss a session?",
    answer:
      "It's credited to your account, not lost. Group sessions are recorded and you get the recap notes the same day; private lessons can be rescheduled up to four hours before the start time.",
  },
  {
    id: "long",
    question: "How long until I actually notice a difference?",
    answer:
      "Most learners report a clear change in confidence around week three and a measurable level change at the first four-week assessment. Exam tracks average +1.2 bands over twelve weeks. We publish these numbers because we track them.",
  },
  {
    id: "tutors",
    question: "Who are the tutors?",
    answer:
      "Sixty-eight tutors, all CELTA- or DELTA-certified with a minimum of five years teaching adults. Roughly half are native speakers and half are highly proficient second-language speakers — which turns out to matter, because they've solved the problem you're solving.",
  },
  {
    id: "price",
    question: "What does it cost?",
    answer:
      "Group tracks start at €29 per session billed monthly; private lessons start at €54. Exam tracks are priced per block and include weekly marked mocks. There's no enrolment fee and no minimum term beyond the block you're in.",
  },
];

/* -------------------------------------------------------------- Contact --- */

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  {
    id: "studio",
    label: "Studio",
    value: "Rua das Flores 118, 1200-195 Lisboa, Portugal",
    href: "https://maps.google.com/?q=Rua+das+Flores+118+Lisboa",
    glyph: "compass",
  },
  {
    id: "phone",
    label: "Phone",
    value: "+351 21 099 4420",
    href: "tel:+351210994420",
    glyph: "conversation",
  },
  {
    id: "email",
    label: "Email",
    value: "hello@lumen-english.com",
    href: "mailto:hello@lumen-english.com",
    glyph: "certificate",
  },
  {
    id: "hours",
    label: "Open",
    value: "Mon – Fri, 08:00 – 21:00 WET",
    glyph: "chart",
  },
];

export const SOCIALS: readonly SocialLink[] = [
  { id: "instagram", label: "Instagram", href: "https://instagram.com" },
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
  { id: "youtube", label: "YouTube", href: "https://youtube.com" },
];

export const COURSE_OPTIONS: readonly CourseOption[] = [
  { value: "", label: "Select a course" },
  { value: "private", label: "Private lessons" },
  { value: "group", label: "Small group classes" },
  { value: "business", label: "Business English" },
  { value: "exam", label: "Exam preparation (IELTS / TOEFL / CAE)" },
  { value: "unsure", label: "Not sure yet — help me choose" },
];
