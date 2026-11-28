"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Brain, Sparkles,
  MessageSquare, ShieldAlert, ListChecks,
  Compass, Copy, Check, Loader2, BookOpen
} from "lucide-react";

type Analysis = {
  interpretation: string;
  recommended_approach: string;
  professional_response: string;
  risks: string[];
  action_plan: string[];
  language: string;
  sources: string[];
};

const examples = [
  "My manager keeps assigning me work after office hours.",
  "My colleague is taking credit for my work.",
  "I received negative feedback during my internship.",
  "I feel uncomfortable asking my manager for help."
];

const API = process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1";

export default function ScenarioPage() {
  const [scenario, setScenario] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function analyze() {
    if (scenario.trim().length < 10 || loading) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(
        `${API}/scenario/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to analyze your situation."
        );
      }

      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(
        analysis.professional_response
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the response.");
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#18242D]">
      <header className="border-b border-[#E8EAE7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#173F3D] font-bold text-white">
              C
            </div>
            <span className="text-xl font-semibold">
              CorpPilot AI
            </span>
          </Link>

          <Link
            href="/mentor"
            className="flex items-center gap-2 text-sm text-[#40817A] hover:text-[#173F3D]"
          >
            <ArrowLeft size={16} />
            Back to Mentor
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DCE9E1] bg-[#EFF5F1] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#40817A]">
            <Sparkles size={14} />
            AI-powered workplace guidance
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-[#173F3D] md:text-5xl">
            Navigate the situation.
            <br />
            <span className="text-[#40817A]">
              Respond with confidence.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#748087]">
            Turn challenging workplace moments into clear,
            thoughtful and professional decisions with your
            AI scenario analyzer.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-[#E8EAE7] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#EFF5F1] p-3 text-[#173F3D]">
                <Brain size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Describe your situation
                </h2>
                <p className="text-sm text-[#748087]">
                  English, Hindi or Hinglish
                </p>
              </div>
            </div>

            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              maxLength={4000}
              placeholder="What happened? Tell us about the situation, your concerns and what you want to achieve..."
              className="min-h-[220px] w-full resize-y rounded-2xl border border-[#E8EAE7] bg-[#FAFAF8] p-5 text-base leading-7 outline-none transition focus:border-[#40817A]"
            />

            <div className="mt-2 text-right text-xs text-[#748087]">
              {scenario.length}/4000
            </div>

            <button
              onClick={analyze}
              disabled={loading || scenario.trim().length < 10}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-[#173F3D] px-6 py-4 font-medium text-white transition hover:bg-[#285B57] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Analyzing your situation...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Analyze Situation
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 border-t border-[#E8EAE7] pt-5">
              <p className="text-xs leading-5 text-[#748087]">
                Avoid sharing confidential company information
                or personally identifying details.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#E8EAE7] bg-[#EFF5F1] p-6 md:p-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#40817A]">
              Need inspiration?
            </p>

            <h2 className="mb-5 text-2xl font-semibold text-[#173F3D]">
              Common workplace situations
            </h2>

            <div className="space-y-3">
              {examples.map((example) => (
                <button
                  key={example}
                  disabled={loading}
                  onClick={() => setScenario(example)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#DCE9E1] bg-white p-4 text-left text-sm leading-6 transition hover:border-[#40817A]"
                >
                  {example}
                  <ArrowRight
                    size={17}
                    className="shrink-0 text-[#40817A]"
                  />
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 border-t border-[#DCE9E1] pt-5">
              <Compass
                size={22}
                className="shrink-0 text-[#40817A]"
              />
              <p className="text-sm leading-6 text-[#52736D]">
                Get practical guidance, a professional response
                and actionable next steps for your situation.
              </p>
            </div>
          </section>
        </div>

        {loading && (
          <div
            aria-live="polite"
            className="mt-10 animate-pulse space-y-4"
          >
            <div className="h-7 w-56 rounded-lg bg-[#DCE9E1]" />
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-40 rounded-2xl border border-[#E8EAE7] bg-[#EFF5F1]"
                />
              ))}
            </div>
          </div>
        )}

        {analysis && (
          <section className="mt-12">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#40817A]">
                  Your personalized guidance
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-[#173F3D]">
                  Situation Analysis
                </h2>
              </div>
              <span className="rounded-full bg-[#EFF5F1] px-4 py-2 text-sm text-[#40817A]">
                {analysis.language}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-[#DCE9E1] bg-[#EFF5F1] p-6">
                <Brain className="mb-4 text-[#40817A]" />
                <h3 className="mb-3 text-lg font-semibold text-[#173F3D]">
                  Situation Interpretation
                </h3>
                <p className="whitespace-pre-wrap leading-7">
                  {analysis.interpretation}
                </p>
              </article>

              <article className="rounded-2xl border border-[#E8EAE7] bg-white p-6">
                <Compass className="mb-4 text-[#40817A]" />
                <h3 className="mb-3 text-lg font-semibold">
                  Recommended Approach
                </h3>
                <p className="whitespace-pre-wrap leading-7">
                  {analysis.recommended_approach}
                </p>
              </article>

              <article className="rounded-2xl border border-[#E8EAE7] bg-white p-6 md:col-span-2">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-[#40817A]" />
                    <h3 className="text-lg font-semibold">
                      Suggested Professional Response
                    </h3>
                  </div>
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-2 rounded-lg border border-[#DCE9E1] px-4 py-2 text-sm text-[#40817A] hover:bg-[#EFF5F1]"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy response"}
                  </button>
                </div>

                <div className="whitespace-pre-wrap rounded-xl border-l-4 border-[#40817A] bg-[#FAFAF8] p-6 leading-7">
                  {analysis.professional_response}
                </div>
              </article>

              <article className="rounded-2xl border border-[#EADFC9] bg-[#FFF9EF] p-6">
                <ShieldAlert className="mb-4 text-[#A17A36]" />
                <h3 className="mb-4 text-lg font-semibold text-[#8B672D]">
                  Risks to Avoid
                </h3>
                <ul className="space-y-4">
                  {analysis.risks.map((risk, i) => (
                    <li key={i} className="flex gap-3 leading-6">
                      <span className="text-[#A17A36]">!</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-[#E8EAE7] bg-white p-6">
                <ListChecks className="mb-4 text-[#40817A]" />
                <h3 className="mb-4 text-lg font-semibold">
                  Your Action Plan
                </h3>
                <ol className="space-y-4">
                  {analysis.action_plan.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 leading-6">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#EFF5F1] text-xs font-semibold text-[#173F3D]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </article>
            </div>

            {analysis.sources.length > 0 && (
              <details className="mt-6 rounded-2xl border border-[#E8EAE7] bg-white p-5">
                <summary className="cursor-pointer text-sm font-medium text-[#40817A]">
                  <BookOpen size={17} className="mr-2 inline" />
                  Knowledge sources ({analysis.sources.length})
                </summary>
                <div className="mt-4 space-y-2">
                  {analysis.sources.map((source) => (
                    <p
                      key={source}
                      className="break-words rounded-lg bg-[#FAFAF8] p-3 text-sm text-[#748087]"
                    >
                      {source}
                    </p>
                  ))}
                </div>
              </details>
            )}

            <p className="mt-6 text-center text-xs leading-5 text-[#748087]">
              AI-generated guidance. Consider your workplace
              policies and individual circumstances before acting.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
