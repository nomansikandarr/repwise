/**
 * Demo content. `pnpm db:seed` copies trainers, programs, reviews and
 * applications from here into Postgres; the public pages read them from the
 * DB (src/lib/queries.ts). Bookings, chats, earnings and progress below are
 * still hardcoded until their phases (PLAN.md) replace them with real data.
 * Prices are whole Pakistani rupees. Dates are fixed strings on purpose
 * (no Date.now()) so pages can be fully prerendered.
 */

export type Trainer = {
  slug: string;
  name: string;
  city: string;
  headline: string;
  bio: string;
  specialties: string[];
  languages: string[];
  years: number;
  sessionPrice: number;
  sessionMinutes: number;
  rating: number;
  reviews: number;
  clients: number;
  photo: string;
  /** CSS object-position for the photo crop */
  focus?: string;
  badge?: string;
};

export const SPECIALTIES = [
  "Strength",
  "Fat loss",
  "Cricket fitness",
  "Home workouts",
  "Running",
  "Mobility",
  "Boxing",
  "Desi nutrition",
  "Women only",
] as const;

export const trainers: Trainer[] = [
  {
    slug: "hamza-sheikh",
    name: "Hamza Sheikh",
    city: "Lahore",
    headline: "Strength & muscle building coach",
    bio: "Certified strength coach with 9 years on the gym floor in Lahore. I build simple, heavy, progressive plans around your job, your family and your diet at home, with no imported supplements required. Most of my clients are office workers who want to look and feel strong again.",
    specialties: ["Strength", "Fat loss", "Desi nutrition"],
    languages: ["Urdu", "Punjabi", "English"],
    years: 9,
    sessionPrice: 3500,
    sessionMinutes: 60,
    rating: 4.9,
    reviews: 212,
    clients: 340,
    photo: "/images/dumbbell.jpg",
    focus: "50% 25%",
    badge: "Top rated",
  },
  {
    slug: "bilal-ahmed",
    name: "Bilal Ahmed",
    city: "Karachi",
    headline: "Cricket fitness & fast-bowling conditioning",
    bio: "Former first-class cricketer turned performance coach. I train club and academy players for pace, stamina and injury-free seasons, covering shoulder care, sprint work and match-day routines.",
    specialties: ["Cricket fitness", "Running", "Mobility"],
    languages: ["Urdu", "English"],
    years: 7,
    sessionPrice: 4000,
    sessionMinutes: 60,
    rating: 4.8,
    reviews: 148,
    clients: 190,
    photo: "/images/cricket.jpg",
    focus: "50% 20%",
    badge: "Cricket specialist",
  },
  {
    slug: "gurpreet-singh",
    name: "Gurpreet Singh",
    city: "Amritsar",
    headline: "Powerlifting & barbell technique",
    bio: "State-level powerlifter and coach. Squat, bench, deadlift done properly. I fix form first, then we add weight. Online form checks every week.",
    specialties: ["Strength", "Mobility"],
    languages: ["Punjabi", "Hindi", "English"],
    years: 11,
    sessionPrice: 3000,
    sessionMinutes: 45,
    rating: 4.9,
    reviews: 176,
    clients: 260,
    photo: "/images/train-turban.jpg",
    focus: "50% 20%",
  },
  {
    slug: "ayesha-siddiqui",
    name: "Ayesha Siddiqui",
    city: "Islamabad",
    headline: "Women-only strength & home workouts",
    bio: "I coach women who want to get strong in the privacy of their own home. All my live sessions are women-only, camera optional, and every plan works with dumbbells and a mat.",
    specialties: ["Women only", "Home workouts", "Strength"],
    languages: ["Urdu", "English"],
    years: 6,
    sessionPrice: 3200,
    sessionMinutes: 45,
    rating: 5.0,
    reviews: 131,
    clients: 210,
    photo: "/images/hijab-dumbbell.jpg",
    focus: "50% 20%",
    badge: "Women only",
  },
  {
    slug: "usman-tariq",
    name: "Usman Tariq",
    city: "Islamabad",
    headline: "Running coach, from first 5K to marathon",
    bio: "I started running on the Margalla trails and never stopped. I coach beginners to their first 5K and experienced runners to faster marathons, with plans that work around Fajr starts and summer heat.",
    specialties: ["Running", "Fat loss"],
    languages: ["Urdu", "English", "Pashto"],
    years: 5,
    sessionPrice: 2500,
    sessionMinutes: 45,
    rating: 4.7,
    reviews: 94,
    clients: 150,
    photo: "/images/run.jpg",
    focus: "50% 55%",
  },
  {
    slug: "rohan-mehta",
    name: "Rohan Mehta",
    city: "Mumbai",
    headline: "Mobility, yoga & desk-worker back care",
    bio: "Yoga teacher and mobility coach. If you sit eight hours a day and your back complains, we fix that with 20 minutes each morning.",
    specialties: ["Mobility", "Home workouts"],
    languages: ["Hindi", "English", "Marathi"],
    years: 8,
    sessionPrice: 2800,
    sessionMinutes: 45,
    rating: 4.8,
    reviews: 119,
    clients: 175,
    photo: "/images/stretch.jpg",
    focus: "60% 40%",
  },
  {
    slug: "imran-butt",
    name: "Imran Butt",
    city: "Gujranwala",
    headline: "Old-school strength, pehlwan style",
    bio: "Raised in the akhara, trained in the gym. Heavy basics, big meals and discipline. I coach men who want real, usable strength.",
    specialties: ["Strength", "Desi nutrition"],
    languages: ["Punjabi", "Urdu"],
    years: 14,
    sessionPrice: 3000,
    sessionMinutes: 60,
    rating: 4.9,
    reviews: 203,
    clients: 310,
    photo: "/images/imran.jpg",
    focus: "50% 18%",
  },
  {
    slug: "zara-khan",
    name: "Zara Khan",
    city: "Karachi",
    headline: "Boxing fitness & conditioning",
    bio: "Boxing coach and conditioning trainer. Pad work, footwork and fitness for all levels. Women-only groups available.",
    specialties: ["Boxing", "Fat loss", "Women only"],
    languages: ["Urdu", "English"],
    years: 5,
    sessionPrice: 3000,
    sessionMinutes: 45,
    rating: 4.8,
    reviews: 87,
    clients: 120,
    photo: "/images/hijab-boxing.jpg",
    focus: "35% 30%",
  },
];

export type Lesson = { id: string; title: string; minutes: number; preview?: boolean };

export type Program = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  trainer: string; // trainer slug
  /** Filled in by DB queries; mock data falls back to getTrainer(). */
  trainerName?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  weeks: number;
  cover: string;
  focus?: string;
  students: number;
  rating: number;
  tags: string[];
  lessons: Lesson[];
};

/** Lesson ids are their 1-based position, which is also how lesson URLs address them. */
function lessonSet(titles: string[]): Lesson[] {
  return titles.map((title, i) => ({
    id: String(i + 1),
    title,
    minutes: 8 + ((i * 7) % 19),
    preview: i === 0,
  }));
}

export const programs: Program[] = [
  {
    id: "desi-strength-12",
    title: "Desi Strength 12",
    tagline: "12 weeks to your strongest self",
    description:
      "A complete 12-week barbell and dumbbell program built for busy professionals. Three sessions a week, a diet built on roti, daal and chicken, and clear weekly targets.",
    trainer: "hamza-sheikh",
    level: "Beginner",
    price: 6500,
    weeks: 12,
    cover: "/images/hero.jpg",
    focus: "50% 25%",
    students: 1240,
    rating: 4.9,
    tags: ["Strength", "Gym"],
    lessons: lessonSet([
      "Welcome & how the program works",
      "Setting up your squat",
      "Bench press without shoulder pain",
      "The deadlift, step by step",
      "Week 1–4: building the base",
      "Eating for strength on a desi diet",
      "Week 5–8: adding load",
      "Fixing sticking points",
      "Week 9–12: peak and test",
      "What to do after week 12",
    ]),
  },
  {
    id: "fast-bowler-engine",
    title: "Fast Bowler's Engine",
    tagline: "Pace, stamina and a bulletproof shoulder",
    description:
      "Eight weeks of sprint work, rotational power and shoulder care designed for fast bowlers. Train like the academies do, with a ground and a few bands.",
    trainer: "bilal-ahmed",
    level: "Intermediate",
    price: 7500,
    weeks: 8,
    cover: "/images/cricket.jpg",
    focus: "50% 25%",
    students: 860,
    rating: 4.8,
    tags: ["Cricket", "Speed"],
    lessons: lessonSet([
      "Program overview",
      "Warm-up every bowler needs",
      "Sprint mechanics for the run-up",
      "Rotational power drills",
      "Shoulder care routine",
      "Lower-body strength day",
      "Match-week plan",
      "Recovery & workload management",
    ]),
  },
  {
    id: "ghar-pe-fit",
    title: "Ghar Pe Fit",
    tagline: "No gym. No excuses. 25 minutes a day.",
    description:
      "A six-week home workout plan using only your bodyweight and a mat. Made for small spaces and busy days.",
    trainer: "ayesha-siddiqui",
    level: "Beginner",
    price: 3500,
    weeks: 6,
    cover: "/images/pushup.jpg",
    focus: "50% 50%",
    students: 2130,
    rating: 4.9,
    tags: ["Home", "No equipment"],
    lessons: lessonSet([
      "Start here",
      "Full-body circuit A",
      "Core & posture",
      "Full-body circuit B",
      "Low-impact cardio",
      "Stretch & recover",
      "Progressing each week",
    ]),
  },
  {
    id: "first-5k",
    title: "Couch to 5K: Subah Edition",
    tagline: "Run your first 5K in 8 weeks",
    description:
      "Early-morning run/walk plan that beats the heat. Three runs a week, breathing drills and a simple stretching routine.",
    trainer: "usman-tariq",
    level: "Beginner",
    price: 3000,
    weeks: 8,
    cover: "/images/run.jpg",
    focus: "50% 60%",
    students: 1570,
    rating: 4.7,
    tags: ["Running", "Outdoors"],
    lessons: lessonSet([
      "Why run/walk works",
      "Your first week",
      "Breathing and pacing",
      "Running in the heat",
      "Week 4 check-in",
      "Strength for runners",
      "Race-day plan",
    ]),
  },
  {
    id: "ramadan-shred",
    title: "Ramadan Ready",
    tagline: "Train smart between iftar and sehri",
    description:
      "A 30-day plan for staying strong while fasting: short sessions timed around iftar, plus sehri and iftar meal guides.",
    trainer: "imran-butt",
    level: "Intermediate",
    price: 4500,
    weeks: 4,
    cover: "/images/imran.jpg",
    focus: "50% 18%",
    students: 980,
    rating: 4.9,
    tags: ["Ramadan", "Strength"],
    lessons: lessonSet([
      "Training while fasting: the rules",
      "Post-iftar strength session",
      "Sehri meals that last",
      "Light pre-iftar mobility",
      "Hydration plan",
      "Eid week deload",
    ]),
  },
  {
    id: "desk-back-reset",
    title: "Desk Back Reset",
    tagline: "20 minutes each morning for a pain-free back",
    description:
      "A gentle four-week mobility routine for people who sit all day. No equipment, suitable for all ages.",
    trainer: "rohan-mehta",
    level: "Beginner",
    price: 2500,
    weeks: 4,
    cover: "/images/stretch.jpg",
    focus: "60% 40%",
    students: 1890,
    rating: 4.8,
    tags: ["Mobility", "Home"],
    lessons: lessonSet([
      "How your back got stiff",
      "Morning routine A",
      "Hips and hamstrings",
      "Morning routine B",
      "Desk stretches",
      "Keeping it for life",
    ]),
  },
  {
    id: "daal-roti-macros",
    title: "Daal Roti Macros",
    tagline: "Lose fat eating the food you grew up with",
    description:
      "A practical nutrition course: portion guides for roti, rice, salan and chai, plus weekly meal plans your family can share.",
    trainer: "hamza-sheikh",
    level: "Beginner",
    price: 2800,
    weeks: 4,
    cover: "/images/food.jpg",
    focus: "50% 50%",
    students: 2740,
    rating: 4.8,
    tags: ["Nutrition", "Fat loss"],
    lessons: lessonSet([
      "Calories without the maths",
      "Building your plate",
      "Roti, rice and portions",
      "Protein on a budget",
      "Eating at weddings and dawats",
      "Your weekly meal plan",
    ]),
  },
  {
    id: "boxing-basics",
    title: "Boxing Basics",
    tagline: "Footwork, jab, cross: fitness that's fun",
    description:
      "Learn real boxing fundamentals while getting seriously fit. Six weeks, shadow boxing and bag work.",
    trainer: "zara-khan",
    level: "Beginner",
    price: 4000,
    weeks: 6,
    cover: "/images/hijab-boxing.jpg",
    focus: "35% 30%",
    students: 640,
    rating: 4.8,
    tags: ["Boxing", "Cardio"],
    lessons: lessonSet([
      "Stance and guard",
      "The jab",
      "Cross and combinations",
      "Footwork drills",
      "Bag work rounds",
      "Conditioning finisher",
    ]),
  },
];

export const getTrainer = (slug: string) => trainers.find((t) => t.slug === slug);
export const getProgram = (id: string) => programs.find((p) => p.id === id);
export const programsBy = (slug: string) => programs.filter((p) => p.trainer === slug);

export type Review = { name: string; city: string; avatar: string; rating: number; date: string; body: string };

export const reviews: Review[] = [
  {
    name: "Ali Raza",
    city: "Lahore",
    avatar: "/images/p-man1.jpg",
    rating: 5,
    date: "2 Nov 2026",
    body: "Lost 11 kg in four months without giving up roti. Hamza bhai's plan fits around my office hours and the weekly check-ins keep me honest.",
  },
  {
    name: "Saad Mahmood",
    city: "Faisalabad",
    avatar: "/images/p-pk1.jpg",
    rating: 5,
    date: "21 Oct 2026",
    body: "The live sessions are worth every rupee. He corrected my deadlift in ten minutes after I had been doing it wrong for two years.",
  },
  {
    name: "Fatima Noor",
    city: "Islamabad",
    avatar: "/images/p-woman.jpg",
    rating: 5,
    date: "14 Oct 2026",
    body: "I wanted a women-only coach I could train with from home. Ayesha's sessions are private, respectful and properly challenging.",
  },
  {
    name: "Vikram Nair",
    city: "Pune",
    avatar: "/images/p-man2.jpg",
    rating: 4,
    date: "30 Sep 2026",
    body: "Clear videos, no nonsense. My back pain from desk work is gone after three weeks of the morning routine.",
  },
  {
    name: "Hassan Javed",
    city: "Multan",
    avatar: "/images/p-pk2.jpg",
    rating: 5,
    date: "12 Sep 2026",
    body: "Added 8 km/h to my bowling over one off-season. The shoulder routine alone is worth the price.",
  },
  {
    name: "Danish Iqbal",
    city: "Karachi",
    avatar: "/images/p-man3.jpg",
    rating: 5,
    date: "3 Sep 2026",
    body: "Trained through Ramadan for the first time without losing strength. The iftar-timed sessions were a game changer.",
  },
];

/* ---------- Signed-in client (demo) ---------- */

export const me = {
  name: "Ali Raza",
  email: "ali.raza@example.com",
  city: "Lahore",
  avatar: "/images/p-man1.jpg",
};

export const myPrograms = [
  { id: "desi-strength-12", done: 6, next: "7" },
  { id: "daal-roti-macros", done: 2, next: "3" },
  { id: "desk-back-reset", done: 6, next: "6" },
];

export type Booking = {
  id: string;
  trainer: string;
  client: string;
  clientAvatar: string;
  day: string;
  time: string;
  minutes: number;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
  joinable?: boolean;
};

export const bookings: Booking[] = [
  { id: "bk-1042", trainer: "hamza-sheikh", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Today, 12 Nov", time: "7:30 PM", minutes: 60, price: 3500, status: "upcoming", joinable: true },
  { id: "bk-1047", trainer: "usman-tariq", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Sat, 14 Nov", time: "6:00 AM", minutes: 45, price: 2500, status: "upcoming" },
  { id: "bk-1051", trainer: "hamza-sheikh", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Thu, 19 Nov", time: "7:30 PM", minutes: 60, price: 3500, status: "upcoming" },
  { id: "bk-1019", trainer: "hamza-sheikh", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Thu, 5 Nov", time: "7:30 PM", minutes: 60, price: 3500, status: "completed" },
  { id: "bk-1003", trainer: "rohan-mehta", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Mon, 26 Oct", time: "8:00 AM", minutes: 45, price: 2800, status: "completed" },
  { id: "bk-0988", trainer: "bilal-ahmed", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Sun, 18 Oct", time: "5:00 PM", minutes: 60, price: 4000, status: "cancelled" },
];

export const slotDays = [
  { key: "thu", label: "Thu", date: "12 Nov", slots: ["7:30 PM", "9:00 PM"] },
  { key: "fri", label: "Fri", date: "13 Nov", slots: ["6:00 AM", "7:00 AM", "8:30 PM"] },
  { key: "sat", label: "Sat", date: "14 Nov", slots: ["6:00 AM", "10:00 AM", "5:00 PM", "8:00 PM"] },
  { key: "sun", label: "Sun", date: "15 Nov", slots: [] },
  { key: "mon", label: "Mon", date: "16 Nov", slots: ["6:00 AM", "7:30 PM", "9:00 PM"] },
  { key: "tue", label: "Tue", date: "17 Nov", slots: ["7:30 PM"] },
  { key: "wed", label: "Wed", date: "18 Nov", slots: ["6:00 AM", "7:00 AM", "9:00 PM"] },
];

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  reactions?: string[];
  replyTo?: string;
  thread?: number;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  online?: boolean;
  unread: number;
  last: string;
  when: string;
  messages: ChatMessage[];
};

const hamzaThread: ChatMessage[] = [
  { id: "m1", from: "them", text: "Assalam o alaikum Ali! How did Tuesday's squat session feel?", time: "6:02 PM" },
  { id: "m2", from: "me", text: "Wa alaikum assalam coach. Hit 80 kg for 5 on the last set. Knees felt fine this time.", time: "6:10 PM", reactions: ["💪", "🔥"] },
  { id: "m3", from: "them", text: "MashaAllah, that is 10 kg up in three weeks. Keep the same weight on Thursday and add one rep per set.", time: "6:12 PM", thread: 2 },
  { id: "m4", from: "me", text: "Got it. Quick question about diet: is two roti at dinner okay on training days?", time: "6:15 PM" },
  { id: "m5", from: "them", text: "Yes, two roti with salan and a bowl of daal is perfect. Just keep the chai to one cup after.", time: "6:18 PM", replyTo: "is two roti at dinner okay on training days?", reactions: ["👍"] },
  { id: "m6", from: "them", text: "See you on the call at 7:30 tonight. Bring your form-check video.", time: "6:19 PM" },
];

export const clientConversations: Conversation[] = [
  { id: "c1", name: "Hamza Sheikh", avatar: "/images/dumbbell.jpg", role: "Strength coach", online: true, unread: 2, last: "See you on the call at 7:30 tonight.", when: "6:19 PM", messages: hamzaThread },
  { id: "c2", name: "Usman Tariq", avatar: "/images/run.jpg", role: "Running coach", unread: 0, last: "Saturday 6 AM at F-9 park works.", when: "Yesterday", messages: [
    { id: "u1", from: "me", text: "Coach, can we do the Saturday session outdoors?", time: "4:40 PM" },
    { id: "u2", from: "them", text: "Saturday 6 AM at F-9 park works. Bring water, it is still warm.", time: "5:05 PM", reactions: ["👍"] },
  ] },
  { id: "c3", name: "Rohan Mehta", avatar: "/images/stretch.jpg", role: "Mobility coach", unread: 0, last: "Glad the back feels better!", when: "Mon", messages: [
    { id: "r1", from: "me", text: "Week 3 done. Back pain is almost gone.", time: "9:12 AM" },
    { id: "r2", from: "them", text: "Glad the back feels better! Keep the morning routine going.", time: "9:30 AM" },
  ] },
];

export const trainerConversations: Conversation[] = [
  { id: "t1", name: "Ali Raza", avatar: "/images/p-man1.jpg", role: "Desi Strength 12 · 4 sessions", online: true, unread: 1, last: "Is two roti at dinner okay on training days?", when: "6:15 PM", messages: hamzaThread.map((m) => ({ ...m, from: m.from === "me" ? "them" : "me" }) as ChatMessage) },
  { id: "t2", name: "Saad Mahmood", avatar: "/images/p-pk1.jpg", role: "2 sessions booked", unread: 3, last: "Sent you my deadlift video", when: "5:48 PM", messages: [
    { id: "s1", from: "them", text: "Coach, sent you my deadlift video. Is my back rounding?", time: "5:48 PM" },
  ] },
  { id: "t3", name: "Danish Iqbal", avatar: "/images/p-man3.jpg", role: "Ramadan Ready", unread: 0, last: "JazakAllah coach!", when: "Yesterday", messages: [
    { id: "d1", from: "me", text: "Great work this week Danish. Add 2.5 kg to bench next session.", time: "8:10 PM" },
    { id: "d2", from: "them", text: "JazakAllah coach!", time: "8:14 PM", reactions: ["🙏"] },
  ] },
  { id: "t4", name: "Hassan Javed", avatar: "/images/p-pk2.jpg", role: "New enquiry", unread: 0, last: "Do you coach beginners?", when: "Tue", messages: [
    { id: "h1", from: "them", text: "Salam, do you coach complete beginners? I am 38 and never been to a gym.", time: "11:02 AM" },
  ] },
];

export const notifications = [
  { id: "n1", icon: "calendar", title: "Session today at 7:30 PM", body: "Your 1:1 with Hamza Sheikh starts in 2 hours. You can join 10 minutes early.", when: "2h ago", unread: true },
  { id: "n2", icon: "message", title: "New message from Hamza Sheikh", body: "See you on the call at 7:30 tonight. Bring your form-check video.", when: "3h ago", unread: true },
  { id: "n3", icon: "check", title: "Booking confirmed", body: "Sat, 14 Nov at 6:00 AM with Usman Tariq. Rs 2,500 paid.", when: "Yesterday", unread: false },
  { id: "n4", icon: "play", title: "New lesson unlocked", body: "Week 5–8: adding load is now available in Desi Strength 12.", when: "2 days ago", unread: false },
  { id: "n5", icon: "refund", title: "Refund processed", body: "Rs 4,000 refunded for your cancelled session with Bilal Ahmed.", when: "18 Oct", unread: false },
  { id: "n6", icon: "star", title: "How was your session?", body: "Leave a review for Rohan Mehta and help others find a great coach.", when: "27 Oct", unread: false },
];

/* ---------- Signed-in trainer (demo: Hamza Sheikh) ---------- */

export const trainerMe = trainers[0];

export const trainerStats = {
  monthNet: 286200,
  monthGross: 318000,
  fee: 31800,
  lifetimeNet: 2412000,
  activeClients: 64,
  sessionsThisWeek: 14,
  rating: 4.9,
};

/** Net earnings per day for the last 30 days, in thousands of rupees. */
export const earnings30 = [6, 9, 4, 12, 8, 14, 3, 7, 11, 9, 13, 6, 10, 16, 5, 8, 12, 9, 15, 7, 11, 13, 6, 9, 14, 10, 17, 8, 12, 11];

export const payouts = [
  { id: "ord-7741", date: "12 Nov", client: "Ali Raza", item: "1:1 session · 60 min", type: "Session", gross: 3500, status: "Paid" },
  { id: "ord-7738", date: "12 Nov", client: "Saad Mahmood", item: "Desi Strength 12", type: "Program", gross: 6500, status: "Paid" },
  { id: "ord-7730", date: "11 Nov", client: "Danish Iqbal", item: "Daal Roti Macros", type: "Program", gross: 2800, status: "Paid" },
  { id: "ord-7722", date: "11 Nov", client: "Hassan Javed", item: "1:1 session · 60 min", type: "Session", gross: 3500, status: "Paid" },
  { id: "ord-7709", date: "10 Nov", client: "Omar Farooq", item: "1:1 session · 60 min", type: "Session", gross: 3500, status: "Refunded" },
  { id: "ord-7701", date: "9 Nov", client: "Kashif Ali", item: "Desi Strength 12", type: "Program", gross: 6500, status: "Paid" },
  { id: "ord-7694", date: "9 Nov", client: "Vikram Nair", item: "Daal Roti Macros", type: "Program", gross: 2800, status: "Paid" },
];

export const trainerSessions: Booking[] = [
  { id: "bk-1042", trainer: "hamza-sheikh", client: "Ali Raza", clientAvatar: "/images/p-man1.jpg", day: "Today, 12 Nov", time: "7:30 PM", minutes: 60, price: 3500, status: "upcoming", joinable: true },
  { id: "bk-1043", trainer: "hamza-sheikh", client: "Saad Mahmood", clientAvatar: "/images/p-pk1.jpg", day: "Today, 12 Nov", time: "9:00 PM", minutes: 60, price: 3500, status: "upcoming" },
  { id: "bk-1045", trainer: "hamza-sheikh", client: "Hassan Javed", clientAvatar: "/images/p-pk2.jpg", day: "Fri, 13 Nov", time: "6:00 AM", minutes: 60, price: 3500, status: "upcoming" },
  { id: "bk-1048", trainer: "hamza-sheikh", client: "Danish Iqbal", clientAvatar: "/images/p-man3.jpg", day: "Sat, 14 Nov", time: "10:00 AM", minutes: 60, price: 3500, status: "upcoming" },
  { id: "bk-1021", trainer: "hamza-sheikh", client: "Vikram Nair", clientAvatar: "/images/p-man2.jpg", day: "Tue, 10 Nov", time: "8:30 PM", minutes: 60, price: 3500, status: "completed" },
  { id: "bk-1017", trainer: "hamza-sheikh", client: "Omar Farooq", clientAvatar: "/images/p-man3.jpg", day: "Tue, 10 Nov", time: "7:00 AM", minutes: 60, price: 3500, status: "cancelled" },
];

export const trainerClients = [
  { name: "Ali Raza", city: "Lahore", avatar: "/images/p-man1.jpg", since: "Jul 2026", programs: 2, sessions: 14, spent: 58300, last: "Today" },
  { name: "Saad Mahmood", city: "Faisalabad", avatar: "/images/p-pk1.jpg", since: "Aug 2026", programs: 1, sessions: 9, spent: 38000, last: "Today" },
  { name: "Danish Iqbal", city: "Karachi", avatar: "/images/p-man3.jpg", since: "Mar 2026", programs: 2, sessions: 21, spent: 82800, last: "Yesterday" },
  { name: "Hassan Javed", city: "Multan", avatar: "/images/p-pk2.jpg", since: "Nov 2026", programs: 0, sessions: 1, spent: 3500, last: "Tue" },
  { name: "Vikram Nair", city: "Pune", avatar: "/images/p-man2.jpg", since: "Sep 2026", programs: 1, sessions: 4, spent: 16800, last: "10 Nov" },
  { name: "Fatima Noor", city: "Islamabad", avatar: "/images/p-woman.jpg", since: "Oct 2026", programs: 1, sessions: 0, spent: 2800, last: "2 Nov" },
];

export const weekAvailability = [
  { day: "Monday", on: true, ranges: ["6:00 AM – 9:00 AM", "7:00 PM – 10:00 PM"] },
  { day: "Tuesday", on: true, ranges: ["7:00 PM – 10:00 PM"] },
  { day: "Wednesday", on: true, ranges: ["6:00 AM – 9:00 AM", "7:00 PM – 10:00 PM"] },
  { day: "Thursday", on: true, ranges: ["7:00 PM – 10:00 PM"] },
  { day: "Friday", on: true, ranges: ["6:00 AM – 8:00 AM", "8:30 PM – 10:00 PM"] },
  { day: "Saturday", on: true, ranges: ["6:00 AM – 12:00 PM", "5:00 PM – 9:00 PM"] },
  { day: "Sunday", on: false, ranges: [] },
];

/* ---------- Admin ---------- */

export const applications = [
  { id: "ap-31", name: "Faisal Qureshi", city: "Peshawar", avatar: "/images/p-pk2.jpg", headline: "Calisthenics & bodyweight strength", years: 6, specialties: ["Home workouts", "Strength"], price: 2500, applied: "12 Nov 2026", status: "pending" as const, note: "ISSA certified. Runs a street-workout group in Hayatabad with 40+ members." },
  { id: "ap-30", name: "Arjun Kapoor", city: "Delhi", avatar: "/images/p-man2.jpg", headline: "Fat loss for busy professionals", years: 4, specialties: ["Fat loss", "Desi nutrition"], price: 3000, applied: "11 Nov 2026", status: "pending" as const, note: "ACE certified. Previously with a large gym chain; coaching online since 2024." },
  { id: "ap-29", name: "Maryam Yousaf", city: "Lahore", avatar: "/images/p-woman.jpg", headline: "Women-only pre & post-natal fitness", years: 7, specialties: ["Women only", "Mobility"], price: 3500, applied: "10 Nov 2026", status: "pending" as const, note: "Physiotherapy graduate. Sessions are women-only." },
  { id: "ap-28", name: "Shahid Anwar", city: "Sialkot", avatar: "/images/p-pk1.jpg", headline: "Football conditioning", years: 5, specialties: ["Running", "Mobility"], price: 2800, applied: "8 Nov 2026", status: "approved" as const, note: "AFC C-licence coach." },
  { id: "ap-27", name: "Kamran Siddiq", city: "Hyderabad", avatar: "/images/p-man3.jpg", headline: "General fitness", years: 1, specialties: ["Fat loss"], price: 1500, applied: "6 Nov 2026", status: "rejected" as const, note: "No certification or references provided." },
];
