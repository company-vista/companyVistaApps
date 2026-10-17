// Ported from vista-fronted/src/pages/companysignup/advisor.js (portal "best matches").
// App aur portal dono ek hi match % dikhayein, isliye scoring same rakhi gayi hai.

const PRIORITY_ATTR = {
  banking: 'banking',
  tax: 'tax',
  fast: 'speed',
  privacy: 'privacy',
  investor: 'investor',
  cost: 'cost',
};

const PURPOSE_AFFINITY = {
  STAFFING: { 'United States': 12, 'United Kingdom': 8 },
  SAAS: { 'United States': 10, 'United Kingdom': 6, Estonia: 8 },
  ECOM: { 'United States': 8, 'United Kingdom': 6, 'Hong Kong': 6 },
  CONSULT: { Estonia: 8, 'United Kingdom': 6 },
  TRADING: { 'Hong Kong': 12, Singapore: 12, 'United Arab Emirates': 10 },
};

const CUSTOMER_REGION = {
  us: 'Americas',
  eu: 'Europe',
  asia_me: 'Asia Pacific',
  global: 'Global',
  home: 'Local',
};

const COUNTRY_ATTRS = {
  'United States': { tax: 3, banking: 5, speed: 4, privacy: 3, investor: 5, cost: 4, stripeReady: 5, clientBase: ['Americas'] },
  Canada: { tax: 2, banking: 4, speed: 3, privacy: 3, investor: 3, cost: 3, stripeReady: 4, clientBase: ['Americas'] },
  Mexico: { tax: 3, banking: 3, speed: 3, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Americas'] },
  'Costa Rica': { tax: 4, banking: 2, speed: 3, privacy: 3, investor: 1, cost: 4, stripeReady: 2, clientBase: ['Americas'] },
  Brazil: { tax: 1, banking: 3, speed: 1, privacy: 2, investor: 3, cost: 2, stripeReady: 3, clientBase: ['Americas'] },
  Chile: { tax: 3, banking: 3, speed: 3, privacy: 2, investor: 3, cost: 3, stripeReady: 3, clientBase: ['Americas'] },
  Colombia: { tax: 2, banking: 3, speed: 2, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Americas'] },
  Peru: { tax: 2, banking: 2, speed: 2, privacy: 2, investor: 1, cost: 4, stripeReady: 2, clientBase: ['Americas'] },
  Uruguay: { tax: 4, banking: 3, speed: 3, privacy: 3, investor: 2, cost: 3, stripeReady: 2, clientBase: ['Americas'] },
  'United Kingdom': { tax: 2, banking: 5, speed: 5, privacy: 2, investor: 4, cost: 4, stripeReady: 5, clientBase: ['Europe', 'Global'] },
  Estonia: { tax: 5, banking: 3, speed: 5, privacy: 2, investor: 2, cost: 4, stripeReady: 4, clientBase: ['Europe', 'Global'] },
  Ireland: { tax: 4, banking: 4, speed: 3, privacy: 2, investor: 4, cost: 2, stripeReady: 5, clientBase: ['Europe'] },
  Germany: { tax: 2, banking: 4, speed: 2, privacy: 2, investor: 3, cost: 1, stripeReady: 4, clientBase: ['Europe'] },
  Netherlands: { tax: 3, banking: 4, speed: 3, privacy: 2, investor: 4, cost: 2, stripeReady: 5, clientBase: ['Europe'] },
  France: { tax: 2, banking: 4, speed: 2, privacy: 2, investor: 3, cost: 2, stripeReady: 4, clientBase: ['Europe'] },
  Switzerland: { tax: 3, banking: 5, speed: 2, privacy: 4, investor: 4, cost: 1, stripeReady: 4, clientBase: ['Europe', 'Global'] },
  Luxembourg: { tax: 4, banking: 5, speed: 3, privacy: 3, investor: 4, cost: 1, stripeReady: 4, clientBase: ['Europe', 'Global'] },
  Portugal: { tax: 3, banking: 4, speed: 3, privacy: 2, investor: 3, cost: 3, stripeReady: 4, clientBase: ['Europe'] },
  Spain: { tax: 2, banking: 4, speed: 2, privacy: 2, investor: 3, cost: 2, stripeReady: 4, clientBase: ['Europe'] },
  Italy: { tax: 2, banking: 3, speed: 2, privacy: 2, investor: 2, cost: 2, stripeReady: 4, clientBase: ['Europe'] },
  Poland: { tax: 4, banking: 3, speed: 4, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Europe'] },
  'Czech Republic': { tax: 4, banking: 3, speed: 4, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Europe'] },
  Romania: { tax: 4, banking: 3, speed: 4, privacy: 2, investor: 2, cost: 5, stripeReady: 3, clientBase: ['Europe'] },
  Bulgaria: { tax: 5, banking: 3, speed: 4, privacy: 2, investor: 2, cost: 5, stripeReady: 3, clientBase: ['Europe'] },
  Cyprus: { tax: 5, banking: 3, speed: 3, privacy: 3, investor: 2, cost: 3, stripeReady: 3, clientBase: ['Europe'] },
  Malta: { tax: 4, banking: 3, speed: 3, privacy: 2, investor: 2, cost: 2, stripeReady: 3, clientBase: ['Europe'] },
  Georgia: { tax: 5, banking: 3, speed: 5, privacy: 3, investor: 1, cost: 5, stripeReady: 2, clientBase: ['Europe'] },
  'United Arab Emirates': { tax: 5, banking: 3, speed: 3, privacy: 4, investor: 2, cost: 2, stripeReady: 2, clientBase: ['Middle East & Africa', 'Asia Pacific'] },
  'Saudi Arabia': { tax: 4, banking: 3, speed: 2, privacy: 3, investor: 2, cost: 2, stripeReady: 2, clientBase: ['Middle East & Africa'] },
  Qatar: { tax: 5, banking: 3, speed: 3, privacy: 3, investor: 2, cost: 2, stripeReady: 2, clientBase: ['Middle East & Africa'] },
  Bahrain: { tax: 5, banking: 4, speed: 3, privacy: 3, investor: 2, cost: 3, stripeReady: 2, clientBase: ['Middle East & Africa'] },
  Israel: { tax: 2, banking: 3, speed: 3, privacy: 2, investor: 5, cost: 2, stripeReady: 4, clientBase: ['Middle East & Africa', 'Global'] },
  Singapore: { tax: 4, banking: 5, speed: 4, privacy: 2, investor: 4, cost: 2, stripeReady: 4, clientBase: ['Asia Pacific', 'Global'] },
  'Hong Kong': { tax: 5, banking: 3, speed: 3, privacy: 3, investor: 3, cost: 3, stripeReady: 3, clientBase: ['Asia Pacific', 'Global'] },
  India: { tax: 2, banking: 3, speed: 2, privacy: 2, investor: 4, cost: 4, stripeReady: 3, clientBase: ['Asia Pacific'] },
  China: { tax: 2, banking: 2, speed: 2, privacy: 1, investor: 3, cost: 3, stripeReady: 1, clientBase: ['Asia Pacific'] },
  Japan: { tax: 2, banking: 4, speed: 2, privacy: 2, investor: 3, cost: 2, stripeReady: 4, clientBase: ['Asia Pacific'] },
  'South Korea': { tax: 2, banking: 4, speed: 3, privacy: 2, investor: 3, cost: 3, stripeReady: 4, clientBase: ['Asia Pacific'] },
  Malaysia: { tax: 3, banking: 3, speed: 3, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Asia Pacific'] },
  Thailand: { tax: 3, banking: 3, speed: 3, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Asia Pacific'] },
  Indonesia: { tax: 2, banking: 3, speed: 2, privacy: 2, investor: 2, cost: 4, stripeReady: 2, clientBase: ['Asia Pacific'] },
  Philippines: { tax: 2, banking: 3, speed: 2, privacy: 2, investor: 2, cost: 4, stripeReady: 3, clientBase: ['Asia Pacific'] },
  Australia: { tax: 2, banking: 4, speed: 3, privacy: 2, investor: 3, cost: 2, stripeReady: 4, clientBase: ['Asia Pacific'] },
  'New Zealand': { tax: 3, banking: 4, speed: 4, privacy: 2, investor: 3, cost: 3, stripeReady: 4, clientBase: ['Asia Pacific'] },
  'British Virgin Islands': { tax: 5, banking: 2, speed: 4, privacy: 5, investor: 2, cost: 3, stripeReady: 1, clientBase: ['Offshore'] },
  'Cayman Islands': { tax: 5, banking: 2, speed: 3, privacy: 5, investor: 3, cost: 2, stripeReady: 1, clientBase: ['Offshore'] },
  Mauritius: { tax: 4, banking: 3, speed: 3, privacy: 4, investor: 2, cost: 3, stripeReady: 2, clientBase: ['Offshore', 'Middle East & Africa'] },
  Seychelles: { tax: 5, banking: 2, speed: 4, privacy: 5, investor: 1, cost: 4, stripeReady: 1, clientBase: ['Offshore'] },
  Belize: { tax: 5, banking: 2, speed: 4, privacy: 5, investor: 1, cost: 5, stripeReady: 1, clientBase: ['Offshore'] },
  Barbados: { tax: 4, banking: 3, speed: 3, privacy: 4, investor: 2, cost: 3, stripeReady: 1, clientBase: ['Offshore'] },
  Panama: { tax: 4, banking: 3, speed: 3, privacy: 4, investor: 2, cost: 3, stripeReady: 2, clientBase: ['Offshore', 'Americas'] },
};

const DEFAULT_ATTRS = { tax: 3, banking: 3, speed: 3, privacy: 3, investor: 3, cost: 3, stripeReady: 3, clientBase: [] };

// Portal ka scoreCountries — score/maxScore se absolute match % nikalta hai.
export const scoreJurisdictions = (jurisdictions, { purpose, customerLocation, priorities = [], dayOneNeeds = [] }) => {
  const customerRegion = CUSTOMER_REGION[customerLocation];
  const affinity = PURPOSE_AFFINITY[purpose] || {};

  return jurisdictions
    .map((c) => {
      const a = COUNTRY_ATTRS[c.name] || DEFAULT_ATTRS;
      let score = 0;
      let maxScore = 0;

      priorities.forEach((p) => {
        const attr = PRIORITY_ATTR[p];
        if (attr) { score += a[attr] * 10; maxScore += 50; }
      });

      if (dayOneNeeds.includes('payments')) { score += a.stripeReady * 8; maxScore += 40; }
      if (dayOneNeeds.includes('multicurrency')) { score += a.banking * 5; maxScore += 25; }

      if (customerRegion && a.clientBase.includes(customerRegion)) { score += 25; maxScore += 25; }
      if (customerRegion === 'Global') { score += 10; maxScore += 25; }

      score += affinity[c.name] || 0;
      maxScore += 12;

      score += 8;
      maxScore += 8;

      const match = maxScore > 0 ? Math.min(99, Math.round((score / maxScore) * 100)) : 50;
      return { ...c, score, match };
    })
    .sort((x, y) => y.match - x.match || y.score - x.score);
};

export default scoreJurisdictions;
