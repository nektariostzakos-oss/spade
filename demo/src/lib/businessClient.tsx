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
  name: "Oakline Scissors",
  streetAddress: "47 Cranley Mews",
  city: "London",
  postalCode: "SW7 3BY",
  country: "GB",
  phone: "+44 20 7946 0412",
  email: "hello@oakline.studio",
  timezone: "Europe/London",
  latitude: 51.4935,
  longitude: -0.1781,
  hours: [
    { day: "mon", open: "10:00", close: "17:00", closed: false },
    { day: "tue", open: "10:00", close: "14:00", closed: false, open2: "17:00", close2: "21:00" },
    { day: "wed", open: "10:00", close: "17:00", closed: false },
    { day: "thu", open: "10:00", close: "14:00", closed: false, open2: "17:00", close2: "21:00" },
    { day: "fri", open: "10:00", close: "21:00", closed: false },
    { day: "sat", open: "10:00", close: "21:00", closed: false },
    { day: "sun", open: "00:00", close: "00:00", closed: true },
  ],
  social: { instagram: "", facebook: "", whatsapp: "", tiktok: "" },
  priceRange: "£££",
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
