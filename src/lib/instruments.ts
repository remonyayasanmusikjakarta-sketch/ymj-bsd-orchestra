// Static instrument catalog used by both landing page and registration form.
export type SectionKey = "STRINGS" | "WOODWINDS" | "BRASS" | "PERCUSSION"

export interface InstrumentDef {
  name: string
  section: SectionKey
  emoji: string
}

export const INSTRUMENTS: InstrumentDef[] = [
  // Strings
  { name: "Violin", section: "STRINGS", emoji: "🎻" },
  { name: "Viola", section: "STRINGS", emoji: "🎻" },
  { name: "Cello", section: "STRINGS", emoji: "🎻" },
  { name: "Double Bass", section: "STRINGS", emoji: "🎻" },
  // Woodwinds
  { name: "Flute", section: "WOODWINDS", emoji: "🎵" },
  { name: "Oboe", section: "WOODWINDS", emoji: "🎵" },
  { name: "Clarinet", section: "WOODWINDS", emoji: "🎵" },
  { name: "Bassoon", section: "WOODWINDS", emoji: "🎵" },
  // Brass
  { name: "Trumpet", section: "BRASS", emoji: "🎺" },
  { name: "French Horn", section: "BRASS", emoji: "📯" },
  { name: "Trombone", section: "BRASS", emoji: "🎺" },
  { name: "Tuba", section: "BRASS", emoji: "🎺" },
  // Percussion
  { name: "Timpani", section: "PERCUSSION", emoji: "🥁" },
  { name: "Percussion", section: "PERCUSSION", emoji: "🥁" },
]

export const SECTIONS: { key: SectionKey; label: string; instruments: string[]; blurb: string }[] = [
  {
    key: "STRINGS",
    label: "Strings",
    instruments: ["Violin", "Viola", "Cello", "Double Bass"],
    blurb: "Tulang punggung orkes — suara yang menyatu dalam kehangatan dan ekspresi.",
  },
  {
    key: "WOODWINDS",
    label: "Woodwinds",
    instruments: ["Flute", "Oboe", "Clarinet", "Bassoon"],
    blurb: "Warna sonoritas yang khas — dari nyanyian flute hingga suara dalam bassoon.",
  },
  {
    key: "BRASS",
    label: "Brass",
    instruments: ["Trumpet", "French Horn", "Trombone", "Tuba"],
    blurb: "Proyeksi dan keagungan — memberi tubuh pada momen-momen monumental.",
  },
  {
    key: "PERCUSSION",
    label: "Percussion",
    instruments: ["Timpani", "Percussion"],
    blurb: "Detak jantung orkes — ritme, warna, dan dramatik dalam satu paket.",
  },
]

export function getSectionForInstrument(instrument: string): SectionKey {
  const found = INSTRUMENTS.find((i) => i.name.toLowerCase() === instrument.toLowerCase())
  return found?.section ?? "STRINGS"
}

export interface CategoryDef {
  key: "JUNIOR" | "COMMUNITY"
  label: string
  ageRange: string
  requirement: string
  emoji: string
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: "JUNIOR",
    label: "Junior Orchestra",
    ageRange: "Ages 8–16",
    requirement: "Min. 1 tahun belajar instrumen",
    emoji: "🎼",
  },
  {
    key: "COMMUNITY",
    label: "Community Orchestra",
    ageRange: "Teens & Adults",
    requirement: "Min. 2 tahun belajar instrumen",
    emoji: "🎵",
  },
]
