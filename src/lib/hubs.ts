import type { CollectionEntry } from 'astro:content';

export type Recipe = CollectionEntry<'recipes'>;

export type Hub = {
  slug: string;
  title: string;
  navLabel: string;
  description: string;
  intro: string[];
  /** Match recipe.categories, or null when filtering by time only */
  category?: string;
  maxMinutes?: number;
};

/** Verzamelpagina's — copy bewust nuchter, geen marketingtaal. */
export const hubs: Hub[] = [
  {
    slug: 'snel',
    title: 'Snelle recepten',
    navLabel: 'Snel (≤15 min)',
    description:
      'Recepten die in een kwartier op tafel staan. Ideaal als je honger hebt en geen zin in gedoe.',
    intro: [
      'Soms wil je gewoon snel iets warms. Geen marinade van gisteren, geen oven die een uur moet voorverwarmen.',
      'Hier staan recepten die je in ongeveer 15 minuten kunt maken — lunch, diner of iets tussendoor. Boodschappen uit de supermarkt, stappen die je snapt.',
    ],
    maxMinutes: 15,
  },
  {
    slug: 'vegetarisch',
    title: 'Vegetarische recepten',
    navLabel: 'Vegetarisch',
    description:
      'Vegetarisch koken zonder gedoe: pasta, curry, salades en ovenkost. Lekker genoeg voor wie wél vlees eet.',
    intro: [
      'Geen tofu-filosofie, wel borden die vol smaken. Linzen, halloumi, pasta, traybakes — dingen die je doordeweeks wíl eten.',
      'Of je nu vega eet of gewoon eens geen vlees wil: dit zijn de recepten die hier vaak voorbijkomen.',
    ],
    category: 'Vegetarisch',
  },
  {
    slug: 'kindvriendelijk',
    title: 'Kindvriendelijke recepten',
    navLabel: 'Kindvriendelijk',
    description:
      'Eten dat kinderen (meestal) ook lusten: herkenbaar, niet te scherp, wel zelf gemaakt.',
    intro: [
      'Kinderen zijn geen restaurantcritici, maar ze weten wél wat ze niet lusten. Deze recepten houden het mild en herkenbaar.',
      'Denk pasta met tomatensaus, kipreepjes uit de oven, mini-pizza’s. Niks fancy — wel warm eten zonder discussie aan tafel.',
    ],
    category: 'Kindvriendelijk',
  },
  {
    slug: 'pasta',
    title: 'Pasta recepten',
    navLabel: 'Pasta',
    description:
      'Pasta voor doordeweeks: pesto, kaassaus, carbonara-met-room en klassiekers die gewoon werken.',
    intro: [
      'Pasta redt avonden. Een pan water, iets uit de koelkast, klaar.',
      'Van milde tomatensaus tot die “please don’t shoot me”-carbonara met crème fraîche — kies wat je zin in hebt.',
    ],
    category: 'Pasta',
  },
  {
    slug: 'lunch',
    title: 'Lunch recepten',
    navLabel: 'Lunch',
    description:
      'Snelle lunchideeën: wraps, salades, soep, broodjes. Klaar voor je de middag weer in duikt.',
    intro: [
      'Lunch hoeft geen boterham-met-kaas-loopje te zijn. Maar het mag wél snel.',
      'Hier: wraps, tonijnsalade, shakshuka, tortillapizza — dingen die je tussendoor of op kantoor (als je geluk hebt) kunt eten.',
    ],
    category: 'Lunch',
  },
  {
    slug: 'toetjes',
    title: 'Toetjes & zoetigheid',
    navLabel: 'Toetjes',
    description:
      'Snelle toetjes en bakwerk zonder drama: mok-brownie, trifle, bananencake en meer.',
    intro: [
      'Soms wil je iets zoets na het eten. Soms heb je bananen die bruin worden en moet er cake van komen.',
      'Korte toetjes, een trifle zonder ovenstress, en bakrecepten die niet voelen als een project.',
    ],
    category: 'Toetjes',
  },
];

export function getHub(slug: string): Hub | undefined {
  return hubs.find((h) => h.slug === slug);
}

export function filterHubRecipes(all: Recipe[], hub: Hub): Recipe[] {
  return all
    .filter((recipe) => {
      if (hub.maxMinutes != null && recipe.data.minutes > hub.maxMinutes) return false;
      if (hub.category && !recipe.data.categories.includes(hub.category)) return false;
      return hub.maxMinutes != null || hub.category != null;
    })
    .sort((a, b) => a.data.minutes - b.data.minutes || a.data.title.localeCompare(b.data.title, 'nl'));
}

/** Map recipe category labels to hub URLs where we have a verzamelpagina. */
export const categoryHubPath: Record<string, string> = {
  Vegetarisch: '/recepten/vegetarisch/',
  Kindvriendelijk: '/recepten/kindvriendelijk/',
  Pasta: '/recepten/pasta/',
  Lunch: '/recepten/lunch/',
  Toetjes: '/recepten/toetjes/',
};

export function hubsForRecipe(categories: string[], minutes: number): Hub[] {
  const matched: Hub[] = [];
  for (const hub of hubs) {
    if (hub.maxMinutes != null && minutes <= hub.maxMinutes) matched.push(hub);
    else if (hub.category && categories.includes(hub.category)) matched.push(hub);
  }
  return matched;
}
