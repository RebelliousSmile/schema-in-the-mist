/**
 * Visual intentions for Markdown callouts in :Otherscape notes, read from the
 * scenario pages of the Metro design (`act-0-crew.png`).
 *
 * Each entry names a Markdown identifier and its default aliases; the pack
 * stylesheet (`handbook/otherscape/assets/styles/otherscape.css`) draws it
 * through `.callout[data-brumes-callout-style="<id>"]`. The renvoi and the
 * read-aloud are untitled surfaces: their title, if any, is not shown.
 */
export const OTHERSCAPE_VISUAL_CALLOUTS = [
  // A pointer to another section or booklet (`Rapid Download #1`): a square grey surface, no border.
  {
    id: "otherscape-renvoi",
    label: "Renvoi",
    aliases: ["renvoi"],
    template: "body-only",
    capability: "style:otherscape",
    modifiers: [],
  },
  // Text the MC reads aloud to the players: typewriter face on a pale surface with a thin rule.
  {
    id: "otherscape-read-aloud",
    label: "Lecture à voix haute",
    aliases: ["read-aloud"],
    template: "body-only",
    capability: "style:otherscape",
    modifiers: [],
  },
  // A chapter opening (`chapter-title.jpg`): the pack's emblem, the title centred in the display face,
  // then the body as a lead in two columns. Its title is the chapter title, so it is shown.
  {
    id: "otherscape-chapter",
    label: "Tête de chapitre",
    aliases: ["chapter"],
    template: "title-body",
    capability: "style:otherscape",
    modifiers: [],
  },
] as const;

export type OtherscapeVisualCallout = (typeof OTHERSCAPE_VISUAL_CALLOUTS)[number];
