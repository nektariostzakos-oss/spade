import type { ReactElement } from "react";
import { ClubNight } from "./ClubNight";
import { LiveStage } from "./LiveStage";
import { AfternoonParty } from "./AfternoonParty";
import { MinimalEditorial } from "./MinimalEditorial";
import { FestivalBurst } from "./FestivalBurst";
import { CorporateLaunch } from "./CorporateLaunch";
import type { TemplateProps } from "./shared";

export type TemplateId =
  | "club-night"
  | "live-stage"
  | "afternoon-party"
  | "minimal-editorial"
  | "festival-burst"
  | "corporate-launch";

export const TEMPLATES: Record<TemplateId, (p: TemplateProps) => ReactElement> = {
  "club-night": ClubNight,
  "live-stage": LiveStage,
  "afternoon-party": AfternoonParty,
  "minimal-editorial": MinimalEditorial,
  "festival-burst": FestivalBurst,
  "corporate-launch": CorporateLaunch,
};

/** Default accent color per template — used as the color picker's initial value. */
export const TEMPLATE_DEFAULT_ACCENT: Record<TemplateId, string> = {
  "club-night": "#c4a96a",
  "live-stage": "#2a2a2a",
  "afternoon-party": "#3a1f1a",
  "minimal-editorial": "#8a2b2b",
  "festival-burst": "#ff3b6b",
  "corporate-launch": "#2b5cff",
};
