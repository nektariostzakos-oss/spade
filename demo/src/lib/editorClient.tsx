"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Content = Record<string, Record<string, unknown>>;

type Ctx = {
  content: Content;
  isAdmin: boolean;
  /** Update a section's fields and save. Returns when persisted. */
  patch: (section: string, fields: Record<string, unknown>) => Promise<void>;
  /** Open the side panel for a section. */
  openEditor: (section: string) => void;
  /** Currently open editor section (or null). */
  editing: string | null;
  closeEditor: () => void;
};

const Ctx = createContext<Ctx | null>(null);

export function EditorProvider({
  initialContent,
  children,
}: {
  initialContent: Content;
  children: ReactNode;
}) {
  const [content, setContent] = useState<Content>(initialContent);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.admin))
      .catch(() => {});
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      content,
      isAdmin,
      editing,
      openEditor: (s) => setEditing(s),
      closeEditor: () => setEditing(null),
      patch: async (section, fields) => {
        // Optimistic update
        setContent((c) => ({
          ...c,
          [section]: { ...(c[section] ?? {}), ...fields },
        }));
        await fetch("/api/content", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ section, patch: fields }),
        });
      },
    }),
    [content, isAdmin, editing]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEditor(): Ctx {
  const c = useContext(Ctx);
  if (!c) {
    return {
      content: {},
      isAdmin: false,
      editing: null,
      openEditor: () => {},
      closeEditor: () => {},
      patch: async () => {},
    };
  }
  return c;
}

/**
 * Read a section's current fields with a default fallback.
 */
export function useSection<T extends Record<string, unknown>>(
  section: string,
  defaults: T
): T {
  const { content } = useEditor();
  const live = (content[section] ?? {}) as Partial<T>;
  return { ...defaults, ...live };
}
