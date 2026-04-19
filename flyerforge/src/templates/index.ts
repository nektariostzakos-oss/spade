import type { ReactElement } from "react";
import { ClubNight } from "./ClubNight";
import { LiveStage } from "./LiveStage";
import { AfternoonParty } from "./AfternoonParty";
import type { TemplateProps } from "./shared";

export type TemplateId = "club-night" | "live-stage" | "afternoon-party";

export const TEMPLATES: Record<TemplateId, (p: TemplateProps) => ReactElement> = {
  "club-night": ClubNight,
  "live-stage": LiveStage,
  "afternoon-party": AfternoonParty,
};
