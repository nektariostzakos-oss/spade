import type { ReactElement } from "react";
import type { Layout } from "@/lib/design/axes";
import type { LayoutProps } from "./shared";
import { NoirLayout } from "./layouts/NoirLayout";
import { BrutalistLayout } from "./layouts/BrutalistLayout";
import { MemphisLayout } from "./layouts/MemphisLayout";
import { EditorialLayout } from "./layouts/EditorialLayout";
import { DuotoneLayout } from "./layouts/DuotoneLayout";
import { SwissLayout } from "./layouts/SwissLayout";

export const LAYOUT_COMPONENTS: Record<Layout, (p: LayoutProps) => ReactElement> = {
  noir: NoirLayout,
  brutalist: BrutalistLayout,
  memphis: MemphisLayout,
  editorial: EditorialLayout,
  duotone: DuotoneLayout,
  swiss: SwissLayout,
};
