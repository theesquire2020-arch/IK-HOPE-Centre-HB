/**
 * Lightweight i18n scaffolding. The public site ships in English;
 * the Swahili dictionary below shows the structure is ready for a
 * full locale switch (add a ?lang=sw query or header toggle later).
 */
export type Lang = "en" | "sw";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    home: "Home",
    about: "About",
    programs: "Programs",
    campaigns: "Campaigns",
    contact: "Contact",
    donate: "Donate",
    donateNow: "Donate now",
    startFundraiser: "Start a Fundraiser",
    viewCampaigns: "View all campaigns",
    raised: "raised",
    of: "of",
    goal: "goal",
    support: "Support this campaign",
  },
  sw: {
    home: "Nyumbani",
    about: "Kuhusu Sisi",
    programs: "Mipango",
    campaigns: "Kampeni",
    contact: "Wasiliana Nasi",
    donate: "Changia",
    donateNow: "Changia Sasa",
    startFundraiser: "Anzisha Kampeni",
    viewCampaigns: "Ona kampeni zote",
    raised: "imekusanywa",
    of: "ya",
    goal: "lengo",
    support: "unga mkono kampeni hii",
  },
};

export function t(lang: Lang, key: string): string {
  return dict[lang]?.[key] ?? dict.en[key] ?? key;
}
