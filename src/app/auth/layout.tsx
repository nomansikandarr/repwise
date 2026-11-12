import Image from "next/image";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-black text-white lg:block">
        <Image src="/images/run.jpg" alt="" fill priority sizes="50vw" className="object-cover object-[50%_60%] opacity-80" />
        <div className="photo-shade absolute inset-0" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="display max-w-md text-4xl">
            Har din
            <br />
            thora <span className="text-brand">behtar.</span>
          </p>
          <p className="mt-4 max-w-sm text-white/75">A little better every day. Programs, live sessions and coach chat in one place.</p>
        </div>
      </aside>
    </div>
  );
}
