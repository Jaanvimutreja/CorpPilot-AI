import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: MessageSquareText,
    title: "Workplace Mentor",
    description:
      "Get practical, context-aware guidance for everyday workplace questions, backed by trusted resources.",
  },
  {
    number: "02",
    icon: BriefcaseBusiness,
    title: "Scenario Analyzer",
    description:
      "Navigate difficult conversations, changing priorities, and unfamiliar professional situations.",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Corporate Dictionary",
    description:
      "Understand the terminology that matters, from performance reviews and KPIs to CTC and notice periods.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Career Essentials",
    description:
      "Build confidence in workplace communication, onboarding, professional etiquette, and career development.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#18242D]">
      <nav className="sticky top-0 z-50 border-b border-[#E8EAE7] bg-[#FAFAF8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173F3D] text-lg font-semibold text-white">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight">
              CorpPilot<span className="text-[#40817A]">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-[#59636A] md:flex">
            <Link href="#features" className="hover:text-[#173F3D]">
              Platform
            </Link>
            <Link href="#how-it-works" className="hover:text-[#173F3D]">
              How it works
            </Link>
            <Link href="#about" className="hover:text-[#173F3D]">
              About
            </Link>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-md bg-[#173F3D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#245B56]"
          >
            Get Started <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-[#E8EAE7]">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1fr_0.95fr] lg:px-10 lg:py-32">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D8E5DF] bg-[#EFF5F1] px-4 py-2 text-xs font-semibold tracking-wide text-[#285F55]">
              <span className="h-2 w-2 rounded-full bg-[#40817A]" />
              YOUR WORKPLACE COMPANION
            </div>

            <h1 className="max-w-2xl text-5xl leading-[1.12] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
              Your career starts
              <br />
              before your
              <br />
              <span className="text-[#438078]">first day.</span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-8 text-[#667078]">
              The workplace doesn&apos;t come with a manual. CorpPilot
              helps you navigate professional life with clarity,
              confidence, and practical guidance.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/mentor"
                className="flex items-center gap-3 rounded-md bg-[#173F3D] px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#245B56]"
              >
                Explore CorpPilot <ArrowRight size={17} />
              </Link>

              <Link
                href="#how-it-works"
                className="flex items-center gap-2 rounded-md border border-[#D9DEDA] px-7 py-4 text-sm font-medium transition hover:bg-white"
              >
                See how it works <ChevronRight size={16} />
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-6 border-t border-[#E5E8E4] pt-7 text-sm text-[#68747A]">
              <span className="flex items-center gap-2">
                <Check size={16} className="text-[#438078]" />
                Built for freshers
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-[#438078]" />
                Practical guidance
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-[#438078]" />
                Source-backed answers
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-2xl border border-[#E6EAE5] bg-[#F0F3EF]" />

            <div className="relative overflow-hidden rounded-xl border border-[#DDE3DD] bg-white shadow-[0_25px_70px_-35px_rgba(20,45,40,0.3)]">
              <div className="flex items-center justify-between border-b border-[#EAEDEA] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F1ED] text-[#28685F]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Workplace Mentor</p>
                    <p className="text-xs text-[#89928F]">
                      Practical guidance, made simple
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[#EDF5EF] px-3 py-1 text-xs font-medium text-[#397456]">
                  Preview
                </span>
              </div>

              <div className="space-y-7 p-6 sm:p-8">
                <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#F1F3F1] p-5">
                  <p className="text-sm leading-6 text-[#34434A]">
                    My manager keeps changing priorities. How should I
                    handle this professionally?
                  </p>
                </div>

                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#173F3D] text-xs font-semibold text-white">
                      C
                    </div>
                    <span className="text-sm font-semibold">
                      CorpPilot
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-[#59676B]">
                    Shifting priorities can be challenging. The key is
                    to establish clarity while maintaining a
                    collaborative approach.
                  </p>

                  <div className="mt-6 rounded-lg border border-[#E5EAE5] bg-[#FBFCFA] p-5">
                    <p className="mb-4 text-xs font-semibold tracking-widest text-[#39776D] uppercase">
                      Recommended approach
                    </p>

                    <div className="space-y-4">
                      {[
                        "Clarify which tasks take priority.",
                        "Discuss how changes affect deadlines.",
                        "Document agreed expectations.",
                      ].map((item, index) => (
                        <div key={item} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E6F0EB] text-xs font-semibold text-[#39776D]">
                            {index + 1}
                          </span>
                          <p className="text-sm leading-6 text-[#4D5A5F]">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-[#7A8987]">
                    <BookOpen size={14} />
                    Source-backed guidance coming soon
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EAEDEA] bg-[#FCFDFC] px-6 py-5">
                <div className="flex items-center justify-between rounded-lg border border-[#E2E7E2] bg-white px-4 py-3">
                  <span className="text-sm text-[#9AA5A2]">
                    Ask a workplace question...
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#173F3D] text-white">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 hidden rounded-lg border border-[#E4E9E4] bg-white px-5 py-4 shadow-lg xl:block">
              <p className="text-xs font-medium text-[#83908A]">
                YOUR CAREER, DECODED.
              </p>
              <p className="mt-1 text-sm font-semibold text-[#23443F]">
                Clarity for every step →
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-[#438078] uppercase">
            THE PLATFORM
          </p>

          <h2 className="text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">
            Everything you wish you knew
            <br />
            <span className="text-[#438078]">
              before joining the workforce.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#748087]">
            From your first meeting to your first performance review,
            get the knowledge and guidance to navigate work with
            confidence.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-[#E2E7E2] bg-[#E2E7E2] md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className="group bg-white p-9 transition-colors duration-300 hover:bg-[#F4F8F5] sm:p-11"
              >
                <div className="mb-12 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#DDE9E2] bg-[#F0F6F1] text-[#39776D]">
                    <Icon size={22} strokeWidth={1.7} />
                  </div>

                  <span className="text-xs font-medium text-[#A1AAA5]">
                    / {feature.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-7 text-[#748087]">
                  {feature.description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#39776D]">
                  Explore feature
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-[#E2E7E2] bg-[#F0F3EF]"
      >
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-[#438078] uppercase">
              HOW IT WORKS
            </p>

            <h2 className="max-w-md text-4xl font-semibold tracking-[-0.045em]">
              Less uncertainty.
              <br />
              Better decisions.
            </h2>

            <p className="mt-6 max-w-md leading-8 text-[#748087]">
              CorpPilot combines workplace knowledge with practical
              guidance to help you understand situations and decide
              what to do next.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Ask your question",
                description:
                  "Describe a workplace situation or explore an unfamiliar corporate concept.",
              },
              {
                step: "02",
                title: "Get relevant context",
                description:
                  "CorpPilot retrieves relevant information from curated workplace resources.",
              },
              {
                step: "03",
                title: "Move forward confidently",
                description:
                  "Receive actionable guidance, suggested responses, and useful references.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <span className="text-sm font-semibold text-[#438078]">
                  {item.step}
                </span>

                <div className="border-b border-[#DCE3DB] pb-7">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#748087]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-28 text-center">
        <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-[#438078] uppercase">
          YOUR NEXT CHAPTER STARTS HERE
        </p>

        <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Enter the workplace
          <br />
          with confidence.
        </h2>

        <p className="mx-auto mt-6 max-w-lg leading-8 text-[#748087]">
          You&apos;ve prepared for the job. Now prepare for everything
          that comes with it.
        </p>

        <Link
          href="/mentor"
          className="mt-9 inline-flex items-center gap-3 rounded-md bg-[#173F3D] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#245B56]"
        >
          Start exploring <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="border-t border-[#E2E7E2] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#84908D] sm:flex-row">
          <span className="font-semibold text-[#173F3D]">
            CorpPilot.
          </span>
          <span>Navigate work. Build confidence.</span>
          <span>© {new Date().getFullYear()} CorpPilot AI</span>
        </div>
      </footer>
    </main>
  );
}