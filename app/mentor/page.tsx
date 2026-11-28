"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, Square, Brain, ChevronRight } from "lucide-react";
import {
  Plus, Send, MessageSquare, Sparkles,
  Trash2, Pencil, ArrowLeft, Loader2, BookOpen
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/v1";

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type Message = {
  id?: string;
  role: string;
  content: string;
  sources?: string[];
};

async function api(path: string, method = "GET", body?: object) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}

export default function MentorPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  async function toggleRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }

    if (transcribing || loading || startingRef.current) return;

    startingRef.current = true;
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia ||
          typeof MediaRecorder === "undefined") {
        throw new Error("Microphone recording is not supported.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        stream.getTracks().forEach(track => track.stop());

        setRecording(false);
        setTranscribing(true);

        try {
          const mime = recorder.mimeType || "audio/webm";
          const extension = mime.includes("mp4") ? "mp4"
            : mime.includes("ogg") ? "ogg" : "webm";

          const audio = new Blob(chunksRef.current, {
            type: mime
          });

          const form = new FormData();
          form.append("file", audio, `recording.${extension}`);

          const response = await fetch(`${API}/transcribe`, {
            method: "POST",
            body: form
          });

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const result = await response.json();

          setInput(previous =>
            [previous.trim(), result.text].filter(Boolean).join(" ").slice(0, 4000)
          );

        } catch {
          setError("Could not transcribe audio. Please try again.");
        } finally {
          setTranscribing(false);
          chunksRef.current = [];
        }
      };

      recorder.start();
      setRecording(true);

      timerRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 60000);

    } catch {
      streamRef.current?.getTracks().forEach(track => track.stop());
      setError("Microphone unavailable. Check browser permissions.");
      setRecording(false);
    } finally {
      startingRef.current = false;
    }
  }


  async function refreshConversations() {
    const data = await api("/conversations");
    setConversations(data);
  }

  useEffect(() => {
    refreshConversations().catch(() =>
      setError("Cannot connect to backend. Please start FastAPI.")
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setError("");
  }

  async function openChat(id: string) {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const data = await api(`/conversations/${id}/messages`);
      setActiveId(id);
      setMessages(data);
    } catch {
      setError("Could not load conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || loading || recording || transcribing) return;

    setLoading(true);
    setError("");
    setInput("");

    const previous = messages;
    setMessages([...previous, { role: "user", content: question }]);

    try {
      let id = activeId;

      if (!id) {
        const conversation = await api("/conversations", "POST", {
          title: question.slice(0, 80)
        });

        id = conversation.id;
        setActiveId(id);
      }

      const result = await api(
        `/conversations/${id}/messages`,
        "POST",
        { message: question }
      );

      setMessages([
        ...previous,
        { role: "user", content: question },
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources
        }
      ]);

      refreshConversations().catch(() =>
        setError("Reply received, but sidebar could not refresh.")
      );
    } catch {
      setError("Unable to complete request. Check backend and try again.");
      setMessages(previous);
      setInput(question);
    } finally {
      setLoading(false);
    }
  }

  async function renameChat(id: string, oldTitle: string) {
    const title = window.prompt("Rename conversation", oldTitle)?.trim();
    if (!title) return;

    try {
      await api(`/conversations/${id}`, "PATCH", { title });
      await refreshConversations();
    } catch {
      setError("Could not rename conversation.");
    }
  }

  async function deleteChat(id: string) {
    if (!window.confirm("Delete this conversation?")) return;

    try {
      await api(`/conversations/${id}`, "DELETE");

      if (activeId === id) newChat();

      await refreshConversations();
    } catch {
      setError("Could not delete conversation.");
    }
  }

  const suggestions = [
    "How should I communicate with my manager?",
    "What is a Performance Improvement Plan?",
    "How do I handle negative feedback?",
    "How should I prepare for my first day?"
  ];

  return (
    <main className="flex h-dvh overflow-hidden bg-[#FAFAF8] text-[#18242D]">

      <aside className="flex w-64 shrink-0 flex-col border-r border-[#E0E6E0] bg-[#F0F3EF]">

        <Link href="/" className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173F3D] font-semibold text-white">
            C
          </div>
          <span className="text-xl font-semibold">
            CorpPilot<span className="text-[#438078]">.</span>
          </span>
        </Link>

        <div className="px-4">
          <button
            disabled={loading || recording || transcribing}
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173F3D] px-4 py-3 text-sm font-medium text-white hover:bg-[#245B56] disabled:opacity-50"
          >
            <Plus size={18} /> New conversation
          </button>
        </div>


        <div className="mt-7 px-4">
          <p className="mb-3 px-2 text-xs font-semibold tracking-widest text-[#748087]">
            AI TOOLS
          </p>

          <div className="space-y-1">
            <Link
              href="/mentor"
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-[#DDE9E2] px-3 py-3 text-sm font-medium text-[#173F3D]"
            >
              <MessageSquare size={18} />
              Workplace Mentor
            </Link>

            <Link
              href="/scenario"
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#173F3D] transition hover:bg-[#DDE9E2]"
            >
              <Brain size={18} className="shrink-0 text-[#438078]" />
              <span className="flex-1">Scenario Analyzer</span>
              <ChevronRight size={15} className="text-[#438078] transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <p className="px-6 pb-3 pt-8 text-xs font-semibold tracking-widest text-[#748087]">
          RECENT CONVERSATIONS
        </p>

        <div className="flex-1 space-y-1 overflow-y-auto px-3">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-3 ${
                activeId === chat.id ? "bg-[#DDE9E2]" : "hover:bg-[#E5EBE5]"
              }`}
            >
              <button
                disabled={loading || recording || transcribing}
                onClick={() => openChat(chat.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
              >
                <MessageSquare size={15} className="shrink-0 text-[#438078]" />
                <span className="truncate">{chat.title}</span>
              </button>

              <button
                disabled={loading || recording || transcribing}
                title="Rename"
                onClick={() => renameChat(chat.id, chat.title)}
                className="text-[#748087] hover:text-[#173F3D]"
              >
                <Pencil size={13} />
              </button>

              <button
                disabled={loading || recording || transcribing}
                title="Delete"
                onClick={() => deleteChat(chat.id)}
                className="text-[#748087] hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-[#DCE3DB] p-5">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#59676B]">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">

        <header className="flex items-center justify-between border-b border-[#E5EAE5] bg-white px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#E8F1ED] p-3 text-[#28685F]">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-semibold">Workplace Mentor</h1>
              <p className="text-xs text-[#748087]">
                Your personal guide to professional life
              </p>
            </div>
          </div>

          <span className="rounded-full bg-[#EDF5EF] px-3 py-1 text-xs text-[#397456]">
            AI-powered
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl">

            {messages.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F1ED] text-[#28685F]">
                  <Sparkles size={30} />
                </div>

                <p className="mb-4 text-xs font-semibold tracking-widest text-[#438078]">
                  YOUR CAREER, DECODED
                </p>

                <h2 className="text-4xl font-semibold tracking-tight">
                  How can I help you today?
                </h2>

                <p className="mx-auto mt-4 max-w-lg leading-7 text-[#748087]">
                  Navigate workplace situations, understand corporate concepts,
                  and build confidence in your professional journey.
                </p>

                <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
                  {suggestions.map((question) => (
                    <button
                      key={question}
                      disabled={loading || recording || transcribing}
                      onClick={() => sendMessage(question)}
                      className="rounded-xl border border-[#DDE3DD] bg-white p-5 text-sm leading-6 transition hover:border-[#438078] hover:bg-[#F4F8F5]"
                    >
                      <MessageSquare size={18} className="mb-3 text-[#438078]" />
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={message.role === "user" ? "flex justify-end" : ""}
                >
                  {message.role === "user" ? (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#E5ECE6] px-5 py-4 text-base leading-7">
                      {message.content}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173F3D] text-sm font-semibold text-white">
                          C
                        </div>
                        <span className="text-sm font-semibold">CorpPilot</span>
                      </div>

                      <div className="mentor-markdown break-words text-[15px] leading-7 text-[#34434A]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {!!message.sources?.length && (
                        <div className="mt-5 rounded-lg border border-[#DDE3DD] bg-white p-4">
                          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#39776D]">
                            <BookOpen size={15} /> KNOWLEDGE SOURCES
                          </div>
                          {message.sources.map((source) => (
                            <p key={source} className="break-all py-1 text-xs text-[#748087]">
                              {source}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {loading && (
              <div className="mt-6 flex items-center gap-3 text-sm text-[#438078]">
                <Loader2 size={19} className="animate-spin" />
                CorpPilot is processing...
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <footer className="border-t border-[#E5EAE5] bg-[#FAFAF8] px-6 py-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-3 rounded-xl border border-[#DDE3DD] bg-white p-3 shadow-sm"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about workplace life..."
              maxLength={4000}
              rows={2}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(input);
                }
              }}
              className="flex-1 resize-none bg-transparent p-2 text-base leading-7 outline-none"
            />

            <button
              type="button"
              onClick={toggleRecording}
              disabled={transcribing || loading}
              title={recording ? "Stop recording" : "Voice input"}
              aria-label={recording ? "Stop recording" : "Voice input"}
              className={`rounded-lg p-3 transition disabled:opacity-50 ${
                recording
                  ? "animate-pulse bg-red-100 text-red-600"
                  : "bg-[#E8F1ED] text-[#173F3D] hover:bg-[#DDE9E2]"
              }`}
            >
              {transcribing ? (
                <Loader2 size={19} className="animate-spin" />
              ) : recording ? (
                <Square size={19} />
              ) : (
                <Mic size={19} />
              )}
            </button>

            <button
              type="submit"
              disabled={loading || recording || transcribing || !input.trim()}
              className="rounded-lg bg-[#173F3D] p-3 text-white transition hover:bg-[#245B56] disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-[#89928F]">
            English, Hindi & Hinglish supported. AI guidance may not always be accurate.
          </p>
        </footer>

      </section>
    </main>
  );
}

