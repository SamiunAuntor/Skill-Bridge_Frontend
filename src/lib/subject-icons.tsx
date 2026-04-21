import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Code2,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Music4,
  Palette,
  Sigma,
  Variable,
} from "lucide-react";

const subjectIcons: Record<string, LucideIcon> = {
  atom: Atom,
  book_open: BookOpen,
  briefcase_business: BriefcaseBusiness,
  calculator: Calculator,
  code2: Code2,
  flask_conical: FlaskConical,
  globe2: Globe2,
  landmark: Landmark,
  languages: Languages,
  music4: Music4,
  palette: Palette,
  sigma: Sigma,
  variable: Variable,
};

export const subjectIconOptions = Object.keys(subjectIcons);

export function getSubjectIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) {
    return BookOpen;
  }

  return subjectIcons[iconKey] ?? BookOpen;
}
