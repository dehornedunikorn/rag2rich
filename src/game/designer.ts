// Eagerly import every designer image — keys are file basenames matching item ids.
const designerImages = import.meta.glob<{ default: string }>(
  "../assets/designer/*.jpg",
  { eager: true }
);
const imgById: Record<string, string> = {};
for (const path in designerImages) {
  const id = path.split("/").pop()!.replace(".jpg", "");
  imgById[id] = designerImages[path].default;
}

export interface DesignerItem {
  id: string;
  name: string;
  description: string; // cryptic pop-culture reference
  baseValue: number;
  weight: number;
  image?: string; // resolved from /assets/designer/{id}.jpg if present
  emoji: string;  // fallback / silhouette accent
}

const withImage = (item: Omit<DesignerItem, "image">): DesignerItem => ({
  ...item,
  image: imgById[item.id],
});

// 50 designer items — first 12 are hero art, rest fall back to themed gold cards.
export const DESIGNER_ITEMS: DesignerItem[] = [
  { id: "red_thriller",        name: "Red Thriller Jacket",   description: "Cause this is… a moonwalk away from being yours.", baseValue: 2400, weight: 1.4, emoji: "🕺" },
  { id: "time_traveler_shoes", name: "Time Traveler Shoes",   description: "Power-laces. About time, huh? Hits 88 mph not included.", baseValue: 3200, weight: 1.0, emoji: "👟" },
  { id: "saturday_fever_suit", name: "Saturday Night Suit",   description: "Stayin' alive on the dance floor since '77.", baseValue: 2800, weight: 1.5, emoji: "🪩" },
  { id: "wild_one_jacket",     name: "Wild One Studded",      description: "What are you rebelling against? Whaddya got?", baseValue: 2600, weight: 1.6, emoji: "🏍️" },
  { id: "dragon_tracksuit",    name: "Dragon Tracksuit",      description: "Yellow with two black stripes. The student is now the master.", baseValue: 2900, weight: 0.9, emoji: "🐉" },
  { id: "dude_robe",           name: "The Abiding Robe",      description: "It really tied the room together, man.", baseValue: 1800, weight: 0.9, emoji: "🎳" },
  { id: "nightmare_sweater",   name: "Nightmare Sweater",     description: "One, two, Freddy's coming for… your closet.", baseValue: 2200, weight: 1.0, emoji: "🔪" },
  { id: "tiffany_dress",       name: "Breakfast Dress",       description: "A little black number. Goes with pearls and pastries.", baseValue: 3500, weight: 0.5, emoji: "💎" },
  { id: "king_jumpsuit",       name: "Vegas King Jacket",     description: "Thank you. Thank you very much.", baseValue: 3000, weight: 1.3, emoji: "👑" },
  { id: "the_one_coat",        name: "The One Coat",          description: "There is no closet. Only the coat.", baseValue: 3400, weight: 1.8, emoji: "🕶️" },
  { id: "red_cap",             name: "The Red Cap",           description: "Worn by a catcher in a certain field of rye.", baseValue: 1500, weight: 0.2, emoji: "🧢" },
  { id: "escape_jumpsuit",     name: "Escape Jumpsuit",       description: "Crawled through 500 yards of foulness. Came out clean.", baseValue: 2000, weight: 1.1, emoji: "🪣" },

  // Remaining 38 — gold-frame placeholders, still cryptic.
  { id: "wand_robe",         name: "Boy Who Lived Robe",      description: "Nine and three-quarters tailored. Owl optional.",            baseValue: 2700, weight: 1.2, emoji: "⚡" },
  { id: "ring_cloak",        name: "Precious Cloak",          description: "One cloak to fool them all. Disappears in pictures.",        baseValue: 3100, weight: 1.0, emoji: "💍" },
  { id: "fedora_indy",       name: "Adventurer's Fedora",     description: "Belongs in a museum. Currently in your inventory.",          baseValue: 1700, weight: 0.3, emoji: "🤠" },
  { id: "shark_tee",         name: "Bigger Boat Tee",         description: "You're gonna need a bigger drawer.",                          baseValue: 1200, weight: 0.3, emoji: "🦈" },
  { id: "bunny_suit",        name: "Donnie Bunny Suit",       description: "28 days, 6 hours, 42 minutes, 12 seconds.",                  baseValue: 2300, weight: 1.4, emoji: "🐇" },
  { id: "mr_white_jumpsuit", name: "Heisenberg Hazmat",       description: "Yeah, science! 99.1% pure cotton.",                          baseValue: 2500, weight: 1.3, emoji: "🧪" },
  { id: "blade_coat",        name: "Replicant Trench",        description: "Tears in rain. Dry-clean only.",                             baseValue: 2900, weight: 1.6, emoji: "🌧️" },
  { id: "fight_soap_tee",    name: "First Rule Tee",          description: "We don't talk about the first rule.",                        baseValue: 1400, weight: 0.3, emoji: "🧼" },
  { id: "godfather_suit",    name: "Offer Suit",              description: "Made you a fit you can't refuse.",                           baseValue: 3300, weight: 1.7, emoji: "🍝" },
  { id: "gatsby_vest",       name: "Old Sport Vest",          description: "Old sport, the green light is on the lapel.",                baseValue: 2100, weight: 0.6, emoji: "🥂" },
  { id: "ghost_jumpsuit",    name: "Who You Gonna Suit",      description: "If there's something strange in the laundry hamper…",        baseValue: 2400, weight: 1.5, emoji: "👻" },
  { id: "stranger_tee",      name: "Upside Down Tee",         description: "Friends don't lie. Friends do steal vintage tees.",          baseValue: 1300, weight: 0.3, emoji: "🔦" },
  { id: "wakanda_robe",      name: "Vibranium Cloak",         description: "Forever. Hand-wash cold.",                                   baseValue: 3000, weight: 1.4, emoji: "🐆" },
  { id: "mando_armor",       name: "The Way Vest",            description: "This is the way. The way is dry-clean only.",                baseValue: 2800, weight: 1.8, emoji: "🪖" },
  { id: "doctor_scarf",      name: "Time Lord Scarf",         description: "Bow ties are cool. Twelve-foot scarves are cooler.",         baseValue: 1600, weight: 0.2, emoji: "🧣" },
  { id: "neo_glasses_coat",  name: "White Rabbit Coat",       description: "Knock, knock. It's the coat.",                               baseValue: 2700, weight: 1.5, emoji: "🐇" },
  { id: "joker_suit",        name: "Why So Suit",             description: "Have you ever danced with the dry-cleaner in the pale moonlight?", baseValue: 3200, weight: 1.6, emoji: "🃏" },
  { id: "kill_bill_suit",    name: "Bride Tracksuit",         description: "Yellow. Black stripes. Roaring rampage of fits.",            baseValue: 2900, weight: 1.0, emoji: "⚔️" },
  { id: "wonka_coat",        name: "Chocolatier Coat",        description: "Pure imagination. Slight cocoa stain.",                      baseValue: 2300, weight: 1.5, emoji: "🍫" },
  { id: "bond_tux",          name: "Shaken Tuxedo",           description: "The name's Linen. Black Linen.",                             baseValue: 3400, weight: 1.4, emoji: "🍸" },
  { id: "han_vest",          name: "Smuggler Vest",           description: "Never tell me the size.",                                    baseValue: 2200, weight: 0.7, emoji: "🚀" },
  { id: "zoolander_jacket",  name: "Blue Steel Jacket",       description: "Really, really, ridiculously good-looking.",                 baseValue: 2400, weight: 1.2, emoji: "💙" },
  { id: "rocky_robe",        name: "Italian Stallion Robe",   description: "Yo, Adrian — it's vintage.",                                 baseValue: 2000, weight: 1.0, emoji: "🥊" },
  { id: "matrix_dress",      name: "Trinity Dress",           description: "Dodge this. (You can't, it's already sold.)",                baseValue: 2800, weight: 0.6, emoji: "🟢" },
  { id: "mary_poppins_coat", name: "Practically Perfect Coat", description: "Bigger on the inside. Holds 47 umbrellas.",                 baseValue: 2100, weight: 1.4, emoji: "☂️" },
  { id: "buddy_elf_suit",    name: "Cotton-Headed Suit",      description: "Smiling's my favorite. Listings too.",                       baseValue: 1900, weight: 1.2, emoji: "🎄" },
  { id: "thor_cape",         name: "Mjolnir Cape",            description: "Whoever holds this cape, if they be worthy…",                baseValue: 3000, weight: 1.5, emoji: "⚡" },
  { id: "x_jacket",          name: "Adamantium Jacket",       description: "Bub.",                                                        baseValue: 2600, weight: 1.4, emoji: "🪒" },
  { id: "scott_hoodie",      name: "Pilgrim Hoodie",          description: "Defeated 7 evil exes. Still smells fine.",                   baseValue: 1500, weight: 0.7, emoji: "🎮" },
  { id: "lebowski_pants",    name: "Abide Sweatpants",        description: "The pants tied the outfit together.",                        baseValue: 1100, weight: 0.6, emoji: "🍹" },
  { id: "westeros_furs",     name: "Throne Furs",             description: "Winter is coming. Your closet too.",                         baseValue: 2700, weight: 2.0, emoji: "🐺" },
  { id: "jurassic_vest",     name: "Park Vest",               description: "Life, uh, finds a way to wear this vest.",                   baseValue: 1800, weight: 0.7, emoji: "🦖" },
  { id: "alien_jumpsuit",    name: "Nostromo Jumpsuit",       description: "In space, no one can hear you bargain.",                     baseValue: 2200, weight: 1.3, emoji: "👽" },
  { id: "shining_sweater",   name: "Room 237 Sweater",        description: "All work and no play makes a sick fit.",                     baseValue: 1700, weight: 0.9, emoji: "🪓" },
  { id: "kubrick_eyes_robe", name: "Wide Shut Robe",          description: "The password is… 'discount'.",                               baseValue: 2300, weight: 1.0, emoji: "🎭" },
  { id: "drive_jacket",      name: "Scorpion Jacket",         description: "Real human bean. Real polyester satin.",                     baseValue: 2500, weight: 1.1, emoji: "🦂" },
  { id: "ferris_vest",       name: "Day Off Vest",            description: "Life moves pretty fast. So do these listings.",              baseValue: 1600, weight: 0.5, emoji: "🎡" },
  { id: "mclovin_id_tee",    name: "McLovin Tee",             description: "One name. No surname. Big mood.",                            baseValue: 1200, weight: 0.3, emoji: "🪪" },
];

export const DESIGNER_BY_ID: Record<string, DesignerItem> =
  Object.fromEntries(DESIGNER_ITEMS.map((d) => [d.id, d]));
