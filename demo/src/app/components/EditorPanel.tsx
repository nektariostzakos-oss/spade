"use client";

import { useEffect, useState } from "react";
import { useEditor } from "../../lib/editorClient";
import ImagePicker from "./ImagePicker";

export default function EditorPanel() {
  const { editing, closeEditor, content, patch } = useEditor();
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setDraft({ ...(content[editing] ?? {}) });
  }, [editing, content]);

  if (!editing) return null;

  const cur = (content[editing] ?? {}) as Record<string, unknown>;

  function setField(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const changes: Record<string, unknown> = {};
    for (const k of Object.keys(draft)) {
      if (draft[k] !== cur[k]) changes[k] = draft[k];
    }
    if (Object.keys(changes).length) {
      await patch(editing!, changes);
    }
    setSaving(false);
    closeEditor();
  }

  return (
    <>
      <div
        onClick={closeEditor}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 99,
        }}
      />
      <aside className="spade-editor-panel is-open">
        <div className="spade-editor-panel__head">
          <p className="spade-editor-panel__title">{editing}</p>
          <button
            onClick={closeEditor}
            aria-label="Close"
            style={{
              background: "none",
              border: 0,
              color: "var(--foreground)",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div className="spade-editor-panel__body">
          {renderForm(editing, draft, setField)}
        </div>
        <div className="spade-editor-panel__foot">
          <button
            onClick={closeEditor}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid var(--border-strong)",
              background: "transparent",
              color: "var(--foreground)",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: 0,
              background: "var(--gold)",
              color: "#000",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ============== forms per section ============== */

function renderForm(
  section: string,
  draft: Record<string, unknown>,
  set: (k: string, v: unknown) => void
) {

  if (section === "hero") {
    return (
      <>
        <Pair en={draft.pill_en} el={draft.pill_el} label="Pill" set={set} keyEn="pill_en" keyEl="pill_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <Pair en={draft.titleAccent_en} el={draft.titleAccent_el} label="Title accent (italic)" set={set} keyEn="titleAccent_en" keyEl="titleAccent_el" />
        <Pair en={draft.subtitle_en} el={draft.subtitle_el} label="Subtitle" set={set} keyEn="subtitle_en" keyEl="subtitle_el" textarea />
        <Pair en={draft.meta1_en} el={draft.meta1_el} label="Meta line 1" set={set} keyEn="meta1_en" keyEl="meta1_el" />
        <Pair en={draft.meta2_en} el={draft.meta2_el} label="Meta line 2" set={set} keyEn="meta2_en" keyEl="meta2_el" />
        <ImagePicker label="Background image" value={String(draft.bgImage ?? "")} onChange={(v) => set("bgImage", v)} />
        <Slider label="Background image opacity" value={Number(draft.bgOpacity ?? 90)} onChange={(v) => set("bgOpacity", v)} />
        <Slider label="Dark overlay strength" value={Number(draft.overlayStrength ?? 35)} onChange={(v) => set("overlayStrength", v)} />
        <Field label="Background video URL (mp4/webm/YouTube/Vimeo) — optional, overrides image" value={String(draft.bgVideo ?? "")} onChange={(v) => set("bgVideo", v)} />
        <ImagePicker label="Video poster image" value={String(draft.bgVideoPoster ?? "")} onChange={(v) => set("bgVideoPoster", v)} />
        <ImagePicker label="Side image" value={String(draft.sideImage ?? "")} onChange={(v) => set("sideImage", v)} />
        <Pair en={draft.sideRole_en} el={draft.sideRole_el} label="Side caption · role" set={set} keyEn="sideRole_en" keyEl="sideRole_el" />
        <Field label="Side caption · name" value={String(draft.sideName ?? "")} onChange={(v) => set("sideName", v)} />
      </>
    );
  }

  if (section === "info") {
    const items = (draft.items as Array<Record<string, string>>) ?? [];
    return (
      <Repeater
        items={items}
        onChange={(next) => set("items", next)}
        empty={{ label_en: "Label", label_el: "Ετικέτα", value_en: "", value_el: "" }}
        fields={[
          { key: "label_en", label: "Label (EN)" },
          { key: "label_el", label: "Label (EL)" },
          { key: "value_en", label: "Value (EN)" },
          { key: "value_el", label: "Value (EL)" },
        ]}
      />
    );
  }

  if (section === "testimonials") {
    const items = (draft.items as Array<Record<string, string>>) ?? [];
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <h4 style={{ margin: "20px 0 8px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>Quotes</h4>
        <Repeater
          items={items}
          onChange={(next) => set("items", next)}
          empty={{ quote_en: "", quote_el: "", name: "", role_en: "", role_el: "" }}
          fields={[
            { key: "quote_en", label: "Quote (EN)", textarea: true },
            { key: "quote_el", label: "Quote (EL)", textarea: true },
            { key: "name", label: "Name" },
            { key: "role_en", label: "Role (EN)" },
            { key: "role_el", label: "Role (EL)" },
          ]}
        />
      </>
    );
  }

  if (section === "cta") {
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" textarea />
        <Pair en={draft.subtitle_en} el={draft.subtitle_el} label="Subtitle" set={set} keyEn="subtitle_en" keyEl="subtitle_el" textarea />
        <ImagePicker label="Background image" value={String(draft.bgImage ?? "")} onChange={(v) => set("bgImage", v)} />
      </>
    );
  }

  if (section === "services") {
    const items = (draft.items as Array<Record<string, string | number>>) ?? [];
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <h4 style={{ margin: "20px 0 8px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>Services list</h4>
        <Repeater
          items={items}
          onChange={(next) => set("items", next)}
          empty={{ id: "new-svc", price: 10, duration: 30, name_en: "New service", name_el: "Νέα υπηρεσία", desc_en: "", desc_el: "" }}
          fields={[
            { key: "name_en", label: "Name (EN)" },
            { key: "name_el", label: "Name (EL)" },
            { key: "price", label: "Price (€)" },
            { key: "duration", label: "Duration (min)" },
            { key: "desc_en", label: "Description (EN)", textarea: true },
            { key: "desc_el", label: "Description (EL)", textarea: true },
            { key: "id", label: "Slug (id)" },
          ]}
        />
      </>
    );
  }

  if (section === "gallery_strip") {
    const images = (draft.images as Array<Record<string, string>>) ?? [];
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <h4 style={{ margin: "20px 0 8px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>Images</h4>
        <Repeater
          items={images}
          onChange={(next) => set("images", next)}
          empty={{ src: "" }}
          fields={[{ key: "src", label: "Image", image: true }]}
        />
      </>
    );
  }

  if (section === "gallery") {
    const items = (draft.items as Array<Record<string, string | boolean>>) ?? [];
    return (
      <Repeater
        items={items}
        onChange={(next) => set("items", next)}
        empty={{ src: "", tag: "Shop", big: false }}
        fields={[
          { key: "src", label: "Image", image: true },
          { key: "tag", label: "Tag (Cuts / Beards / Shop)" },
          { key: "big", label: "Larger cell (true / false)" },
        ]}
      />
    );
  }

  if (section === "about") {
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <Pair en={draft.p1_en} el={draft.p1_el} label="Paragraph 1" set={set} keyEn="p1_en" keyEl="p1_el" textarea />
        <Pair en={draft.p2_en} el={draft.p2_el} label="Paragraph 2" set={set} keyEn="p2_en" keyEl="p2_el" textarea />
        <Pair en={draft.p3_en} el={draft.p3_el} label="Paragraph 3" set={set} keyEn="p3_en" keyEl="p3_el" textarea />
        <ImagePicker label="Image" value={String(draft.image ?? "")} onChange={(v) => set("image", v)} />
      </>
    );
  }

  if (section === "team") {
    const members = (draft.members as Array<Record<string, string>>) ?? [];
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <h4 style={{ margin: "20px 0 8px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>Members</h4>
        <Repeater
          items={members}
          onChange={(next) => set("members", next)}
          empty={{ name_en: "Name", name_el: "Όνομα", role_en: "Barber", role_el: "Barber", years_en: "1 year", years_el: "1 χρόνος", slug: "new", image: "" }}
          fields={[
            { key: "name_en", label: "Name (EN)" },
            { key: "name_el", label: "Name (EL)" },
            { key: "role_en", label: "Role (EN)" },
            { key: "role_el", label: "Role (EL)" },
            { key: "years_en", label: "Years in chair (EN)" },
            { key: "years_el", label: "Years in chair (EL)" },
            { key: "slug", label: "Slug (booking link)" },
            { key: "image", label: "Photo", image: true },
          ]}
        />
      </>
    );
  }

  if (section === "faq") {
    const items = (draft.items as Array<Record<string, string>>) ?? [];
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" />
        <h4 style={{ margin: "20px 0 8px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>Questions</h4>
        <Repeater
          items={items}
          onChange={(next) => set("items", next)}
          empty={{ q_en: "", q_el: "", a_en: "", a_el: "" }}
          fields={[
            { key: "q_en", label: "Question (EN)" },
            { key: "q_el", label: "Question (EL)" },
            { key: "a_en", label: "Answer (EN)", textarea: true },
            { key: "a_el", label: "Answer (EL)", textarea: true },
          ]}
        />
      </>
    );
  }

  if (section === "contact") {
    const blocks = (draft.blocks as Array<Record<string, string>>) ?? [];
    return (
      <>
        <ImagePicker label="Image" value={String(draft.image ?? "")} onChange={(v) => set("image", v)} />
        <h4 style={{ margin: "20px 0 8px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>Info blocks</h4>
        <Repeater
          items={blocks}
          onChange={(next) => set("blocks", next)}
          empty={{ label_en: "Label", label_el: "Ετικέτα", value_en: "", value_el: "" }}
          fields={[
            { key: "label_en", label: "Label (EN)" },
            { key: "label_el", label: "Label (EL)" },
            { key: "value_en", label: "Value (EN)", textarea: true },
            { key: "value_el", label: "Value (EL)", textarea: true },
          ]}
        />
      </>
    );
  }

  if (section === "page_home") {
    return (
      <>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>
          Optional background image for the whole homepage. Shown behind
          every section with adjustable transparency.
        </p>
        <ImagePicker label="Background image" value={String(draft.bgImage ?? "")} onChange={(v) => set("bgImage", v)} />
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 6 }}>
            Opacity: {Number(draft.bgOpacity ?? 12)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Number(draft.bgOpacity ?? 12)}
            onChange={(e) => set("bgOpacity", Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gold)" }}
          />
          <p style={{ fontSize: 12, color: "var(--muted-2)", margin: "6px 0 0" }}>
            Tip: keep it between 8–20% so the image doesn&apos;t fight with
            the text above it.
          </p>
        </div>
      </>
    );
  }

  if (section.startsWith("page_")) {
    return (
      <>
        <Pair en={draft.eyebrow_en} el={draft.eyebrow_el} label="Eyebrow" set={set} keyEn="eyebrow_en" keyEl="eyebrow_el" />
        <Pair en={draft.title_en} el={draft.title_el} label="Title" set={set} keyEn="title_en" keyEl="title_el" textarea />
        <Pair en={draft.sub_en} el={draft.sub_el} label="Subtitle" set={set} keyEn="sub_en" keyEl="sub_el" textarea />
      </>
    );
  }

  if (section.startsWith("seo_")) {
    return (
      <>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>
          These appear in Google, social shares, and the browser tab. Keep the
          title under 60 chars and the description 140–160 chars.
        </p>
        <Pair en={draft.title_en} el={draft.title_el} label="Page title" set={set} keyEn="title_en" keyEl="title_el" />
        <Pair en={draft.description_en} el={draft.description_el} label="Meta description" set={set} keyEn="description_en" keyEl="description_el" textarea />
        <ImagePicker label="Social share image (1200×630)" value={String(draft.ogImage ?? "")} onChange={(v) => set("ogImage", v)} />
      </>
    );
  }

  if (section === "footer") {
    return (
      <>
        <Pair en={draft.lede_en} el={draft.lede_el} label="Lede" set={set} keyEn="lede_en" keyEl="lede_el" textarea />
        <Pair en={draft.cta_en} el={draft.cta_el} label="Big CTA" set={set} keyEn="cta_en" keyEl="cta_el" />
        <Pair en={draft.copy_en} el={draft.copy_el} label="Copyright line" set={set} keyEn="copy_en" keyEl="copy_el" />
        <Pair en={draft.tagline_en} el={draft.tagline_el} label="Tagline" set={set} keyEn="tagline_en" keyEl="tagline_el" />
      </>
    );
  }

  return <p style={{ color: "var(--muted)" }}>No editor for &quot;{section}&quot; yet.</p>;
}

function Pair({
  en, el, label, keyEn, keyEl, set, textarea,
}: {
  en: unknown; el: unknown; label: string; keyEn: string; keyEl: string;
  set: (k: string, v: unknown) => void; textarea?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)" }}>{label}</p>
      <Field label="EN" value={String(en ?? "")} onChange={(v) => set(keyEn, v)} textarea={textarea} />
      <Field label="EL" value={String(el ?? "")} onChange={(v) => set(keyEl, v)} textarea={textarea} />
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ margin: "12px 0" }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--muted-2)",
          marginBottom: 6,
        }}
      >
        {label}: {value}%
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--gold)" }}
      />
    </div>
  );
}

function Field({
  label, value, onChange, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-strong)",
    background: "var(--surface)",
    color: "var(--foreground)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  };
  return (
    <label style={{ display: "block", margin: "8px 0" }}>
      <span style={{ display: "block", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 4 }}>{label}</span>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </label>
  );
}

function Repeater<T extends Record<string, unknown>>({
  items, onChange, empty, fields,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  empty: T;
  fields: Array<{ key: keyof T; label: string; textarea?: boolean; image?: boolean }>;
}) {
  function update(i: number, key: keyof T, v: unknown) {
    const next = items.slice();
    next[i] = { ...next[i], [key]: v };
    onChange(next);
  }
  function remove(i: number) {
    const next = items.slice();
    next.splice(i, 1);
    onChange(next);
  }
  function add() {
    onChange([...items, { ...empty }]);
  }
  return (
    <>
      {items.map((it, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, marginBottom: 10, background: "var(--surface)" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-2)" }}>Item #{i + 1}</p>
          {fields.map((f) => {
            if (f.image) {
              return (
                <ImagePicker
                  key={String(f.key)}
                  label={f.label}
                  value={String(it[f.key] ?? "")}
                  onChange={(v) => update(i, f.key, v)}
                />
              );
            }
            return (
              <Field
                key={String(f.key)}
                label={f.label}
                value={String(it[f.key] ?? "")}
                onChange={(v) => update(i, f.key, v)}
                textarea={f.textarea}
              />
            );
          })}
          <button
            onClick={() => remove(i)}
            style={{
              marginTop: 4,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.1)",
              color: "#fca5a5",
              fontSize: 10,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px dashed rgba(201,169,97,0.5)",
          background: "rgba(201,169,97,0.1)",
          color: "var(--gold)",
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        + Add item
      </button>
    </>
  );
}
