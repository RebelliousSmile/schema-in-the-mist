/**
 * Labels of the printed zones of the :Otherscape blocks, French first with the
 * English beside, as the books and the French intro kit print them. Consumers
 * (Handbook, Lantern) read these labels instead of keeping their own, so a
 * zone is named the same everywhere. The names of the six card types (Theme,
 * Theme Kit, Challenge, Power Set, Character Trope, Loadout Item) and the
 * Loadout, on the trope and on the character sheet, stay English in French until the official French edition
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
  character: {
    upgrades: { fr: "Mise à niveau", en: "Upgrades" },
    upgrades_rule: {
      fr: "Chaque fois que l'on active votre tag de faiblesse, cochez une case de Mise à niveau sur ce thème. Quand vous cochez la troisième case, réinitialisez la piste et choisissez une Mise à niveau pour ce thème :",
      en: "Whenever your weakness tag is invoked, mark one upgrade box on that theme. When you mark three upgrade boxes, reset the track and choose one upgrade for that theme:",
    },
    upgrade_power_tag: { fr: "Choisir un nouveau tag de pouvoir", en: "Choose a new power tag" },
    upgrade_special: { fr: "Débloquer le Spécial de ce thème", en: "Unlock the theme special" },
    tag_combos: { fr: "Combos de tags", en: "Tag combos" },
    power: { fr: "Pouvoir", en: "Power" },
    loadout: { fr: "Loadout", en: "Loadout" },
  },
} as const satisfies Record<string, Record<string, OtherscapeLabel>>;

/**
 * A page of the character sheet. A sheet that declares pages is exported page by page: one image per
 * page, one printed sheet per page. Either the page prints fields of the document (`fields`, by name)
 * or it is the notes page (`notes_field`, the field the player writes into), never both. The notes
 * page is the last one.
 */
export interface OtherscapeCharacterPage {
  readonly id: string;
  readonly label: OtherscapeLabel;
  readonly fields?: readonly string[];
  readonly notes_field?: string;
}

/** The pages of an `otherscape/character` sheet, in print order. The notes page is always last. */
export const OTHERSCAPE_CHARACTER_PAGES = [
  {
    id: "sheet",
    label: { fr: "Fiche", en: "Sheet" },
    fields: ["name", "tag_combos", "loadout"],
  },
  {
    id: "themes",
    label: { fr: "Thèmes", en: "Themes" },
    fields: ["themes"],
  },
  {
    id: "notes",
    label: { fr: "Notes de partie", en: "Session notes" },
    notes_field: "session_notes",
  },
] as const satisfies readonly OtherscapeCharacterPage[];
