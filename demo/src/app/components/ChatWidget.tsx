"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../../lib/i18n";
import { useBranding } from "../../lib/brandingClient";

type Action = { label: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; actions?: Action[] };

const STORAGE_KEY = "atelier_chat_v2";

export default function ChatWidget() {
  const pathname = usePathname();
  const { lang } = useLang();
  const { branding } = useBranding();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Voice
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);
  const lastSpokenRef = useRef<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages((JSON.parse(raw) as Msg[]).slice(-40));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Detect browser speech support
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const hasRecog = !!(w.SpeechRecognition || w.webkitSpeechRecognition);
    const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;
    setSpeechSupported(hasRecog && hasTTS);
    try {
      const pref = localStorage.getItem("atelier_chat_voice");
      if (pref === "1") setVoiceOn(true);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("atelier_chat_voice", voiceOn ? "1" : "0"); } catch {}
  }, [voiceOn]);

  // Map UI lang → BCP-47 code the browser SpeechRecognition/Synthesis expects
  function bcp47(l: string): string {
    switch (l) {
      case "el": return "el-GR";
      case "en": return "en-US";
      default: return `${l}-${l.toUpperCase()}`;
    }
  }

  // Speak the last assistant reply aloud when voice is on
  useEffect(() => {
    if (!voiceOn || !speechSupported) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || !last.content) return;
    if (lastSpokenRef.current === last.content) return;
    lastSpokenRef.current = last.content;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      // Strip markdown-ish formatting before speaking
      const plain = last.content.replace(/\*\*/g, "").replace(/\n+/g, ". ").slice(0, 600);
      const u = new SpeechSynthesisUtterance(plain);
      u.lang = bcp47(lang);
      u.rate = 1.0;
      u.pitch = 1.0;
      // Prefer a native voice in the target language if available
      const voices = synth.getVoices();
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(u.lang.toLowerCase().split("-")[0]));
      if (match) u.voice = match;
      synth.speak(u);
    } catch {}
  }, [messages, voiceOn, speechSupported, lang]);

  function startListening() {
    if (!speechSupported || listening) return;
    try {
      const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
      const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as new () => {
        lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
        start: () => void; stop: () => void; abort: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> & { length: number } }) => void;
        onerror: () => void; onend: () => void;
      };
      const rec = new Ctor();
      rec.lang = bcp47(lang);
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let finalText = "";
      rec.onresult = (e) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        finalText = transcript;
        setInput(transcript);
      };
      rec.onerror = () => { setListening(false); };
      rec.onend = () => {
        setListening(false);
        if (finalText.trim()) {
          // Small delay so user sees what was transcribed before it sends
          setTimeout(() => askRaw(finalText.trim()), 250);
          setInput("");
        }
      };
      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    const rec = recognitionRef.current as { stop?: () => void } | null;
    try { rec?.stop?.(); } catch {}
    setListening(false);
  }

  function stopSpeaking() {
    try { window.speechSynthesis.cancel(); } catch {}
  }

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/setup")) return null;

  const greeting = lang === "el"
    ? `Γεια σας · είμαι ο concierge του ${branding.wordmark || "site"}. Ρωτήστε με για ραντεβού, τιμές, ωράριο ή προϊόντα.`
    : `Hi — I'm the ${branding.wordmark || "site"} concierge. Ask me about bookings, prices, hours, or products.`;

  async function askRaw(text: string) {
    if (!text.trim() || busy) return;
    setErr(null);
    const nextMsgs: Msg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(nextMsgs);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs, lang }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.reply || d.error || "Something went wrong.");
      } else {
        setMessages((m) => [...m, {
          role: "assistant",
          content: typeof d.text === "string" ? d.text : (d.reply || ""),
          actions: Array.isArray(d.actions) ? d.actions : undefined,
        }]);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function send() {
    const t = input;
    setInput("");
    askRaw(t);
  }

  function reset() {
    setMessages([]);
    setErr(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  const placeholder = lang === "el" ? "Γράψε ένα μήνυμα…" : "Type a message…";
  const quickReplies = lang === "el"
    ? ["Ωράριο;", "Τιμές;", "Πώς κλείνω ραντεβού;", "Πού είστε;"]
    : ["What are your hours?", "How much is a cut?", "How do I book?", "Where are you?"];

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge" : "Open concierge"}
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed z-40 inline-flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          right: "1.25rem",
          bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
          background: "var(--gold)",
          color: "var(--background)",
          boxShadow: "0 18px 40px -10px color-mix(in srgb, var(--gold) 55%, transparent), 0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20 12c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.584.46 3.06 1.254 4.303L4 20l3.817-1.244A7.96 7.96 0 0 0 12 20c4.418 0 8-3.582 8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="15" cy="12" r="1" fill="currentColor"/>
          </svg>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-40 flex flex-col"
            style={{
              right: "1.25rem",
              bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
              width: "min(380px, calc(100vw - 2.5rem))",
              maxHeight: "min(580px, calc(100vh - 8rem))",
              background: "var(--background)",
              border: "1px solid var(--border-strong)",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "var(--gold)", color: "var(--background)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 8v8l9 6 9-6V8z"/></svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>Concierge</p>
                  <p className="text-sm font-serif leading-tight" style={{ color: "var(--foreground)" }}>
                    {branding.wordmark || "Atelier"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {speechSupported && (
                  <button
                    onClick={() => { if (voiceOn) stopSpeaking(); setVoiceOn((v) => !v); }}
                    aria-label={voiceOn ? "Mute voice" : "Enable voice replies"}
                    title={voiceOn ? (lang === "el" ? "Σίγαση φωνής" : "Mute voice") : (lang === "el" ? "Φωνητικές απαντήσεις" : "Voice replies")}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                    style={{
                      background: voiceOn ? "var(--gold)" : "transparent",
                      color: voiceOn ? "var(--background)" : "var(--muted)",
                      border: voiceOn ? "none" : "1px solid var(--border-strong)",
                    }}
                  >
                    {voiceOn ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06A7 7 0 0 1 14 18.7v2.07c4.57-.96 8-5.03 8-9.77s-3.43-8.81-8-9.77z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21L16.45 12.6c.04-.2.05-.4.05-.6zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7.01 7.01 0 0 1 19 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.17v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    )}
                  </button>
                )}
                <button
                  onClick={reset}
                  className="text-[10px] uppercase tracking-widest hover:underline"
                  style={{ color: "var(--muted-2)" }}
                >
                  {lang === "el" ? "Νέα" : "New"}
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <>
                  <div className="rounded-2xl px-4 py-3 text-sm"
                    style={{ background: "var(--surface-strong)", color: "var(--foreground)" }}>
                    {greeting}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quickReplies.map((q) => (
                      <button
                        key={q}
                        onClick={() => askRaw(q)}
                        disabled={busy}
                        className="rounded-full border px-3 py-1 text-[11px] hover:bg-white/5 disabled:opacity-50"
                        style={{ borderColor: "var(--border-strong)", color: "var(--muted)" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                      style={
                        m.role === "user"
                          ? { background: "var(--gold)", color: "var(--background)" }
                          : { background: "var(--surface-strong)", color: "var(--foreground)" }
                      }
                      dangerouslySetInnerHTML={{ __html: formatInline(m.content) }}
                    />
                    {m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.actions.map((a) => (
                          <Link
                            key={a.href + a.label}
                            href={a.href}
                            target={a.href.startsWith("http") ? "_blank" : undefined}
                            rel={a.href.startsWith("http") ? "noreferrer" : undefined}
                            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
                            style={{ background: "var(--gold)", color: "var(--background)" }}
                          >
                            {a.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2.5" style={{ background: "var(--surface-strong)" }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              {err && (
                <div className="rounded-lg border px-3 py-2 text-xs"
                  style={{
                    borderColor: "color-mix(in srgb, #e04d4d 35%, transparent)",
                    background: "color-mix(in srgb, #e04d4d 10%, transparent)",
                    color: "#e89c9c",
                  }}>
                  {err}
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 px-3 py-3"
              style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
              {speechSupported && (
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={busy}
                  aria-label={listening ? "Stop listening" : "Start voice input"}
                  className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full transition-all disabled:opacity-40"
                  style={
                    listening
                      ? { background: "#e04d4d", color: "white", boxShadow: "0 0 0 6px color-mix(in srgb, #e04d4d 25%, transparent)" }
                      : { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border-strong)" }
                  }
                >
                  {listening ? (
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "white" }} />
                      <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: "white" }} />
                    </span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V22h2v-3.08A7 7 0 0 0 19 12h-2z"/>
                    </svg>
                  )}
                </button>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder={listening ? (lang === "el" ? "Ακούω…" : "Listening…") : placeholder}
                disabled={busy || listening}
                className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-50"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border-strong)",
                  color: "var(--foreground)",
                  maxHeight: "120px",
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || busy || listening}
                className="shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-widest disabled:opacity-40"
                style={{ background: "var(--gold)", color: "var(--background)" }}
              >
                {busy ? "…" : (lang === "el" ? "Στείλε" : "Send")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--muted)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

// Tiny, safe inline formatter: **bold**, newlines → <br>. No HTML allowed in.
function formatInline(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, "<br/>");
}
