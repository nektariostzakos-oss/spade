import { NextRequest } from "next/server";
import { loadBusiness, loadBranding } from "../../../lib/settings";
import { listProducts } from "../../../lib/products";
import { getActiveServices } from "../../../lib/customServices";
import { getActiveStaff } from "../../../lib/customStaff";
import { loadContent } from "../../../lib/content";
import { respond, type ChatCtx } from "../../../lib/chatEngine";
import { listKb, searchKb, getKbAnswer } from "../../../lib/barberKnowledge";
import { allowAction, clientIp } from "../../../lib/rateLimit";

type ChatMsg = { role: "user" | "assistant"; content: string };

export async function GET() {
  // Always on — the concierge is local, free, no key required
  return Response.json({ enabled: true });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!allowAction(`chat:${ip}:min`, 20, 60_000)) {
    return Response.json({ reply: "Too many messages — give me a second.", intent: "rate_limit" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({})) as { messages?: ChatMsg[]; lang?: string };
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const last = incoming.at(-1);
  if (!last || last.role !== "user" || typeof last.content !== "string" || !last.content.trim()) {
    return Response.json({ reply: "What would you like to know?", intent: "empty" });
  }

  const [business, branding, products, services, staff, content] = await Promise.all([
    loadBusiness(),
    loadBranding(),
    listProducts().catch(() => []),
    getActiveServices().catch(() => []),
    getActiveStaff().catch(() => []),
    loadContent().catch(() => ({})) as Promise<Record<string, unknown>>,
  ]);

  const faqBlock = (content as { faq?: { items?: Array<{ q_en?: string; q_el?: string; a_en?: string; a_el?: string }> } }).faq;
  const faq = (faqBlock?.items ?? [])
    .filter((i) => i.q_en || i.q_el)
    .map((i) => ({
      q_en: i.q_en || "",
      q_el: i.q_el || "",
      a_en: i.a_en || "",
      a_el: i.a_el || "",
    }));

  const ctx: ChatCtx = {
    business,
    wordmark: branding.wordmark || business.name || "our team",
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      desc: s.desc,
    })),
    products,
    staff: staff.filter((s) => s.id !== "any"),
    faq,
  };

  const lang = body.lang === "el" ? "el" : "en";
  const query = last.content.slice(0, 1200);
  const reply = respond(query, ctx, lang);

  // If rules engine hit the generic fallback, try the knowledge base for barbering knowledge
  if (reply.intent === "fallback") {
    const kb = await listKb();
    const hit = searchKb(query, kb, lang);
    if (hit) {
      return Response.json({
        intent: `kb:${hit.category}`,
        text: getKbAnswer(hit, lang),
      });
    }
  }

  return Response.json(reply);
}
