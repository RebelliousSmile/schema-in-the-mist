/**
 * Labels of the printed zones of the :Otherscape blocks, French first with the
 * English beside, as the books and the French intro kit print them. Consumers
 * (Handbook, Lantern) read these labels instead of keeping their own, so a
 * zone is named the same everywhere. The names of the six card types (Theme,
 * Theme Kit, Challenge, Power Set, Character Trope, Loadout Item) and the
 * trope's Loadout stay English in French until the official French edition
 * names them.
 */
export interface OtherscapeLabel {
  readonly fr: string;
  readonly en: string;
}

export const OTHERSCAPE_THEME_TYPE_LABELS = {
  self: { fr: "Soi", en: "Self" },
  mythos: { fr: "Mythos", en: "Mythos" },
  noise: { fr: "Bruit", en: "Noise" },
  crew: { fr: "Équipe", en: "Crew" },
} as const satisfies Record<string, OtherscapeLabel>;

/** The Quest line of a theme kit, labelled after its theme type. */
export const OTHERSCAPE_QUEST_LABELS = {
  self: { fr: "Identité", en: "Identity" },
  mythos: { fr: "Rituel", en: "Ritual" },
  noise: { fr: "Démangeaison", en: "Itch" },
  crew: { fr: "Identité", en: "Identity" },
} as const satisfies Record<string, OtherscapeLabel>;

export const OTHERSCAPE_ZONE_LABELS = {
  "theme-kit": {
    power_tags: { fr: "Tags de pouvoir", en: "Power tags" },
    weakness_tags: { fr: "Tags de faiblesse", en: "Weakness tags" },
    special: { fr: "Spécial", en: "Special" },
  },
  "power-set": {
    kind: { fr: "Power set", en: "Power set" },
    tags_and_statuses: { fr: "Tags et statuts", en: "Tags & statuses" },
    threats: { fr: "Menaces / Conséquences", en: "Threats / Consequences" },
    specials: { fr: "Spéciaux", en: "Specials" },
    general_consequences: { fr: "Conséquences", en: "Consequences" },
  },
  "character-trope": {
    theme_kits: { fr: "Theme kits", en: "Theme kits" },
    choices: { fr: "Au choix", en: "Choose one" },
    loadout: { fr: "Loadout", en: "Loadout" },
  },
} as const satisfies Record<string, Record<string, OtherscapeLabel>>;
