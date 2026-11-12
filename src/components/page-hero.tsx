import Image from "next/image";

/** Short dark photo banner used at the top of public listing pages. */
export function PageHero({
  eyebrow,
  title,
  body,
  image,
  focus = "50% 30%",
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  image: string;
  focus?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <Image src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" style={{ objectPosition: focus }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-black/20" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="eyebrow mb-4 text-brand">{eyebrow}</p>
        <h1 className="display max-w-3xl text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-md text-white/80">{body}</p>
      </div>
    </section>
  );
}
