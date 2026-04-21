"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BusinessSettings } from "./settings";

const DEFAULT: BusinessSettings = {
  name: "Spade Barber",
  streetAddress: "El. Venizelou 37",
  city: "Loutraki",
  postalCode: "20300",
  country: "GR",
  phone: "+30 694 532 5780",
  email: "hello@spade.gr",
  latitude: 37.977,
  longitude: 22.974,
  hours: [
    { day: "mon", open: "09:00", close: "21:00", closed: false },
    { day: "tue", open: "09:00", close: "21:00", closed: false },
    { day: "wed", open: "09:00", close: "21:00", closed: false },
    { day: "thu", open: "09:00", close: "21:00", closed: false },
    { day: "fri", open: "09:00", close: "21:00", closed: false },
    { day: "sat", open: "09:00", close: "21:00", closed: false },
    { day: "sun", open: "00:00", close: "00:00", closed: true },
  ],
  social: { instagram: "", facebook: "", whatsapp: "", tiktok: "" },
  priceRange: "€€",
};

type Ctx = {
  business: BusinessSettings;
  refresh: () => Promise<void>;
  setBusiness: (b: BusinessSettings) => void;
};

const BusinessCtx = createContext<Ctx | null>(null);

export function BusinessProvider({
  initial,
  children,
}: {
  initial?: BusinessSettings;
  children: ReactNode;
}) {
  const [business, setBusiness] = useState<BusinessSettings>(initial ?? DEFAULT);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/business", { cache: "no-store" });
      if (!res.ok) return;
      const d = (await res.json()) as { business?: BusinessSettings };
      if (d.business) setBusiness({ ...DEFAULT, ...d.business });
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (!initial) refresh();
  }, [initial, refresh]);

  return (
    <BusinessCtx.Provider value={{ business, refresh, setBusiness }}>
      {children}
    </BusinessCtx.Provider>
  );
}

export function useBusiness(): Ctx {
  const ctx = useContext(BusinessCtx);
  if (!ctx) {
    return {
      business: DEFAULT,
      refresh: async () => {},
      setBusiness: () => {},
    };
  }
  return ctx;
}
