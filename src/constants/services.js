// Base definition of the temporary Masjid services. All services are for ONE day.
// Price / unit / limit / description live in the database (admin can edit them), so screens
// that show prices must read services through the `useServices()` hook. The values below are
// only the starting data (also seeded by supabase/schema.sql) and the fixed parts:
// title, icon, mode, namaz lists and duties.
//  - price: rupees. `null` = rate not decided yet (UI shows "Rate on request").
//  - mode 'select':  user picks one or more items; total = price x number picked.
//  - mode 'package': fixed duties for the day. With `perPerson`, the user also picks how many
//    persons and the total = price x persons.
// `icon` is a MaterialCommunityIcons name.
const DAILY_NAMAZ = ['Fajr', 'Zuhar', 'Asar', 'Maghrib', 'Isha'];

export const SERVICES = [
  {
    id: 'imam',
    title: 'Arzi Imam',
    titleUr: 'Waqti Imam',
    icon: 'book-open-page-variant',
    price: 1000,
    unit: 'per namaz',
    limit: 'For 1 Day / 1 Namaz only',
    description: 'Imam for Nikah, Janaza Namaz, Dua, Taraweeh, Juma and daily Namaz.',
    descriptionUr: 'Imamat ke liye',
    mode: 'select',
    selectTitle: 'Namaz / Occasion',
    selectTitleUr: 'Namaz ya mauqa',
    groups: [
      {
        title: 'Occasions',
        titleUr: 'Khaas mauqe',
        items: ['Nikah', 'Janaza Namaz', 'Dua', 'Taraweeh', 'Juma'],
      },
      { title: 'Daily Namaz', titleUr: 'Roz ki namaz', items: DAILY_NAMAZ },
    ],
  },
  {
    id: 'moazzin',
    title: 'Arzi Moazzin',
    titleUr: 'Waqti Moazzin',
    icon: 'bullhorn-variant',
    price: 700,
    unit: 'per namaz',
    limit: 'For 1 Day / 1 Namaz only',
    description: 'Azan and Namaz for Fajr, Zuhar, Asar, Maghrib and Isha.',
    descriptionUr: 'Azan dene ke liye',
    mode: 'select',
    selectTitle: 'Azan / Namaz',
    selectTitleUr: 'Azan aur namaz',
    groups: [{ title: 'Daily Namaz', titleUr: 'Roz ki namaz', items: DAILY_NAMAZ }],
  },
  {
    id: 'khadim',
    title: 'Arzi Khadim',
    titleUr: 'Waqti Khadim',
    icon: 'hand-heart',
    price: 500,
    unit: 'per person / day',
    limit: 'For 1 Day only',
    description: 'Complete Masjid duty for the day.',
    descriptionUr: 'Masjid ki duty ke liye',
    mode: 'package',
    perPerson: true,
    dutiesTitle: 'Masjid Duty',
    dutiesTitleUr: 'Masjid ki duty',
    duties: [
      'Masjid Safai',
      'Wuzu Khana Safai',
      'Darri Bichana, Fan / Light dekhna',
      'Masjid kholna / band karna',
    ],
  },
  {
    id: 'cleaning',
    title: 'Cleaning Worker',
    titleUr: 'Safai Karigar',
    icon: 'broom',
    price: null, // TODO: rate not given yet
    unit: 'per person / day',
    limit: 'For 1 Day only',
    description: 'Latrine, Bathroom and Gusalkhana safai.',
    descriptionUr: 'Safai ke liye',
    mode: 'package',
    perPerson: true,
    dutiesTitle: 'Cleaning Work',
    dutiesTitleUr: 'Safai ka kaam',
    duties: ['Latrine Safai', 'Bathroom Safai', 'Gusalkhana Safai'],
  },
];

// Fixed info only (title, icon...). Do NOT use it for prices.
export const getServiceById = (id) => SERVICES.find((s) => s.id === id);
