import React, { useState } from 'react';
import { s } from '../../../theme/responsive';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';

const FILTER_TAGS = [
  { id: '1', label: '🌐 Fully remote' },
  { id: '2', label: '💰 Lowest cost' },
  { id: '3', label: 'No funding planned' },
  { id: '4', label: '✏️ Edit', isAction: true },
];

const FEATURES = [
  {
    boldText: '$100 state fee',
    normalText: ' and only ',
    boldText2: '$60 a year',
    normalText2: ' after — the lowest running cost of any credible state.',
  },
  {
    boldText: 'No state income, franchise or gross receipts tax',
    normalText: ' of any kind.',
  },
  {
    boldText: 'Members stay off public record',
    normalText: ', with a lifetime proxy available if you want more.',
  },
  {
    boldText: '3–5 days',
    normalText: ' to form — among the fastest.',
  },
];

const CLOSE_ALTERNATIVES = [
  { icon: '🌵', name: 'New Mexico', desc: '$349 · no annual report ever · anonymous', match: '91%' },
  { icon: '🐎', name: 'Kentucky', desc: '$339 · cheapest to form · $15/yr', match: '85%' },
  { icon: '⚖️', name: 'Delaware', desc: '$423 · $300/yr · only if raising capital', match: '64%' },
];

export const STATES_DATA = [
  { code: 'WY', name: 'Wyoming', popularityRank: 1, tag: 'Best value', tagline: 'Best value, strong privacy', snippet: 'Lowest running costs in the US with no income tax and members kept off public record.', bestFor: 'Solo founders, e-commerce, holding companies, cost-conscious setups', keyPoints: ['$100 state fee — excellent value', 'No state income, franchise or gross receipts tax', 'Members not disclosed on public filings', 'Lifetime proxy permitted for added anonymity'], govtFees: { formation: 100, annual: 60, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report licence tax, $60 minimum, based on assets located in Wyoming.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–5 days', serviceFee: 299, stateIncomeTax: 'None', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No staffing licence. Formation-only state for most agencies.', verified: false }, icon: '⛰️', subtitle: 'LLC · best value overall', match: '94%', price: '$399', priceNote: '$299 package + $100 state', features: FEATURES, warning: 'if you later raise VC money, expect investors to ask you to redomesticate to Delaware.', desc: '$100 state fee and only $60 a year after' },
  { code: 'DE', name: 'Delaware', popularityRank: 2, tag: 'Top pick', tagline: 'What investors expect', snippet: 'The state VCs insist on. Court of Chancery gives the deepest business-law precedent anywhere.', bestFor: 'Startups raising VC, companies issuing equity, holding structures', keyPoints: ['Preferred by the overwhelming majority of US VCs', 'Court of Chancery — judges, no juries, deep precedent', 'No state income tax on income earned outside Delaware', 'Members and managers not on public record'], govtFees: { formation: 160, annual: 300, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual franchise tax, $300 minimum for LLCs. Corporations calculated on authorised shares.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–7 days', serviceFee: 299, stateIncomeTax: 'None on out-of-state income', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 459, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No staffing licence. Formation-only state for most agencies.', verified: false }, icon: '⚖️', subtitle: 'Only if raising capital', match: '64%', price: '$459', priceNote: '$299 package + $160 state', features: [{ boldText: 'Investor standard', normalText: ' — VCs prefer Delaware C-Corp.' }, { boldText: '$300/yr franchise tax', normalText: ' — expensive to maintain.' }, { boldText: 'Court of Chancery', normalText: ' — strong legal precedent.' }, { boldText: '5–7 days', normalText: ' to form.' }], warning: 'overkill and costly if you are not raising VC money.', desc: '$160 state fee + $300/yr' },
  { code: 'NM', name: 'New Mexico', popularityRank: 3, tag: 'No annual fee', tagline: 'No annual report, ever', snippet: 'File once and it stays active. The only state with no annual filing at all.', bestFor: 'Passive holding entities, long-term dormant structures, IP holding', keyPoints: ['$50 state fee — joint cheapest', 'No annual report ever required', 'No recurring state fee at all', 'Members not disclosed publicly'], govtFees: { formation: 50, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report or fee required for LLCs at any point.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–6 days', serviceFee: 299, stateIncomeTax: '5.9% top rate on NM-sourced income', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No staffing licence.', verified: false }, icon: '🌵', subtitle: 'No annual report ever', match: '91%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: 'No annual report ever', normalText: ' — truly set and forget.' }, { boldText: 'Anonymous LLC', normalText: ' — members not on public record.' }, { boldText: '$50 state fee', normalText: ' — cheapest credible option.' }, { boldText: '4–6 days', normalText: ' to form.' }], warning: 'less prestige than Wyoming with banks and vendors.', desc: '$349 · no annual report ever · anonymous' },
  { code: 'FL', name: 'Florida', popularityRank: 4, tag: 'Popular', tagline: 'No personal income tax', snippet: 'Fast processing and no state income tax. Strong for real estate and consumer businesses.', bestFor: 'Real estate holdings, consumer businesses, LatAm-connected founders', keyPoints: ['$125 state fee', 'No personal state income tax', 'Strong real estate framework', '$138.75 annual report, strictly enforced'], govtFees: { formation: 125, annual: 138.75, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due 1 May. $400 penalty if filed late — this is strictly enforced.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–6 days', serviceFee: 299, stateIncomeTax: '5.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: "No general staffing licence, but workers' comp is strictly enforced.", verified: false }, icon: '🌴', subtitle: 'No personal income tax', match: '88%', price: '$424', priceNote: '$299 package + $125 state', features: [{ boldText: '$125 state fee', normalText: '' }, { boldText: 'No personal income tax', normalText: '' }, { boldText: 'Strong real estate framework', normalText: '' }, { boldText: '4–6 days', normalText: ' to form.' }], warning: 'Annual report strictly enforced.', desc: '$125 state fee · $138.75/yr' },
  { code: 'TX', name: 'Texas', popularityRank: 5, tag: null, tagline: 'Big market, no income tax', snippet: 'Second-largest US economy. Franchise tax only kicks in above ~$2.47M revenue.', bestFor: 'Operating businesses, energy, logistics, larger ventures', keyPoints: ['$310 state fee', 'No personal state income tax', 'Franchise tax only above ~$2.47M revenue', 'Second-largest state economy'], govtFees: { formation: 310, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Franchise tax report required annually. No tax payable below the revenue threshold.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: 'Franchise tax above threshold', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 609, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: false, note: "No staffing licence. Workers' comp optional but strongly advised.", verified: false }, icon: '🤠', subtitle: 'Big market, no income tax', match: '82%', price: '$609', priceNote: '$299 package + $310 state', features: [{ boldText: '$310 state fee', normalText: '' }, { boldText: 'No personal income tax', normalText: '' }, { boldText: '5–8 days', normalText: ' to form.' }], warning: 'Higher upfront fee.', desc: '$310 state fee' },
  { code: 'NV', name: 'Nevada', popularityRank: 6, tag: null, tagline: 'Privacy focused', snippet: 'Strong privacy statutes and no income tax, though the annual licence keeps costs higher.', bestFor: 'Privacy-sensitive structures, asset protection', keyPoints: ['$75 state fee', 'No state income tax', 'Strong statutory privacy', '$350 annual licence and list'], govtFees: { formation: 75, annual: 350, annualFrequency: 'annual', currency: 'USD', annualNote: 'Comprises $150 annual list plus $200 state business licence.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–7 days', serviceFee: 299, stateIncomeTax: 'None', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 374, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence and bond required.', verified: false }, icon: '🎰', subtitle: 'Privacy focused', match: '80%', price: '$374', priceNote: '$299 package + $75 state', features: [{ boldText: '$75 state fee', normalText: '' }, { boldText: 'Strong privacy', normalText: '' }, { boldText: '$350/yr', normalText: '' }], warning: 'Annual licence costly.', desc: '$75 state fee + $350/yr' },
  { code: 'CA', name: 'California', popularityRank: 7, tag: null, tagline: 'Silicon Valley access', snippet: 'Cheap to form, but $800 franchise tax applies every year regardless of revenue.', bestFor: 'Companies needing physical Silicon Valley presence', keyPoints: ['$90 state fee', '$800 minimum franchise tax — even at zero revenue', 'Largest US state economy', 'Heaviest ongoing cost of any state'], govtFees: { formation: 90, annual: 800, annualFrequency: 'annual', currency: 'USD', annualNote: '$800 minimum franchise tax plus $20 Statement of Information. Payable even when dormant.', verified: true, source: 'CompanyVista official rate card' }, timeline: '7–12 days', serviceFee: 299, stateIncomeTax: '8.84% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 389, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence + bond. AB5 worker-classification rules are strict.', verified: false }, icon: '🌉', subtitle: 'Silicon Valley access', match: '78%', price: '$389', priceNote: '$299 package + $90 state', features: [{ boldText: '$800/yr franchise tax', normalText: ' — even at zero revenue.' }, { boldText: 'Silicon Valley', normalText: '' }], warning: 'Heaviest ongoing cost.', desc: '$90 state fee · $800/yr' },
  { code: 'NY', name: 'New York', popularityRank: 8, tag: null, tagline: 'Prestige, plus publication', snippet: 'Real financial-sector credibility. Budget $600–$1,600 extra for mandatory publication.', bestFor: 'Finance, fashion, media, businesses needing an NYC presence', keyPoints: ['$275 state fee', 'Publication adds $600–$1,600 one-time', 'Financial-sector credibility', 'Biennial filing, not annual'], govtFees: { formation: 275, annual: 9, annualFrequency: 'biennial', currency: 'USD', annualNote: '$9 biennial statement. Publication cost is separate, one-time, and varies sharply by county.', verified: true, source: 'CompanyVista official rate card' }, timeline: '7–10 days', serviceFee: 299, stateIncomeTax: '6.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 574, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'NYC employment agency licence required; bond applies.', verified: false }, icon: '🗽', subtitle: 'Prestige, plus publication', match: '76%', price: '$574', priceNote: '$299 package + $275 state', features: [{ boldText: '$275 state fee', normalText: '' }, { boldText: 'Publication $600–$1,600', normalText: '' }], warning: 'Publication adds cost.', desc: '$275 state fee' },
  { code: 'KY', name: 'Kentucky', popularityRank: 9, tag: 'Lowest state fee', tagline: 'Lowest state fee in the US', snippet: 'At $40 the cheapest legitimate route into a US company.', bestFor: 'Budget-conscious formations', keyPoints: ['$40 state fee — lowest nationally', '$15 annual report', 'Total first-year cost $339'], govtFees: { formation: 40, annual: 15, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 30 June.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 339, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🐎', subtitle: 'Cheapest to form', match: '85%', price: '$339', priceNote: '$299 package + $40 state', features: [{ boldText: '$15/yr', normalText: ' annual fee — lowest running cost.' }, { boldText: 'Fast online filing', normalText: '' }, { boldText: 'Good for bootstrapped', normalText: ' founders.' }], warning: 'fewer banking options than Wyoming/NM.', desc: '$339 · cheapest to form · $15/yr' },
  { code: 'OH', name: 'Ohio', popularityRank: 10, tag: null, tagline: 'No annual report', snippet: 'Low filing fee, no annual report for LLCs, central for logistics.', bestFor: 'Operating businesses, logistics, distribution', keyPoints: ['$99 state fee', 'No annual report for LLCs', 'Central logistics position'], govtFees: { formation: 99, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report required for LLCs.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: 'Commercial Activity Tax above $150k', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 398, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general licence for most placements.', verified: false }, icon: '🏭', subtitle: 'No annual report', match: '83%', price: '$398', priceNote: '$299 package + $99 state', features: [{ boldText: '$99 state fee', normalText: '' }, { boldText: 'No annual report', normalText: '' }], warning: 'Standard.', desc: '$99 state fee' },
  { code: 'MO', name: 'Missouri', popularityRank: 11, tag: null, tagline: 'No recurring fee', snippet: 'No annual report obligation, keeping long-term upkeep near zero.', bestFor: 'Cost-conscious operating businesses, holding entities', keyPoints: ['$105 state fee', 'No annual report for LLCs', 'Central US location'], govtFees: { formation: 105, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report required for LLCs.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–6 days', serviceFee: 299, stateIncomeTax: '4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 404, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌾', subtitle: 'No recurring fee', match: '81%', price: '$404', priceNote: '$299 package + $105 state', features: [{ boldText: '$105 state fee', normalText: '' }, { boldText: 'No annual fee', normalText: '' }], warning: '', desc: '$105 state fee' },
  { code: 'AZ', name: 'Arizona', popularityRank: 12, tag: null, tagline: 'No annual report', snippet: 'Cheap to form with nothing due annually. Publication required in most counties.', bestFor: 'Small businesses, holding entities', keyPoints: ['$50 state fee', 'No annual report required', 'Publication required in most counties'], govtFees: { formation: 50, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report. Publication in an approved newspaper required within 60 days.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '4.9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false }, icon: '🌵', subtitle: 'No annual report', match: '80%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 state fee', normalText: '' }, { boldText: 'No annual report', normalText: '' }], warning: 'Publication required.', desc: '$50 state fee' },
  { code: 'CO', name: 'Colorado', popularityRank: 13, tag: null, tagline: 'Cheap and fast', snippet: '$50 to form, $25 a year, with quick online processing and a strong tech scene.', bestFor: 'Tech startups, small businesses', keyPoints: ['$50 formation fee', '$25 periodic report', 'Fast online filing', 'Growing tech ecosystem'], govtFees: { formation: 50, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Periodic report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–5 days', serviceFee: 299, stateIncomeTax: '4.4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false }, icon: '🏔️', subtitle: 'Cheap and fast', match: '79%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 formation fee', normalText: '' }, { boldText: '$25/yr', normalText: '' }], warning: '', desc: '$50 formation fee' },
  { code: 'MI', name: 'Michigan', popularityRank: 14, tag: null, tagline: 'Low cost, simple upkeep', snippet: '$50 to form and $25 a year — one of the most economical Midwest options.', bestFor: 'Manufacturing, operating businesses', keyPoints: ['$50 formation fee', '$25 annual statement', 'Manufacturing base'], govtFees: { formation: 50, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual statement due 15 February.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '6% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: true, suretyBondRequired: false, workersCompRequired: true, note: 'Employment agency licence required.', verified: false }, icon: '🚗', subtitle: 'Low cost, simple upkeep', match: '78%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 formation fee', normalText: '' }, { boldText: '$25/yr', normalText: '' }], warning: '', desc: '$50 formation fee' },
  { code: 'MS', name: 'Mississippi', popularityRank: 15, tag: null, tagline: 'Free annual report', snippet: 'Cheap to form, and the annual report costs nothing to file.', bestFor: 'Small operating businesses', keyPoints: ['$50 formation fee', 'Annual report free to file', 'Low overall burden'], govtFees: { formation: 50, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report required by 15 April but there is no filing fee.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '4–5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🎶', subtitle: 'Free annual report', match: '77%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 formation fee', normalText: '' }, { boldText: 'Free annual report', normalText: '' }], warning: '', desc: '$50 formation fee' },
  { code: 'UT', name: 'Utah', popularityRank: 16, tag: null, tagline: 'Low cost, fast-growing tech', snippet: 'Cheap to form and maintain, with the Silicon Slopes corridor nearby.', bestFor: 'Tech startups, small businesses', keyPoints: ['$70 state fee', '$18 annual renewal', 'Silicon Slopes tech corridor'], govtFees: { formation: 70, annual: 18, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual renewal due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–6 days', serviceFee: 299, stateIncomeTax: '4.65% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 369, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏜️', subtitle: 'Low cost, fast-growing tech', match: '76%', price: '$369', priceNote: '$299 package + $70 state', features: [{ boldText: '$70 state fee', normalText: '' }, { boldText: '$18/yr', normalText: '' }], warning: '', desc: '$70 state fee' },
  { code: 'MT', name: 'Montana', popularityRank: 17, tag: null, tagline: 'Low fees, no sales tax', snippet: 'Modest fees with no state sales tax at all.', bestFor: 'Holding entities, vehicle registration structures', keyPoints: ['$70 state fee', '$20 annual report', 'No state sales tax'], govtFees: { formation: 70, annual: 20, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 15 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '6.75% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 369, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🦌', subtitle: 'Low fees, no sales tax', match: '75%', price: '$369', priceNote: '$299 package + $70 state', features: [{ boldText: '$70 state fee', normalText: '' }, { boldText: 'No sales tax', normalText: '' }], warning: '', desc: '$70 state fee' },
  { code: 'IN', name: 'Indiana', popularityRank: 18, tag: null, tagline: 'Biennial reporting', snippet: 'Low filing fee and a report due only every second year.', bestFor: 'Manufacturing, small businesses', keyPoints: ['$50 state fee', '$32 biennial report', 'Low ongoing burden'], govtFees: { formation: 50, annual: 32, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Business entity report due every two years in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '4.9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏀', subtitle: 'Biennial reporting', match: '74%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 state fee', normalText: '' }, { boldText: '$32/2yr', normalText: '' }], warning: '', desc: '$50 state fee' },
  { code: 'IA', name: 'Iowa', popularityRank: 19, tag: null, tagline: 'Biennial reporting', snippet: 'Cheap to form with reporting required only every two years.', bestFor: 'Small businesses, agriculture', keyPoints: ['$50 formation fee', '$30 biennial report', 'Reduced filing frequency'], govtFees: { formation: 50, annual: 30, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due in odd-numbered years by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5.5–7.1% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌽', subtitle: 'Biennial reporting', match: '73%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 formation fee', normalText: '' }, { boldText: '$30/2yr', normalText: '' }], warning: '', desc: '$50 formation fee' },
  { code: 'SC', name: 'South Carolina', popularityRank: 20, tag: null, tagline: 'No annual report for LLCs', snippet: 'Most LLCs face no annual filing, keeping upkeep minimal.', bestFor: 'Manufacturing, logistics', keyPoints: ['$110 formation fee', 'No annual report for most LLCs', 'Port access'], govtFees: { formation: 110, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report for LLCs unless taxed as a corporation.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 409, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌴', subtitle: 'No annual report for LLCs', match: '72%', price: '$409', priceNote: '$299 package + $110 state', features: [{ boldText: '$110 formation fee', normalText: '' }, { boldText: 'No annual report', normalText: '' }], warning: '', desc: '$110 formation fee' },
  { code: 'GA', name: 'Georgia', popularityRank: 21, tag: null, tagline: 'Atlanta business hub', snippet: "Reasonable fees with access to Atlanta's corporate and logistics ecosystem.", bestFor: 'Logistics, film, corporate services', keyPoints: ['$100 formation fee', '$50 annual registration', 'Atlanta corporate hub'], govtFees: { formation: 100, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual registration due by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5.75% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false }, icon: '🍑', subtitle: 'Atlanta business hub', match: '71%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: '$50/yr', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'VA', name: 'Virginia', popularityRank: 22, tag: null, tagline: 'Government contracting base', snippet: 'Next to Washington DC and well-positioned for federal contract work.', bestFor: 'Government contracting, defence, technology', keyPoints: ['$100 formation fee', '$50 annual registration', 'Federal contracting access'], govtFees: { formation: 100, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual registration fee due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '6% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false }, icon: '🏛️', subtitle: 'Government contracting base', match: '70%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: '$50/yr', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'NC', name: 'North Carolina', popularityRank: 23, tag: null, tagline: 'Research Triangle access', snippet: 'Lowest corporate tax in the nation at 2.5%, with a strong biotech cluster.', bestFor: 'Biotech, technology, research', keyPoints: ['$125 formation fee', '$200 annual report', 'Research Triangle cluster'], govtFees: { formation: 125, annual: 200, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 15 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '2.5% corporate — lowest in the nation', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: true, suretyBondRequired: false, workersCompRequired: true, note: 'Private personnel service licence required.', verified: false }, icon: '🔬', subtitle: 'Research Triangle access', match: '69%', price: '$424', priceNote: '$299 package + $125 state', features: [{ boldText: '$125 formation fee', normalText: '' }, { boldText: '2.5% corporate tax', normalText: '' }], warning: '', desc: '$125 formation fee' },
  { code: 'WA', name: 'Washington', popularityRank: 24, tag: null, tagline: 'No income tax, B&O applies', snippet: 'No corporate income tax, but B&O tax hits gross receipts rather than profit.', bestFor: 'Technology, e-commerce', keyPoints: ['$259 state fee', 'No corporate income tax', 'B&O tax on gross receipts', 'Seattle tech ecosystem'], govtFees: { formation: 259, annual: 60, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: 'No income tax; B&O on gross receipts', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 558, staffing: { employmentAgencyLicence: true, suretyBondRequired: false, workersCompRequired: true, note: 'Employment agency registration required.', verified: false }, icon: '☕', subtitle: 'No income tax, B&O applies', match: '68%', price: '$558', priceNote: '$299 package + $259 state', features: [{ boldText: '$259 state fee', normalText: '' }, { boldText: 'No income tax', normalText: '' }], warning: 'B&O on gross receipts.', desc: '$259 state fee' },
  { code: 'IL', name: 'Illinois', popularityRank: 25, tag: null, tagline: 'Chicago market access', snippet: 'Mid-range fees with access to the Chicago metropolitan market.', bestFor: 'Finance, logistics, professional services', keyPoints: ['$150 formation fee', '$75 annual report', 'Chicago market'], govtFees: { formation: 150, annual: 75, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due before the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '9.5% combined corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 449, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Private employment agency licence; Day & Temp Labor Services Act applies.', verified: false }, icon: '🏙️', subtitle: 'Chicago market access', match: '67%', price: '$449', priceNote: '$299 package + $150 state', features: [{ boldText: '$150 formation fee', normalText: '' }, { boldText: 'Chicago market', normalText: '' }], warning: 'High tax.', desc: '$150 formation fee' },
  { code: 'PA', name: 'Pennsylvania', popularityRank: 26, tag: null, tagline: 'Newly annual reporting', snippet: 'Switched from decennial to annual filing in 2025, though the fee is nominal.', bestFor: 'Manufacturing, professional services', keyPoints: ['$125 formation fee', '$7 annual report (new from 2025)', 'Large eastern market'], govtFees: { formation: 125, annual: 7, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report introduced 2025, replacing the former decennial filing.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.49% corporate, reducing annually', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence and bond required.', verified: false }, icon: '🔔', subtitle: 'Newly annual reporting', match: '66%', price: '$424', priceNote: '$299 package + $125 state', features: [{ boldText: '$125 formation fee', normalText: '' }, { boldText: '$7/yr', normalText: '' }], warning: 'Licence + bond required.', desc: '$125 formation fee' },
  { code: 'NJ', name: 'New Jersey', popularityRank: 27, tag: null, tagline: 'Northeast corridor', snippet: 'New York proximity at meaningfully lower cost.', bestFor: 'Pharma, logistics, professional services', keyPoints: ['$125 formation fee', '$75 annual report', 'NYC proximity at lower cost'], govtFees: { formation: 125, annual: 75, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment and personnel service registration required.', verified: false }, icon: '💊', subtitle: 'Northeast corridor', match: '65%', price: '$424', priceNote: '$299 package + $125 state', features: [{ boldText: '$125 formation fee', normalText: '' }, { boldText: 'NYC proximity', normalText: '' }], warning: '', desc: '$125 formation fee' },
  { code: 'TN', name: 'Tennessee', popularityRank: 28, tag: null, tagline: 'Per-member fee structure', snippet: '$50 per member with a $300 floor — cost rises as membership grows.', bestFor: 'Operating businesses with few members', keyPoints: ['$300 minimum ($50 per member)', 'Annual report also $300 minimum', 'No personal income tax'], govtFees: { formation: 300, annual: 300, annualFrequency: 'annual', currency: 'USD', annualNote: '$50 per member, minimum $300, maximum $3,000. Due on the first day of the fourth month after fiscal year end.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '6.5% excise tax', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 599, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🎸', subtitle: 'Per-member fee structure', match: '64%', price: '$599', priceNote: '$299 package + $300 state', features: [{ boldText: '$300 minimum', normalText: '' }, { boldText: 'Per-member', normalText: '' }], warning: 'Cost rises with members.', desc: '$300 minimum' },
  { code: 'NH', name: 'New Hampshire', popularityRank: 29, tag: null, tagline: 'No sales or income tax', snippet: 'No state sales tax and no personal income tax on earned income.', bestFor: 'Retail, small businesses', keyPoints: ['$100 formation fee', '$100 annual report', 'No sales tax'], govtFees: { formation: 100, annual: 100, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '7.5% business profits tax', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🍁', subtitle: 'No sales or income tax', match: '63%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: 'No sales tax', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'OR', name: 'Oregon', popularityRank: 30, tag: null, tagline: 'No sales tax', snippet: 'No state sales tax, with matching $100 formation and annual fees.', bestFor: 'Retail, e-commerce, outdoor sector', keyPoints: ['$100 formation fee', '$100 annual report', 'No state sales tax'], govtFees: { formation: 100, annual: 100, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '6.6–7.6% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌲', subtitle: 'No sales tax', match: '62%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: 'No sales tax', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'OK', name: 'Oklahoma', popularityRank: 31, tag: null, tagline: 'Low annual certificate', snippet: 'Standard formation cost with a low $25 annual certificate.', bestFor: 'Energy, agriculture', keyPoints: ['$100 formation fee', '$25 annual certificate', 'Energy sector'], govtFees: { formation: 100, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual certificate due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '⛽', subtitle: 'Low annual certificate', match: '61%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: '$25/yr', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'LA', name: 'Louisiana', popularityRank: 32, tag: null, tagline: 'Port and energy access', snippet: 'Standard fees with major port infrastructure and an established energy sector.', bestFor: 'Energy, shipping, logistics', keyPoints: ['$100 formation fee', '$35 annual report', 'Major port access'], govtFees: { formation: 100, annual: 35, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '7.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '⚓', subtitle: 'Port and energy access', match: '60%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: 'Port access', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'AR', name: 'Arkansas', popularityRank: 33, tag: null, tagline: 'Flat franchise tax', snippet: 'Cheap to form, but a flat $150 franchise tax applies regardless of revenue.', bestFor: 'Small businesses, agriculture', keyPoints: ['$50 state fee', '$150 annual franchise tax', 'Low entry cost'], govtFees: { formation: 50, annual: 150, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual franchise tax due by 1 May.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '5.1% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '💎', subtitle: 'Flat franchise tax', match: '59%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 state fee', normalText: '' }, { boldText: '$150/yr franchise', normalText: '' }], warning: 'Flat tax.', desc: '$50 state fee' },
  { code: 'ID', name: 'Idaho', popularityRank: 34, tag: null, tagline: 'Free annual report', snippet: 'The annual report must be filed but costs nothing.', bestFor: 'Agriculture, technology, small businesses', keyPoints: ['$100 formation fee', 'Annual report free to file', 'Fast-growing economy'], govtFees: { formation: 100, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report required in the anniversary month but free.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5.8% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🥔', subtitle: 'Free annual report', match: '58%', price: '$399', priceNote: '$299 package + $100 state', features: [{ boldText: '$100 formation fee', normalText: '' }, { boldText: 'Free annual report', normalText: '' }], warning: '', desc: '$100 formation fee' },
  { code: 'MN', name: 'Minnesota', popularityRank: 35, tag: null, tagline: 'Free annual renewal', snippet: 'Annual renewal is required but carries no fee at all.', bestFor: 'Healthcare, retail, manufacturing', keyPoints: ['$135 state fee', 'Annual renewal free to file', 'Large corporate presence'], govtFees: { formation: 135, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual renewal required by 31 December but free to file.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '9.8% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 434, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence and bond required.', verified: false }, icon: '🏥', subtitle: 'Free annual renewal', match: '57%', price: '$434', priceNote: '$299 package + $135 state', features: [{ boldText: '$135 state fee', normalText: '' }, { boldText: 'Free renewal', normalText: '' }], warning: 'Licence + bond required.', desc: '$135 state fee' },
  { code: 'WI', name: 'Wisconsin', popularityRank: 36, tag: null, tagline: 'Low annual fee', snippet: 'Moderate formation cost with just $25 due annually.', bestFor: 'Manufacturing, agriculture', keyPoints: ['$130 formation fee', '$25 annual report', 'Manufacturing base'], govtFees: { formation: 130, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary quarter.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '7.9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 429, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false }, icon: '🧀', subtitle: 'Low annual fee', match: '56%', price: '$429', priceNote: '$299 package + $130 state', features: [{ boldText: '$130 formation fee', normalText: '' }, { boldText: '$25/yr', normalText: '' }], warning: '', desc: '$130 formation fee' },
  { code: 'WV', name: 'West Virginia', popularityRank: 37, tag: null, tagline: 'Low annual fee', snippet: 'Standard formation cost with a low $25 annual report.', bestFor: 'Energy, small businesses', keyPoints: ['$100 formation fee', '$25 annual report', 'Energy sector'], govtFees: { formation: 130, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due between 1 January and 30 June.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '6.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 429, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '⛰️', subtitle: 'Low annual fee', match: '55%', price: '$429', priceNote: '$299 package + $130 state', features: [{ boldText: '$130 formation fee', normalText: '' }, { boldText: '$25/yr', normalText: '' }], warning: '', desc: '$130 formation fee' },
  { code: 'NE', name: 'Nebraska', popularityRank: 38, tag: null, tagline: 'Biennial, cheap renewal', snippet: '$13 every two years is among the lowest recurring costs anywhere.', bestFor: 'Small businesses, agriculture', keyPoints: ['$13 biennial report', 'Publication requirement applies', 'Low renewal cost'], govtFees: { formation: 110, annual: 13, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due in odd years. Newspaper publication required at formation.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '5.58–7.25% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 409, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌽', subtitle: 'Biennial, cheap renewal', match: '54%', price: '$409', priceNote: '$299 package + $110 state', features: [{ boldText: '$13/2yr', normalText: '' }, { boldText: 'Low renewal', normalText: '' }], warning: 'Publication required.', desc: '$13/2yr' },
  { code: 'KS', name: 'Kansas', popularityRank: 39, tag: null, tagline: 'Mid-range fees', snippet: 'Straightforward processing with moderate costs at both stages.', bestFor: 'Agriculture, aviation, logistics', keyPoints: ['$165 state fee', '$50 annual report', 'Aviation sector'], govtFees: { formation: 165, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the 15th day of the fourth month after tax year end.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 464, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌾', subtitle: 'Mid-range fees', match: '53%', price: '$464', priceNote: '$299 package + $165 state', features: [{ boldText: '$165 state fee', normalText: '' }, { boldText: '$50/yr', normalText: '' }], warning: '', desc: '$165 state fee' },
  { code: 'ND', name: 'North Dakota', popularityRank: 40, tag: null, tagline: 'Energy sector base', snippet: 'Standard fees in an economy anchored by energy and agriculture.', bestFor: 'Energy, agriculture', keyPoints: ['$135 formation fee', '$50 annual report', 'Energy sector'], govtFees: { formation: 135, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 1 November.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '4.31% top corporate rate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 434, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '⛽', subtitle: 'Energy sector base', match: '52%', price: '$434', priceNote: '$299 package + $135 state', features: [{ boldText: '$135 formation fee', normalText: '' }, { boldText: '$50/yr', normalText: '' }], warning: '', desc: '$135 formation fee' },
  { code: 'SD', name: 'South Dakota', popularityRank: 41, tag: null, tagline: 'No corporate income tax', snippet: 'No corporate or personal income tax, with strong trust law.', bestFor: 'Financial services, agriculture, trusts', keyPoints: ['No corporate income tax', '$150 formation fee', '$50 annual report', 'Strong trust law'], govtFees: { formation: 150, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: 'None', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 449, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏦', subtitle: 'No corporate income tax', match: '51%', price: '$449', priceNote: '$299 package + $150 state', features: [{ boldText: 'No corporate income tax', normalText: '' }, { boldText: '$150 formation fee', normalText: '' }], warning: '', desc: '$150 formation fee' },
  { code: 'VT', name: 'Vermont', popularityRank: 42, tag: null, tagline: 'Low annual report', snippet: 'Moderate formation cost with just $35 due annually.', bestFor: 'Agriculture, tourism, small businesses', keyPoints: ['$125 formation fee', '$35 annual report', 'Small business friendly'], govtFees: { formation: 125, annual: 35, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due within 3 months of fiscal year end.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.5% top corporate rate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🍁', subtitle: 'Low annual report', match: '50%', price: '$424', priceNote: '$299 package + $125 state', features: [{ boldText: '$125 formation fee', normalText: '' }, { boldText: '$35/yr', normalText: '' }], warning: '', desc: '$125 formation fee' },
  { code: 'ME', name: 'Maine', popularityRank: 43, tag: null, tagline: 'Higher fee structure', snippet: 'Above-average fees at both stages. Best with a genuine Maine connection.', bestFor: 'Tourism, fishing, small businesses', keyPoints: ['$175 formation fee', '$85 annual report', 'Tourism economy'], govtFees: { formation: 175, annual: 85, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 1 June.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.93% top corporate rate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 474, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🦞', subtitle: 'Higher fee structure', match: '49%', price: '$474', priceNote: '$299 package + $175 state', features: [{ boldText: '$175 formation fee', normalText: '' }, { boldText: '$85/yr', normalText: '' }], warning: '', desc: '$175 formation fee' },
  { code: 'RI', name: 'Rhode Island', popularityRank: 44, tag: null, tagline: 'Compact market', snippet: 'Standard fees in the smallest state, suited to local marine and coastal work.', bestFor: 'Small businesses, marine industries', keyPoints: ['$150 formation fee', '$50 annual report', 'Marine sector'], govtFees: { formation: 150, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due between 1 February and 1 May.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '7% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 449, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '⚓', subtitle: 'Compact market', match: '48%', price: '$449', priceNote: '$299 package + $150 state', features: [{ boldText: '$150 formation fee', normalText: '' }, { boldText: '$50/yr', normalText: '' }], warning: '', desc: '$150 formation fee' },
  { code: 'CT', name: 'Connecticut', popularityRank: 45, tag: null, tagline: 'Financial services adjacent', snippet: 'New York proximity with somewhat lower operating costs.', bestFor: 'Financial services, insurance', keyPoints: ['$120 formation fee', '$80 annual report', 'Insurance and finance sector'], govtFees: { formation: 120, annual: 80, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 31 March.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '7.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 419, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏦', subtitle: 'Financial services adjacent', match: '47%', price: '$419', priceNote: '$299 package + $120 state', features: [{ boldText: '$120 formation fee', normalText: '' }, { boldText: '$80/yr', normalText: '' }], warning: '', desc: '$120 formation fee' },
  { code: 'HI', name: 'Hawaii', popularityRank: 46, tag: null, tagline: 'Low annual fee', snippet: 'Cheap to form and just $15 a year, though geography limits most models.', bestFor: 'Tourism, hospitality, small businesses', keyPoints: ['$50 formation fee', '$15 annual report', 'Tourism economy'], govtFees: { formation: 50, annual: 15, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary quarter.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–10 days', serviceFee: 299, stateIncomeTax: '4.4–6.4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🌺', subtitle: 'Low annual fee', match: '46%', price: '$349', priceNote: '$299 package + $50 state', features: [{ boldText: '$50 formation fee', normalText: '' }, { boldText: '$15/yr', normalText: '' }], warning: '', desc: '$50 formation fee' },
  { code: 'MD', name: 'Maryland', popularityRank: 47, tag: null, tagline: 'High filing fee', snippet: 'Expensive at both stages. Chosen mainly for genuine DC proximity.', bestFor: 'Government-adjacent services, biotech', keyPoints: ['$450 state fee', '$300 annual report', 'DC proximity'], govtFees: { formation: 450, annual: 300, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report and personal property return due 15 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.25% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 749, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏛️', subtitle: 'High filing fee', match: '45%', price: '$749', priceNote: '$299 package + $450 state', features: [{ boldText: '$450 state fee', normalText: '' }, { boldText: '$300/yr', normalText: '' }], warning: 'Expensive.', desc: '$450 state fee' },
  { code: 'MA', name: 'Massachusetts', popularityRank: 48, tag: null, tagline: 'Highest fees, best talent', snippet: 'The most expensive state, offset by Boston\'s biotech and academic ecosystem.', bestFor: 'Biotech, deep tech, academic spinouts', keyPoints: ['$500 state fee — highest nationally', '$500 annual report', "Boston biotech and academic cluster"], govtFees: { formation: 500, annual: 500, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 799, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence; Temporary Workers Right to Know Act applies.', verified: false }, icon: '🎓', subtitle: 'Highest fees, best talent', match: '44%', price: '$799', priceNote: '$299 package + $500 state', features: [{ boldText: '$500 state fee — highest nationally', normalText: '' }, { boldText: '$500/yr', normalText: '' }], warning: 'Most expensive.', desc: '$500 state fee' },
  { code: 'AL', name: 'Alabama', popularityRank: 49, tag: null, tagline: 'Privilege tax applies', snippet: 'Standard formation with an annual privilege tax based on net worth.', bestFor: 'Small operating businesses', keyPoints: ['$180 state fee', '$50 minimum privilege tax', 'Manufacturing base'], govtFees: { formation: 180, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Business Privilege Tax, $50 minimum, based on net worth.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '6.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 479, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏭', subtitle: 'Privilege tax applies', match: '43%', price: '$479', priceNote: '$299 package + $180 state', features: [{ boldText: '$180 state fee', normalText: '' }, { boldText: '$50 privilege tax', normalText: '' }], warning: '', desc: '$180 state fee' },
  { code: 'AK', name: 'Alaska', popularityRank: 50, tag: null, tagline: 'No sales or income tax', snippet: 'No state sales or income tax, with biennial rather than annual reporting.', bestFor: 'Resource extraction, fishing, tourism', keyPoints: ['$250 state fee', 'No state sales or income tax', '$100 biennial report'], govtFees: { formation: 250, annual: 100, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due by 2 January in alternating years.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–10 days', serviceFee: 299, stateIncomeTax: '0–9.4% graduated corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 549, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🐻', subtitle: 'No sales or income tax', match: '42%', price: '$549', priceNote: '$299 package + $250 state', features: [{ boldText: '$250 state fee', normalText: '' }, { boldText: 'No sales tax', normalText: '' }], warning: '', desc: '$250 state fee' },
  { code: 'DC', name: 'District of Columbia', popularityRank: 51, tag: null, tagline: 'Federal proximity', snippet: 'Not a state, but available. Positioned for government-adjacent work.', bestFor: 'Government relations, associations, consultancies', keyPoints: ['$220 filing fee', '$300 biennial report', 'Federal proximity'], govtFees: { formation: 220, annual: 300, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.25% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 519, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false }, icon: '🏛️', subtitle: 'Federal proximity', match: '41%', price: '$519', priceNote: '$299 package + $220 state', features: [{ boldText: '$220 filing fee', normalText: '' }, { boldText: '$300/2yr', normalText: '' }], warning: '', desc: '$220 filing fee' },
];

export default function BestStatesForYouScreen({ navigation, route }) {
  const [selected, setSelected] = useState(STATES_DATA[0]);
  const alternatives = STATES_DATA.filter(s => s.name !== selected.name);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('RegistrationLanding'); }} />
        <Image source={logoR} style={styles.topLogo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          Best <Text style={styles.titleItalic}>states</Text> for you
        </Text>
        <Text style={styles.subtitle}>
          Fully remote · lowest cost · no investment planned
        </Text>

        {/* Filter Tags */}
        <View style={styles.tagsContainer}>
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagPill,
                tag.isAction && styles.actionTagPill,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Best Match Card */}
        <View style={styles.matchCard}>
          {/* Badge */}
          <View style={styles.bestMatchBadge}>
            <Text style={styles.badgeText}>★ BEST MATCH</Text>
          </View>

          {/* Card Header Info - dynamic selected */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.stateIcon}>{selected.icon}</Text>
              <View>
                <Text style={styles.stateName}>{selected.name}</Text>
                <Text style={styles.stateSubtitle}>{selected.subtitle}</Text>
              </View>
            </View>

            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>{selected.match}</Text>
              <Text style={styles.matchLabel}>MATCH</Text>
            </View>
          </View>

          {/* Features List - dynamic */}
          <View style={styles.featuresList}>
            {selected.features.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.featureText}>
                  <Text style={styles.featureBold}>{item.boldText}</Text>
                  {item.normalText}
                  {item.boldText2 && (
                    <Text style={styles.featureBold}>{item.boldText2}</Text>
                  )}
                  {item.normalText2 && item.normalText2}
                </Text>
              </View>
            ))}
          </View>

          {/* Warning Note - dynamic */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>Watch:</Text> {selected.warning}
            </Text>
          </View>

          {/* Pricing Footer - dynamic */}
          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>{selected.price}</Text>
              <Text style={styles.priceNote}>{selected.priceNote}</Text>
            </View>
            <Text style={styles.timeframeText}>{selected.timeline || selected.timeframe}</Text>
          </View>
        </View>

        {/* Close Alternatives Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CLOSE ALTERNATIVES</Text>
          <View style={styles.sectionDivider} />
        </View>

        {alternatives.map(item => (
          <TouchableOpacity key={item.name} style={styles.altCard} activeOpacity={0.7} onPress={() => setSelected(STATES_DATA.find(s => s.name === item.name))}>
            <View style={styles.altLeft}>
              <Text style={styles.altIcon}>{item.icon}</Text>
              <View style={styles.altTextWrap}>
                <Text style={styles.altName}>{item.name}</Text>
                <Text style={styles.altDesc}>{item.desc}</Text>
              </View>
            </View>
            <View style={styles.altMatchWrap}>
              <Text style={styles.altMatch}>{item.match}</Text>
              <Text style={styles.altMatchLabel}>MATCH</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.savingCard}>
          <Text style={styles.savingIcon}>✓</Text>
          <Text style={styles.savingText}>Saving $380 over 3 years versus Delaware, with no practical downside for your situation.</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() => {
          const priceNum = Number(selected.totalFirstYear) || Number(String(selected.price).replace(/[^0-9]/g, '')) || 399;
          const govFee = selected.govtFees?.formation ?? 0;
          navigation.navigate('CompanyNaming', { ...(route?.params || {}), bestState: selected.name, bestStatePrice: priceNum, bestStatePriceNote: selected.priceNote, bestStateTimeframe: selected.timeline || selected.timeframe, bestStateGovFee: govFee, bestStateCode: selected.code, advisorFlow: true, selectedCountry: 'US', selectedState: selected.name });
        }}>
          <Text style={styles.actionButtonText}>
            Continue with {selected.name} · {selected.price}  →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.browseButton} activeOpacity={0.7}>
          <Text style={styles.browseText}>
            Compare all 51 states
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E17',
  },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: s(10) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: s(8),
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    marginTop: s(24),
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161B29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#D1A253',
    fontSize: 15,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 7,
    letterSpacing: 1.2,
    marginTop: s(1),
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(20),
  },
  title: {
    fontSize: font.display,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: s(8),
  },
  titleItalic: {
    fontStyle: 'italic',
    color: '#D1A253',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: s(6),
    marginBottom: s(16),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginBottom: s(20),
  },
  tagPill: {
    backgroundColor: '#151329',
    paddingHorizontal: s(12),
    paddingVertical: s(6),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D264A',
  },
  actionTagPill: {
    backgroundColor: '#121724',
    borderColor: '#1E2638',
  },
  tagText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '500',
  },
  matchCard: {
    backgroundColor: '#121622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D321D',
    padding: s(16),
    marginBottom: s(24),
  },
  bestMatchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#262013',
    borderColor: '#D1A253',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    marginBottom: s(16),
  },
  badgeText: {
    color: '#D1A253',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: s(8),
    alignItems: 'center',
    marginBottom: s(20),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateIcon: {
    fontSize: 28,
    marginRight: s(12),
  },
  stateName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stateSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: s(2),
  },
  matchPercentageContainer: {
    alignItems: 'flex-end',
  },
  matchPercentage: {
    color: '#D1A253',
    fontSize: 24,
    fontWeight: '300',
  },
  matchLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuresList: {
    borderTopWidth: 1,
    borderColor: '#1E2638',
    paddingTop: s(16),
    marginBottom: s(16),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: s(12),
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 14,
    marginRight: s(10),
    marginTop: s(1),
  },
  featureText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  featureBold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1B18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D321D',
    padding: s(12),
    marginBottom: s(16),
  },
  warningIcon: {
    fontSize: 14,
    marginRight: s(8),
  },
  warningText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  warningBold: {
    color: '#D1A253',
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: s(8),
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#1E2638',
    paddingTop: s(14),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    color: '#D1A253',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: s(8),
  },
  priceNote: {
    color: '#64748B',
    fontSize: 11,
  },
  timeframeText: {
    color: '#64748B',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginRight: s(12),
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E2638',
  },
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121622',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2638',
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    marginTop: s(10),
  },
  altLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: s(10),
  },
  altIcon: {
    fontSize: 20,
  },
  altTextWrap: {
    flex: 1,
  },
  altName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  altDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: s(2),
  },
  altMatchWrap: {
    alignItems: 'flex-end',
    marginLeft: s(8),
  },
  altMatch: {
    color: '#D1A253',
    fontSize: 16,
    fontWeight: '700',
  },
  altMatchLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  savingCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    padding: s(12),
    marginTop: s(14),
    alignItems: 'flex-start',
    gap: s(8),
  },
  savingIcon: {
    color: '#10B981',
    fontSize: 12,
    marginTop: s(1),
  },
  savingText: {
    flex: 1,
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 15,
  },
  bottomContainer: {
    paddingHorizontal: s(16),
    paddingTop: s(12),
    paddingBottom: s(20),
    backgroundColor: '#0B0E17',
  },
  actionButton: {
    backgroundColor: '#D1A253',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#0B0E17',
    fontSize: 15,
    fontWeight: '700',
  },
  browseButton: {
    alignItems: 'center',
    marginTop: s(12),
  },
  browseText: {
    color: '#64748B',
    fontSize: 12,
  },
});
