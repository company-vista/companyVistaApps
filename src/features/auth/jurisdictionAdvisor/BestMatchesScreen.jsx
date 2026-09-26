import React, { useState, useEffect } from 'react';
import { s } from '../../../theme/responsive';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';
import { font } from '../../../theme/typography';
import { PURPOSES } from './CompanyPurposeScreen';

export const US_STATES = [
  { code: 'WY', name: 'Wyoming', popularityRank: 1, tag: 'Best value', tagline: 'Best value, strong privacy', snippet: 'Lowest running costs in the US with no income tax and members kept off public record.', bestFor: 'Solo founders, e-commerce, holding companies, cost-conscious setups', keyPoints: ['$100 state fee — excellent value', 'No state income, franchise or gross receipts tax', 'Members not disclosed on public filings', 'Lifetime proxy permitted for added anonymity'], govtFees: { formation: 100, annual: 60, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report licence tax, $60 minimum, based on assets located in Wyoming.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–5 days', serviceFee: 299, stateIncomeTax: 'None', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No staffing licence. Formation-only state for most agencies.', verified: false } },
  { code: 'DE', name: 'Delaware', popularityRank: 2, tag: 'Top pick', tagline: 'What investors expect', snippet: 'The state VCs insist on. Court of Chancery gives the deepest business-law precedent anywhere.', bestFor: 'Startups raising VC, companies issuing equity, holding structures', keyPoints: ['Preferred by the overwhelming majority of US VCs', 'Court of Chancery — judges, no juries, deep precedent', 'No state income tax on income earned outside Delaware', 'Members and managers not on public record'], govtFees: { formation: 160, annual: 300, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual franchise tax, $300 minimum for LLCs. Corporations calculated on authorised shares.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–7 days', serviceFee: 299, stateIncomeTax: 'None on out-of-state income', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 459, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No staffing licence. Formation-only state for most agencies.', verified: false } },
  { code: 'NM', name: 'New Mexico', popularityRank: 3, tag: 'No annual fee', tagline: 'No annual report, ever', snippet: 'File once and it stays active. The only state with no annual filing at all.', bestFor: 'Passive holding entities, long-term dormant structures, IP holding', keyPoints: ['$50 state fee — joint cheapest', 'No annual report ever required', 'No recurring state fee at all', 'Members not disclosed publicly'], govtFees: { formation: 50, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report or fee required for LLCs at any point.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–6 days', serviceFee: 299, stateIncomeTax: '5.9% top rate on NM-sourced income', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No staffing licence.', verified: false } },
  { code: 'FL', name: 'Florida', popularityRank: 4, tag: 'Popular', tagline: 'No personal income tax', snippet: 'Fast processing and no state income tax. Strong for real estate and consumer businesses.', bestFor: 'Real estate holdings, consumer businesses, LatAm-connected founders', keyPoints: ['$125 state fee', 'No personal state income tax', 'Strong real estate framework', '$138.75 annual report, strictly enforced'], govtFees: { formation: 125, annual: 138.75, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due 1 May. $400 penalty if filed late — this is strictly enforced.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–6 days', serviceFee: 299, stateIncomeTax: '5.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: "No general staffing licence, but workers' comp is strictly enforced.", verified: false } },
  { code: 'TX', name: 'Texas', popularityRank: 5, tag: null, tagline: 'Big market, no income tax', snippet: 'Second-largest US economy. Franchise tax only kicks in above ~$2.47M revenue.', bestFor: 'Operating businesses, energy, logistics, larger ventures', keyPoints: ['$310 state fee', 'No personal state income tax', 'Franchise tax only above ~$2.47M revenue', 'Second-largest state economy'], govtFees: { formation: 310, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Franchise tax report required annually. No tax payable below the revenue threshold.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: 'Franchise tax above threshold', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 609, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: false, note: "No staffing licence. Workers' comp optional but strongly advised.", verified: false } },
  { code: 'NV', name: 'Nevada', popularityRank: 6, tag: null, tagline: 'Privacy focused', snippet: 'Strong privacy statutes and no income tax, though the annual licence keeps costs higher.', bestFor: 'Privacy-sensitive structures, asset protection', keyPoints: ['$75 state fee', 'No state income tax', 'Strong statutory privacy', '$350 annual licence and list'], govtFees: { formation: 75, annual: 350, annualFrequency: 'annual', currency: 'USD', annualNote: 'Comprises $150 annual list plus $200 state business licence.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–7 days', serviceFee: 299, stateIncomeTax: 'None', anonymousLLC: true, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 374, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence and bond required.', verified: false } },
  { code: 'CA', name: 'California', popularityRank: 7, tag: null, tagline: 'Silicon Valley access', snippet: 'Cheap to form, but $800 franchise tax applies every year regardless of revenue.', bestFor: 'Companies needing physical Silicon Valley presence', keyPoints: ['$90 state fee', '$800 minimum franchise tax — even at zero revenue', 'Largest US state economy', 'Heaviest ongoing cost of any state'], govtFees: { formation: 90, annual: 800, annualFrequency: 'annual', currency: 'USD', annualNote: '$800 minimum franchise tax plus $20 Statement of Information. Payable even when dormant.', verified: true, source: 'CompanyVista official rate card' }, timeline: '7–12 days', serviceFee: 299, stateIncomeTax: '8.84% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 389, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence + bond. AB5 worker-classification rules are strict.', verified: false } },
  { code: 'NY', name: 'New York', popularityRank: 8, tag: null, tagline: 'Prestige, plus publication', snippet: 'Real financial-sector credibility. Budget $600–$1,600 extra for mandatory publication.', bestFor: 'Finance, fashion, media, businesses needing an NYC presence', keyPoints: ['$275 state fee', 'Publication adds $600–$1,600 one-time', 'Financial-sector credibility', 'Biennial filing, not annual'], govtFees: { formation: 275, annual: 9, annualFrequency: 'biennial', currency: 'USD', annualNote: '$9 biennial statement. Publication cost is separate, one-time, and varies sharply by county.', verified: true, source: 'CompanyVista official rate card' }, timeline: '7–10 days', serviceFee: 299, stateIncomeTax: '6.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 574, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'NYC employment agency licence required; bond applies.', verified: false } },
  { code: 'KY', name: 'Kentucky', popularityRank: 9, tag: 'Lowest state fee', tagline: 'Lowest state fee in the US', snippet: 'At $40 the cheapest legitimate route into a US company.', bestFor: 'Budget-conscious formations', keyPoints: ['$40 state fee — lowest nationally', '$15 annual report', 'Total first-year cost $339'], govtFees: { formation: 40, annual: 15, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 30 June.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 339, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'OH', name: 'Ohio', popularityRank: 10, tag: null, tagline: 'No annual report', snippet: 'Low filing fee, no annual report for LLCs, central for logistics.', bestFor: 'Operating businesses, logistics, distribution', keyPoints: ['$99 state fee', 'No annual report for LLCs', 'Central logistics position'], govtFees: { formation: 99, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report required for LLCs.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: 'Commercial Activity Tax above $150k', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 398, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general licence for most placements.', verified: false } },
  { code: 'MO', name: 'Missouri', popularityRank: 11, tag: null, tagline: 'No recurring fee', snippet: 'No annual report obligation, keeping long-term upkeep near zero.', bestFor: 'Cost-conscious operating businesses, holding entities', keyPoints: ['$105 state fee', 'No annual report for LLCs', 'Central US location'], govtFees: { formation: 105, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report required for LLCs.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–6 days', serviceFee: 299, stateIncomeTax: '4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 404, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'AZ', name: 'Arizona', popularityRank: 12, tag: null, tagline: 'No annual report', snippet: 'Cheap to form with nothing due annually. Publication required in most counties.', bestFor: 'Small businesses, holding entities', keyPoints: ['$50 state fee', 'No annual report required', 'Publication required in most counties'], govtFees: { formation: 50, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report. Publication in an approved newspaper required within 60 days.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '4.9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false } },
  { code: 'CO', name: 'Colorado', popularityRank: 13, tag: null, tagline: 'Cheap and fast', snippet: '$50 to form, $25 a year, with quick online processing and a strong tech scene.', bestFor: 'Tech startups, small businesses', keyPoints: ['$50 formation fee', '$25 periodic report', 'Fast online filing', 'Growing tech ecosystem'], govtFees: { formation: 50, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Periodic report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–5 days', serviceFee: 299, stateIncomeTax: '4.4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false } },
  { code: 'MI', name: 'Michigan', popularityRank: 14, tag: null, tagline: 'Low cost, simple upkeep', snippet: '$50 to form and $25 a year — one of the most economical Midwest options.', bestFor: 'Manufacturing, operating businesses', keyPoints: ['$50 formation fee', '$25 annual statement', 'Manufacturing base'], govtFees: { formation: 50, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual statement due 15 February.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '6% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: true, suretyBondRequired: false, workersCompRequired: true, note: 'Employment agency licence required.', verified: false } },
  { code: 'MS', name: 'Mississippi', popularityRank: 15, tag: null, tagline: 'Free annual report', snippet: 'Cheap to form, and the annual report costs nothing to file.', bestFor: 'Small operating businesses', keyPoints: ['$50 formation fee', 'Annual report free to file', 'Low overall burden'], govtFees: { formation: 50, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report required by 15 April but there is no filing fee.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '4–5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'UT', name: 'Utah', popularityRank: 16, tag: null, tagline: 'Low cost, fast-growing tech', snippet: 'Cheap to form and maintain, with the Silicon Slopes corridor nearby.', bestFor: 'Tech startups, small businesses', keyPoints: ['$70 state fee', '$18 annual renewal', 'Silicon Slopes tech corridor'], govtFees: { formation: 70, annual: 18, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual renewal due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '3–6 days', serviceFee: 299, stateIncomeTax: '4.65% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 369, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'MT', name: 'Montana', popularityRank: 17, tag: null, tagline: 'Low fees, no sales tax', snippet: 'Modest fees with no state sales tax at all.', bestFor: 'Holding entities, vehicle registration structures', keyPoints: ['$70 state fee', '$20 annual report', 'No state sales tax'], govtFees: { formation: 70, annual: 20, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 15 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '6.75% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 369, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'IN', name: 'Indiana', popularityRank: 18, tag: null, tagline: 'Biennial reporting', snippet: 'Low filing fee and a report due only every second year.', bestFor: 'Manufacturing, small businesses', keyPoints: ['$50 state fee', '$32 biennial report', 'Low ongoing burden'], govtFees: { formation: 50, annual: 32, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Business entity report due every two years in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '4.9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'IA', name: 'Iowa', popularityRank: 19, tag: null, tagline: 'Biennial reporting', snippet: 'Cheap to form with reporting required only every two years.', bestFor: 'Small businesses, agriculture', keyPoints: ['$50 formation fee', '$30 biennial report', 'Reduced filing frequency'], govtFees: { formation: 50, annual: 30, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due in odd-numbered years by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5.5–7.1% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'SC', name: 'South Carolina', popularityRank: 20, tag: null, tagline: 'No annual report for LLCs', snippet: 'Most LLCs face no annual filing, keeping upkeep minimal.', bestFor: 'Manufacturing, logistics', keyPoints: ['$110 formation fee', 'No annual report for most LLCs', 'Port access'], govtFees: { formation: 110, annual: 0, annualFrequency: 'none', currency: 'USD', annualNote: 'No annual report for LLCs unless taxed as a corporation.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 409, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'GA', name: 'Georgia', popularityRank: 21, tag: null, tagline: 'Atlanta business hub', snippet: "Reasonable fees with access to Atlanta's corporate and logistics ecosystem.", bestFor: 'Logistics, film, corporate services', keyPoints: ['$100 formation fee', '$50 annual registration', 'Atlanta corporate hub'], govtFees: { formation: 100, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual registration due by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5.75% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false } },
  { code: 'VA', name: 'Virginia', popularityRank: 22, tag: null, tagline: 'Government contracting base', snippet: 'Next to Washington DC and well-positioned for federal contract work.', bestFor: 'Government contracting, defence, technology', keyPoints: ['$100 formation fee', '$50 annual registration', 'Federal contracting access'], govtFees: { formation: 100, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual registration fee due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '6% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false } },
  { code: 'NC', name: 'North Carolina', popularityRank: 23, tag: null, tagline: 'Research Triangle access', snippet: 'Lowest corporate tax in the nation at 2.5%, with a strong biotech cluster.', bestFor: 'Biotech, technology, research', keyPoints: ['$125 formation fee', '$200 annual report', 'Research Triangle cluster'], govtFees: { formation: 125, annual: 200, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 15 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '2.5% corporate — lowest in the nation', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: true, suretyBondRequired: false, workersCompRequired: true, note: 'Private personnel service licence required.', verified: false } },
  { code: 'WA', name: 'Washington', popularityRank: 24, tag: null, tagline: 'No income tax, B&O applies', snippet: 'No corporate income tax, but B&O tax hits gross receipts rather than profit.', bestFor: 'Technology, e-commerce', keyPoints: ['$259 state fee', 'No corporate income tax', 'B&O tax on gross receipts', 'Seattle tech ecosystem'], govtFees: { formation: 259, annual: 60, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: 'No income tax; B&O on gross receipts', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 558, staffing: { employmentAgencyLicence: true, suretyBondRequired: false, workersCompRequired: true, note: 'Employment agency registration required.', verified: false } },
  { code: 'IL', name: 'Illinois', popularityRank: 25, tag: null, tagline: 'Chicago market access', snippet: 'Mid-range fees with access to the Chicago metropolitan market.', bestFor: 'Finance, logistics, professional services', keyPoints: ['$150 formation fee', '$75 annual report', 'Chicago market'], govtFees: { formation: 150, annual: 75, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due before the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '9.5% combined corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 449, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Private employment agency licence; Day & Temp Labor Services Act applies.', verified: false } },
  { code: 'PA', name: 'Pennsylvania', popularityRank: 26, tag: null, tagline: 'Newly annual reporting', snippet: 'Switched from decennial to annual filing in 2025, though the fee is nominal.', bestFor: 'Manufacturing, professional services', keyPoints: ['$125 formation fee', '$7 annual report (new from 2025)', 'Large eastern market'], govtFees: { formation: 125, annual: 7, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report introduced 2025, replacing the former decennial filing.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.49% corporate, reducing annually', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence and bond required.', verified: false } },
  { code: 'NJ', name: 'New Jersey', popularityRank: 27, tag: null, tagline: 'Northeast corridor', snippet: 'New York proximity at meaningfully lower cost.', bestFor: 'Pharma, logistics, professional services', keyPoints: ['$125 formation fee', '$75 annual report', 'NYC proximity at lower cost'], govtFees: { formation: 125, annual: 75, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment and personnel service registration required.', verified: false } },
  { code: 'TN', name: 'Tennessee', popularityRank: 28, tag: null, tagline: 'Per-member fee structure', snippet: '$50 per member with a $300 floor — cost rises as membership grows.', bestFor: 'Operating businesses with few members', keyPoints: ['$300 minimum ($50 per member)', 'Annual report also $300 minimum', 'No personal income tax'], govtFees: { formation: 300, annual: 300, annualFrequency: 'annual', currency: 'USD', annualNote: '$50 per member, minimum $300, maximum $3,000. Due on the first day of the fourth month after fiscal year end.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '6.5% excise tax', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 599, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'NH', name: 'New Hampshire', popularityRank: 29, tag: null, tagline: 'No sales or income tax', snippet: 'No state sales tax and no personal income tax on earned income.', bestFor: 'Retail, small businesses', keyPoints: ['$100 formation fee', '$100 annual report', 'No sales tax'], govtFees: { formation: 100, annual: 100, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '7.5% business profits tax', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'OR', name: 'Oregon', popularityRank: 30, tag: null, tagline: 'No sales tax', snippet: 'No state sales tax, with matching $100 formation and annual fees.', bestFor: 'Retail, e-commerce, outdoor sector', keyPoints: ['$100 formation fee', '$100 annual report', 'No state sales tax'], govtFees: { formation: 100, annual: 100, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '6.6–7.6% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'OK', name: 'Oklahoma', popularityRank: 31, tag: null, tagline: 'Low annual certificate', snippet: 'Standard formation cost with a low $25 annual certificate.', bestFor: 'Energy, agriculture', keyPoints: ['$100 formation fee', '$25 annual certificate', 'Energy sector'], govtFees: { formation: 100, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual certificate due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'LA', name: 'Louisiana', popularityRank: 32, tag: null, tagline: 'Port and energy access', snippet: 'Standard fees with major port infrastructure and an established energy sector.', bestFor: 'Energy, shipping, logistics', keyPoints: ['$100 formation fee', '$35 annual report', 'Major port access'], govtFees: { formation: 100, annual: 35, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '7.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'AR', name: 'Arkansas', popularityRank: 33, tag: null, tagline: 'Flat franchise tax', snippet: 'Cheap to form, but a flat $150 franchise tax applies regardless of revenue.', bestFor: 'Small businesses, agriculture', keyPoints: ['$50 state fee', '$150 annual franchise tax', 'Low entry cost'], govtFees: { formation: 50, annual: 150, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual franchise tax due by 1 May.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '5.1% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'ID', name: 'Idaho', popularityRank: 34, tag: null, tagline: 'Free annual report', snippet: 'The annual report must be filed but costs nothing.', bestFor: 'Agriculture, technology, small businesses', keyPoints: ['$100 formation fee', 'Annual report free to file', 'Fast-growing economy'], govtFees: { formation: 100, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report required in the anniversary month but free.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '5.8% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 399, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'MN', name: 'Minnesota', popularityRank: 35, tag: null, tagline: 'Free annual renewal', snippet: 'Annual renewal is required but carries no fee at all.', bestFor: 'Healthcare, retail, manufacturing', keyPoints: ['$135 state fee', 'Annual renewal free to file', 'Large corporate presence'], govtFees: { formation: 135, annual: 0, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual renewal required by 31 December but free to file.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '9.8% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 434, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence and bond required.', verified: false } },
  { code: 'WI', name: 'Wisconsin', popularityRank: 36, tag: null, tagline: 'Low annual fee', snippet: 'Moderate formation cost with just $25 due annually.', bestFor: 'Manufacturing, agriculture', keyPoints: ['$130 formation fee', '$25 annual report', 'Manufacturing base'], govtFees: { formation: 130, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary quarter.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–7 days', serviceFee: 299, stateIncomeTax: '7.9% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 429, staffing: { employmentAgencyLicence: false, suretyBondRequired: false, workersCompRequired: true, note: 'No general staffing licence.', verified: false } },
  { code: 'WV', name: 'West Virginia', popularityRank: 37, tag: null, tagline: 'Low annual fee', snippet: 'Standard formation cost with a low $25 annual report.', bestFor: 'Energy, small businesses', keyPoints: ['$100 formation fee', '$25 annual report', 'Energy sector'], govtFees: { formation: 130, annual: 25, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due between 1 January and 30 June.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '6.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 429, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'NE', name: 'Nebraska', popularityRank: 38, tag: null, tagline: 'Biennial, cheap renewal', snippet: '$13 every two years is among the lowest recurring costs anywhere.', bestFor: 'Small businesses, agriculture', keyPoints: ['$13 biennial report', 'Publication requirement applies', 'Low renewal cost'], govtFees: { formation: 110, annual: 13, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due in odd years. Newspaper publication required at formation.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '5.58–7.25% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 409, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'KS', name: 'Kansas', popularityRank: 39, tag: null, tagline: 'Mid-range fees', snippet: 'Straightforward processing with moderate costs at both stages.', bestFor: 'Agriculture, aviation, logistics', keyPoints: ['$165 state fee', '$50 annual report', 'Aviation sector'], govtFees: { formation: 165, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the 15th day of the fourth month after tax year end.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: '4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 464, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'ND', name: 'North Dakota', popularityRank: 40, tag: null, tagline: 'Energy sector base', snippet: 'Standard fees in an economy anchored by energy and agriculture.', bestFor: 'Energy, agriculture', keyPoints: ['$135 formation fee', '$50 annual report', 'Energy sector'], govtFees: { formation: 135, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 1 November.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '4.31% top corporate rate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 434, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'SD', name: 'South Dakota', popularityRank: 41, tag: null, tagline: 'No corporate income tax', snippet: 'No corporate or personal income tax, with strong trust law.', bestFor: 'Financial services, agriculture, trusts', keyPoints: ['No corporate income tax', '$150 formation fee', '$50 annual report', 'Strong trust law'], govtFees: { formation: 150, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary month.', verified: true, source: 'CompanyVista official rate card' }, timeline: '4–8 days', serviceFee: 299, stateIncomeTax: 'None', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 449, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'VT', name: 'Vermont', popularityRank: 42, tag: null, tagline: 'Low annual report', snippet: 'Moderate formation cost with just $35 due annually.', bestFor: 'Agriculture, tourism, small businesses', keyPoints: ['$125 formation fee', '$35 annual report', 'Small business friendly'], govtFees: { formation: 125, annual: 35, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due within 3 months of fiscal year end.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.5% top corporate rate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 424, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'ME', name: 'Maine', popularityRank: 43, tag: null, tagline: 'Higher fee structure', snippet: 'Above-average fees at both stages. Best with a genuine Maine connection.', bestFor: 'Tourism, fishing, small businesses', keyPoints: ['$175 formation fee', '$85 annual report', 'Tourism economy'], govtFees: { formation: 175, annual: 85, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 1 June.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.93% top corporate rate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 474, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'RI', name: 'Rhode Island', popularityRank: 44, tag: null, tagline: 'Compact market', snippet: 'Standard fees in the smallest state, suited to local marine and coastal work.', bestFor: 'Small businesses, marine industries', keyPoints: ['$150 formation fee', '$50 annual report', 'Marine sector'], govtFees: { formation: 150, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due between 1 February and 1 May.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '7% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 449, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'CT', name: 'Connecticut', popularityRank: 45, tag: null, tagline: 'Financial services adjacent', snippet: 'New York proximity with somewhat lower operating costs.', bestFor: 'Financial services, insurance', keyPoints: ['$120 formation fee', '$80 annual report', 'Insurance and finance sector'], govtFees: { formation: 120, annual: 80, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due by 31 March.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–8 days', serviceFee: 299, stateIncomeTax: '7.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 419, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'HI', name: 'Hawaii', popularityRank: 46, tag: null, tagline: 'Low annual fee', snippet: 'Cheap to form and just $15 a year, though geography limits most models.', bestFor: 'Tourism, hospitality, small businesses', keyPoints: ['$50 formation fee', '$15 annual report', 'Tourism economy'], govtFees: { formation: 50, annual: 15, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due in the anniversary quarter.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–10 days', serviceFee: 299, stateIncomeTax: '4.4–6.4% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 349, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'MD', name: 'Maryland', popularityRank: 47, tag: null, tagline: 'High filing fee', snippet: 'Expensive at both stages. Chosen mainly for genuine DC proximity.', bestFor: 'Government-adjacent services, biotech', keyPoints: ['$450 state fee', '$300 annual report', 'DC proximity'], govtFees: { formation: 450, annual: 300, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report and personal property return due 15 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.25% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 749, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'MA', name: 'Massachusetts', popularityRank: 48, tag: null, tagline: 'Highest fees, best talent', snippet: "The most expensive state, offset by Boston's biotech and academic ecosystem.", bestFor: 'Biotech, deep tech, academic spinouts', keyPoints: ['$500 state fee — highest nationally', '$500 annual report', "Boston biotech and academic cluster"], govtFees: { formation: 500, annual: 500, annualFrequency: 'annual', currency: 'USD', annualNote: 'Annual report due on the formation anniversary.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 799, staffing: { employmentAgencyLicence: true, suretyBondRequired: true, workersCompRequired: true, note: 'Employment agency licence; Temporary Workers Right to Know Act applies.', verified: false } },
  { code: 'AL', name: 'Alabama', popularityRank: 49, tag: null, tagline: 'Privilege tax applies', snippet: 'Standard formation with an annual privilege tax based on net worth.', bestFor: 'Small operating businesses', keyPoints: ['$180 state fee', '$50 minimum privilege tax', 'Manufacturing base'], govtFees: { formation: 180, annual: 50, annualFrequency: 'annual', currency: 'USD', annualNote: 'Business Privilege Tax, $50 minimum, based on net worth.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '6.5% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 479, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'AK', name: 'Alaska', popularityRank: 50, tag: null, tagline: 'No sales or income tax', snippet: 'No state sales or income tax, with biennial rather than annual reporting.', bestFor: 'Resource extraction, fishing, tourism', keyPoints: ['$250 state fee', 'No state sales or income tax', '$100 biennial report'], govtFees: { formation: 250, annual: 100, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due by 2 January in alternating years.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–10 days', serviceFee: 299, stateIncomeTax: '0–9.4% graduated corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 549, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
  { code: 'DC', name: 'District of Columbia', popularityRank: 51, tag: null, tagline: 'Federal proximity', snippet: 'Not a state, but available. Positioned for government-adjacent work.', bestFor: 'Government relations, associations, consultancies', keyPoints: ['$220 filing fee', '$300 biennial report', 'Federal proximity'], govtFees: { formation: 220, annual: 300, annualFrequency: 'biennial', currency: 'USD', annualNote: 'Biennial report due by 1 April.', verified: true, source: 'CompanyVista official rate card' }, timeline: '5–9 days', serviceFee: 299, stateIncomeTax: '8.25% corporate', anonymousLLC: false, entityTypes: ['LLC', 'C-CORP', 'S-CORP', 'NONPROFIT'], packageIncludes: ['Name availability check', 'Registered Address (1 year)', 'Registered Agent (1 year)', 'EIN application', 'Bank account assistance'], totalFirstYear: 519, staffing: { employmentAgencyLicence: null, suretyBondRequired: null, workersCompRequired: true, note: 'Not yet reviewed — confirm before placing workers.', verified: false } },
];

const FILTER_TAGS = [
  { id: '1', label: '👥 Staffing' },
  { id: '2', label: '🇺🇸 US clients' },
  { id: '3', label: 'Banking - Low tax - Speed' },
  { id: '4', label: '💳 Cards' },
  { id: '5', label: 'Edit answers', isAction: true },
];

const FEATURES = [
  {
    boldText: 'Stripe and PayPal work natively',
    normalText: ' — essential for US-facing revenue.',
  },
  {
    boldText: 'Banking is straightforward',
    normalText: ' — Mercury, Relay and Wise onboard non-residents remotely.',
  },
  {
    boldText: 'Mature payroll rails',
    normalText: ' for placing workers: Gusto, Rippling, ADP.',
  },
  {
    boldText: '3–7 days',
    normalText: ' to incorporate, with Express EIN in 3–5 days.',
  },
];

const STRONG_ALTERNATIVES = [
  { flag: '🇬🇧', name: 'United Kingdom', desc: 'Stripe-ready · 24hr setup · no agency licence', match: '87%' },
  { flag: '🇦🇪', name: 'United Arab Emirates', desc: '0% tax & visa route · MOHRE licence needed', match: '78%' },
  { flag: '🇸🇬', name: 'Singapore', desc: 'Best Asian banking · resident director required', match: '74%' },
];

const ALSO_POSSIBLE = [
  { flag: '🇮🇪', name: 'Ireland', desc: '12.5% tax · EU access · EEA director needed', match: '69%' },
  { flag: '🇪🇪', name: 'Estonia', desc: '0% retained tax · EU banking harder', match: '66%' },
  { flag: '🇭🇰', name: 'Hong Kong', desc: 'Territorial tax · Asia focused', match: '63%' },
  { flag: '🇨🇦', name: 'Canada', desc: 'USMCA access · BC has no residency rule', match: '61%' },
  { flag: '🇳🇱', name: 'Netherlands', desc: 'Treaty network · slower setup', match: '57%' },
  { flag: '🇬🇪', name: 'Georgia', desc: '0% retained · weak for US clients', match: '52%' },
];

export default function BestMatchesScreen({ navigation, route }) {
  const params = route?.params || {};
  const { purpose, customerLocation, priorities = [], dayOneNeeds = [] } = params;

  // Dynamic filter tags based on user selections
  const purposeLabelMap = {
    STAFFING: '👥 Staffing',
    ECOM: '🛒 E-commerce',
    CONSULT: '💼 Consulting',
    SAAS: '💻 Software',
    HOLDING: '🏛️ Holding',
    TRADING: '📦 Trading',
    CRYPTO: '⛓️ Crypto',
    STARTUP: '🚀 Startup',
    MARKETING: '🎨 Marketing',
    LOGISTICS: '🚚 Logistics',
    HEALTH: '🏥 Healthcare',
    FINSERV: '💹 Financial Services',
    REALESTATE: '🏠 Real Estate',
    EDU: '🎓 Education',
    MANUFACTURING: '🏭 Manufacturing',
    OTHER: '••• Other',
    // lowercase fallback for old data
    staffing: '👥 Staffing', ecommerce: '🛒 E-commerce', consulting: '💼 Consulting', software: '💻 Software', holding: '🏛️ Holding',
  };
  const customerLabelMap = { us: '🇺🇸 US clients', eu: '🇪🇺 EU', asia_me: '🌏 Asia & ME', global: '🌐 Global', home: '🏠 Home' };
  const priorityLabelMap = { banking: 'Banking', tax: 'Low tax', fast: 'Fast setup', cost: 'Lowest cost', investor: 'Investor', privacy: 'Privacy', visa: 'Visa', maintenance: 'Low maintenance', reputation: 'Reputation' };
  const dayOneLabelMap = { payments: '💳 Cards', workers: '👥 Workers', multicurrency: '💱 Multi-currency', investment: '📈 Investment', residence_visa: '🪪 Visa', physical_office: '🏢 Office' };

  const dynamicTags = [];
  if (purpose) dynamicTags.push({ id: 'purpose', label: purposeLabelMap[purpose] || purpose });
  if (customerLocation) dynamicTags.push({ id: 'customer', label: customerLabelMap[customerLocation] || customerLocation });
  if (priorities.length) dynamicTags.push({ id: 'priorities', label: priorities.map(p => priorityLabelMap[p] || p).slice(0, 3).join(' · ') });
  if (dayOneNeeds.length) dynamicTags.push({ id: 'dayone', label: dayOneNeeds.map(d => dayOneLabelMap[d] || d).slice(0, 2).join(' · ') });
  dynamicTags.push({ id: 'edit', label: 'Edit answers', isAction: true });
  const displayTags = dynamicTags.length > 1 ? dynamicTags : FILTER_TAGS;

  // Dynamic ranking based on selections - enriched with PURPOSES recommended/caution + advisorWeights
  const allJurisdictions = [
    { code: 'US', flag: '🇺🇸', name: 'United States', subtitle: 'Wyoming or Delaware LLC', base: 70, match: '96%', purposes: ['STAFFING','ECOM','CONSULT','SAAS','staffing','ecommerce','consulting','software'], customers: ['us','global'], priorities: ['banking','fast','investor','reputation'], dayOne: ['payments','workers','investment'], profile: { banking: 3, credibility: 3, lowTax: 1, speed: 3, cost: 2, privacy: 0, compliance: 2 } },
    { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', subtitle: 'Stripe-ready · 24hr setup', desc: 'Stripe-ready · 24hr setup · no agency licence', base: 68, match: '87%', purposes: ['CONSULT','SAAS','ECOM','MARKETING','EDU','consulting','software','ecommerce'], customers: ['eu','global','home'], priorities: ['reputation','banking','fast'], dayOne: ['payments','multicurrency'], profile: { banking: 3, credibility: 3, lowTax: 2, speed: 3, cost: 2, privacy: 1, compliance: 2 } },
    { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', subtitle: '0% tax & visa route', desc: '0% tax & visa route · MOHRE licence needed', base: 65, match: '78%', purposes: ['HOLDING','CONSULT','ECOM','TRADING','MARKETING','LOGISTICS','HEALTH','FINSERV','REALESTATE','EDU','STAFFING'], customers: ['asia_me','global'], priorities: ['tax','privacy','visa'], dayOne: ['residence_visa','physical_office'], profile: { banking: 2, credibility: 2, lowTax: 3, speed: 2, cost: 1, privacy: 2, compliance: 1 } },
    { code: 'SG', flag: '🇸🇬', name: 'Singapore', subtitle: 'Best Asian banking', desc: 'Best Asian banking · resident director required', base: 64, match: '74%', purposes: ['HOLDING','SAAS','TRADING','CRYPTO','STARTUP','LOGISTICS','FINSERV','STAFFING'], customers: ['asia_me','global'], priorities: ['banking','reputation','tax'], dayOne: ['multicurrency','investment'], profile: { banking: 3, credibility: 3, lowTax: 2, speed: 2, cost: 1, privacy: 1, compliance: 2 } },
    { code: 'IE', flag: '🇮🇪', name: 'Ireland', subtitle: '12.5% tax · EU access', desc: '12.5% tax · EU access · EEA director needed', base: 62, match: '69%', purposes: ['SAAS','CONSULT','STARTUP'], customers: ['eu'], priorities: ['tax','reputation'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 3, lowTax: 2, speed: 2, cost: 2, privacy: 1, compliance: 2 } },
    { code: 'EE', flag: '🇪🇪', name: 'Estonia', subtitle: '0% retained tax', desc: '0% retained tax · EU banking harder', base: 60, match: '66%', purposes: ['SAAS','HOLDING','ECOM','CONSULT','MARKETING','EDU'], customers: ['eu','global'], priorities: ['tax','cost','maintenance'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 3, speed: 3, cost: 3, privacy: 2, compliance: 1 } },
    { code: 'HK', flag: '🇭🇰', name: 'Hong Kong', subtitle: 'Territorial tax', desc: 'Territorial tax · Asia focused', base: 59, match: '63%', purposes: ['HOLDING','ECOM','TRADING','LOGISTICS'], customers: ['asia_me'], priorities: ['tax','privacy'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 2, lowTax: 3, speed: 2, cost: 2, privacy: 1, compliance: 1 } },
    { code: 'CA', flag: '🇨🇦', name: 'Canada', subtitle: 'USMCA access', desc: 'USMCA access · BC has no residency rule', base: 58, match: '61%', purposes: ['CONSULT','ECOM'], customers: ['us','global'], priorities: ['reputation','cost'], dayOne: ['workers'], profile: { banking: 2, credibility: 3, lowTax: 1, speed: 1, cost: 2, privacy: 1, compliance: 3 } },
    { code: 'NL', flag: '🇳🇱', name: 'Netherlands', subtitle: 'Treaty network', desc: 'Treaty network · slower setup', base: 55, match: '57%', purposes: ['HOLDING','CONSULT','LOGISTICS'], customers: ['eu'], priorities: ['reputation','tax'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 3, lowTax: 2, speed: 1, cost: 1, privacy: 1, compliance: 3 } },
    { code: 'GE', flag: '🇬🇪', name: 'Georgia', subtitle: '0% retained', desc: '0% retained · weak for US clients', base: 52, match: '52%', purposes: ['HOLDING','CONSULT','MARKETING','CRYPTO'], customers: ['asia_me','home'], priorities: ['cost','tax','privacy'], dayOne: ['residence_visa'], profile: { banking: 1, credibility: 1, lowTax: 3, speed: 3, cost: 3, privacy: 2, compliance: 1 } },
    { code: 'CY', flag: '🇨🇾', name: 'Cyprus', subtitle: 'EU holding · 12.5% tax', desc: 'EU member with treaty network', base: 54, match: '55%', purposes: ['HOLDING'], customers: ['eu'], priorities: ['tax','privacy'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 2, speed: 1, cost: 2, privacy: 2, compliance: 2 } },
    { code: 'MT', flag: '🇲🇹', name: 'Malta', subtitle: 'EU gaming & finance', desc: 'EU compliant with incentives', base: 53, match: '54%', purposes: ['HOLDING','FINSERV'], customers: ['eu'], priorities: ['tax'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 2, speed: 1, cost: 2, privacy: 1, compliance: 2 } },
    { code: 'IN', flag: '🇮🇳', name: 'India', subtitle: 'Large domestic market', desc: 'Complex but huge market', base: 50, match: '50%', purposes: ['MANUFACTURING','CONSULT'], customers: ['asia_me'], priorities: ['cost'], dayOne: ['workers'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'CN', flag: '🇨🇳', name: 'China', subtitle: 'Manufacturing hub', desc: 'WFOE required', base: 48, match: '48%', purposes: ['MANUFACTURING','TRADING'], customers: ['asia_me'], priorities: ['cost'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'AU', flag: '🇦🇺', name: 'Australia', subtitle: 'Stable · high credibility', desc: 'High compliance market', base: 55, match: '56%', purposes: ['CONSULT','REALESTATE'], customers: ['global'], priorities: ['credibility','banking'], dayOne: ['payments'], profile: { banking: 2, credibility: 3, lowTax: 1, speed: 1, cost: 1, privacy: 0, compliance: 3 } },
    { code: 'DE', flag: '🇩🇪', name: 'Germany', subtitle: 'EU powerhouse', desc: 'Strong but heavy compliance', base: 54, match: '55%', purposes: ['MANUFACTURING','CONSULT'], customers: ['eu'], priorities: ['credibility','compliance'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 3, lowTax: 1, speed: 1, cost: 1, privacy: 1, compliance: 3 } },
    { code: 'CH', flag: '🇨🇭', name: 'Switzerland', subtitle: 'Private banking · premium', desc: 'Top privacy & banking', base: 60, match: '62%', purposes: ['HOLDING','FINSERV','CRYPTO'], customers: ['eu','global'], priorities: ['privacy','banking','credibility'], dayOne: ['multicurrency','investment'], profile: { banking: 3, credibility: 3, lowTax: 2, speed: 1, cost: 0, privacy: 3, compliance: 2 } },
    { code: 'PA', flag: '🇵🇦', name: 'Panama', subtitle: 'Territorial tax', desc: 'Classic offshore', base: 48, match: '49%', purposes: ['HOLDING','TRADING'], customers: ['global'], priorities: ['privacy','lowTax'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 3, speed: 1, cost: 2, privacy: 3, compliance: 0 } },
    { code: 'MY', flag: '🇲🇾', name: 'Malaysia', subtitle: 'Labuan option', desc: 'Asia hub with incentives', base: 51, match: '53%', purposes: ['MANUFACTURING','HOLDING'], customers: ['asia_me'], priorities: ['tax','cost'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 2, privacy: 1, compliance: 1 } },
    { code: 'IL', flag: '🇮🇱', name: 'Israel', subtitle: 'Startup nation', desc: 'Tech ecosystem', base: 53, match: '54%', purposes: ['SAAS','STARTUP'], customers: ['global'], priorities: ['banking','credibility'], dayOne: ['investment'], profile: { banking: 2, credibility: 2, lowTax: 1, speed: 1, cost: 1, privacy: 1, compliance: 2 } },
    { code: 'JP', flag: '🇯🇵', name: 'Japan', subtitle: 'High credibility', desc: 'Complex incorporation', base: 52, match: '53%', purposes: ['MANUFACTURING','TRADING'], customers: ['asia_me'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 3, lowTax: 1, speed: 1, cost: 0, privacy: 0, compliance: 3 } },
    { code: 'KR', flag: '🇰🇷', name: 'South Korea', subtitle: 'Tech & manufacturing', desc: 'Advanced market', base: 51, match: '52%', purposes: ['MANUFACTURING'], customers: ['asia_me'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 2, lowTax: 1, speed: 1, cost: 1, privacy: 0, compliance: 2 } },
    { code: 'PT', flag: '🇵🇹', name: 'Portugal', subtitle: 'EU residency route', desc: 'NHR & visa options', base: 54, match: '55%', purposes: ['REALESTATE','CONSULT'], customers: ['eu'], priorities: ['visa','lowTax'], dayOne: ['residence_visa'], profile: { banking: 1, credibility: 2, lowTax: 2, speed: 1, cost: 2, privacy: 1, compliance: 1 } },
    { code: 'ES', flag: '🇪🇸', name: 'Spain', subtitle: 'EU market', desc: 'Large EU economy', base: 52, match: '53%', purposes: ['CONSULT','REALESTATE'], customers: ['eu'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 1, speed: 1, cost: 1, privacy: 1, compliance: 2 } },
    { code: 'FR', flag: '🇫🇷', name: 'France', subtitle: 'EU leader', desc: 'Strong regulation', base: 52, match: '53%', purposes: ['CONSULT','MANUFACTURING'], customers: ['eu'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 1, speed: 1, cost: 1, privacy: 1, compliance: 2 } },
    { code: 'IT', flag: '🇮🇹', name: 'Italy', subtitle: 'EU market', desc: 'Traditional economy', base: 51, match: '52%', purposes: ['CONSULT'], customers: ['eu'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 1, speed: 1, cost: 1, privacy: 1, compliance: 2 } },
    { code: 'PL', flag: '🇵🇱', name: 'Poland', subtitle: 'Growing EU', desc: 'Cost effective EU', base: 53, match: '54%', purposes: ['CONSULT','MANUFACTURING'], customers: ['eu'], priorities: ['cost','lowTax'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 3, privacy: 1, compliance: 1 } },
    { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic', subtitle: 'Central EU', desc: 'EU access', base: 52, match: '53%', purposes: ['CONSULT'], customers: ['eu'], priorities: ['cost'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 2, privacy: 1, compliance: 1 } },
    { code: 'RO', flag: '🇷🇴', name: 'Romania', subtitle: 'Low cost EU', desc: 'Budget EU option', base: 51, match: '52%', purposes: ['CONSULT'], customers: ['eu'], priorities: ['cost','lowTax'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 3, privacy: 1, compliance: 1 } },
    { code: 'BG', flag: '🇧🇬', name: 'Bulgaria', subtitle: '10% flat tax', desc: 'Lowest EU tax', base: 52, match: '53%', purposes: ['HOLDING'], customers: ['eu'], priorities: ['lowTax','cost'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 3, speed: 1, cost: 3, privacy: 1, compliance: 1 } },
    { code: 'LU', flag: '🇱🇺', name: 'Luxembourg', subtitle: 'Holding & funds', desc: 'Premium holding', base: 58, match: '60%', purposes: ['HOLDING','FINSERV'], customers: ['eu'], priorities: ['credibility','lowTax'], dayOne: ['investment'], profile: { banking: 2, credibility: 3, lowTax: 2, speed: 1, cost: 0, privacy: 2, compliance: 3 } },
    { code: 'TH', flag: '🇹🇭', name: 'Thailand', subtitle: 'Southeast Asia', desc: 'BOI incentives', base: 50, match: '51%', purposes: ['MANUFACTURING','TRADING'], customers: ['asia_me'], priorities: ['cost'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'ID', flag: '🇮🇩', name: 'Indonesia', subtitle: 'Large market', desc: 'PT PMA structure', base: 49, match: '50%', purposes: ['MANUFACTURING'], customers: ['asia_me'], priorities: ['cost'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'PH', flag: '🇵🇭', name: 'Philippines', subtitle: 'BPO hub', desc: 'Service market', base: 49, match: '50%', purposes: ['CONSULT'], customers: ['asia_me'], priorities: ['cost'], dayOne: ['workers'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'NZ', flag: '🇳🇿', name: 'New Zealand', subtitle: 'High trust', desc: 'Stable jurisdiction', base: 54, match: '55%', purposes: ['CONSULT'], customers: ['global'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 2, credibility: 3, lowTax: 1, speed: 1, cost: 1, privacy: 0, compliance: 2 } },
    { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', subtitle: 'Vision 2030', desc: 'Growing market', base: 50, match: '51%', purposes: ['TRADING','MANUFACTURING'], customers: ['asia_me'], priorities: ['visa'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 1, privacy: 0, compliance: 1 } },
    { code: 'QA', flag: '🇶🇦', name: 'Qatar', subtitle: 'Gulf hub', desc: 'Free zone options', base: 51, match: '52%', purposes: ['TRADING'], customers: ['asia_me'], priorities: ['lowTax'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 3, speed: 1, cost: 1, privacy: 1, compliance: 1 } },
    { code: 'BH', flag: '🇧🇭', name: 'Bahrain', subtitle: 'Gulf finance', desc: 'Fintech friendly', base: 52, match: '53%', purposes: ['FINSERV'], customers: ['asia_me'], priorities: ['lowTax','banking'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 3, speed: 1, cost: 1, privacy: 1, compliance: 1 } },
    { code: 'MX', flag: '🇲🇽', name: 'Mexico', subtitle: 'USMCA access', desc: 'Nearshoring', base: 52, match: '53%', purposes: ['MANUFACTURING','TRADING'], customers: ['global'], priorities: ['cost'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'BR', flag: '🇧🇷', name: 'Brazil', subtitle: 'Largest LatAm', desc: 'Complex tax', base: 48, match: '49%', purposes: ['MANUFACTURING'], customers: ['global'], priorities: ['cost'], dayOne: ['physical_office'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 0, cost: 1, privacy: 0, compliance: 1 } },
    { code: 'PE', flag: '🇵🇪', name: 'Peru', subtitle: 'Mining & trade', desc: 'Resource market', base: 47, match: '48%', purposes: ['TRADING'], customers: ['global'], priorities: ['cost'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'CL', flag: '🇨🇱', name: 'Chile', subtitle: 'Stable LatAm', desc: 'Market economy', base: 50, match: '51%', purposes: ['TRADING'], customers: ['global'], priorities: ['credibility'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 2, lowTax: 1, speed: 1, cost: 1, privacy: 0, compliance: 2 } },
    { code: 'CO', flag: '🇨🇴', name: 'Colombia', subtitle: 'Growing market', desc: 'Emerging economy', base: 48, match: '49%', purposes: ['TRADING'], customers: ['global'], priorities: ['cost'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 1, speed: 1, cost: 2, privacy: 0, compliance: 1 } },
    { code: 'UY', flag: '🇺🇾', name: 'Uruguay', subtitle: 'Stable & private', desc: 'LatAm hub', base: 50, match: '51%', purposes: ['HOLDING'], customers: ['global'], priorities: ['privacy'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 1, privacy: 2, compliance: 1 } },
    { code: 'MU', flag: '🇲🇺', name: 'Mauritius', subtitle: 'Africa-Asia hub', desc: 'Treaty network', base: 55, match: '56%', purposes: ['HOLDING'], customers: ['global'], priorities: ['lowTax'], dayOne: ['investment'], profile: { banking: 1, credibility: 2, lowTax: 3, speed: 1, cost: 1, privacy: 2, compliance: 1 } },
    { code: 'VG', flag: '🇻🇬', name: 'British Virgin Islands', subtitle: 'Classic offshore', desc: 'IBC structure', base: 45, match: '46%', purposes: ['HOLDING'], customers: ['global'], priorities: ['privacy','lowTax'], dayOne: ['multicurrency'], profile: { banking: 0, credibility: 1, lowTax: 3, speed: 1, cost: 1, privacy: 3, compliance: 0 } },
    { code: 'KY', flag: '🇰🇾', name: 'Cayman Islands', subtitle: 'Funds hub', desc: 'Premier offshore', base: 48, match: '49%', purposes: ['HOLDING','FINSERV','CRYPTO'], customers: ['global'], priorities: ['privacy','lowTax'], dayOne: ['investment'], profile: { banking: 1, credibility: 2, lowTax: 3, speed: 1, cost: 0, privacy: 3, compliance: 1 } },
    { code: 'BZ', flag: '🇧🇿', name: 'Belize', subtitle: 'IBC jurisdiction', desc: 'Low cost offshore', base: 44, match: '45%', purposes: ['HOLDING'], customers: ['global'], priorities: ['privacy','lowTax','cost'], dayOne: ['multicurrency'], profile: { banking: 0, credibility: 0, lowTax: 3, speed: 1, cost: 2, privacy: 3, compliance: 0 } },
    { code: 'SC', flag: '🇸🇨', name: 'Seychelles', subtitle: 'IBC offshore', desc: 'Fast & cheap', base: 44, match: '45%', purposes: ['HOLDING'], customers: ['global'], priorities: ['privacy','lowTax','cost'], dayOne: ['multicurrency'], profile: { banking: 0, credibility: 0, lowTax: 3, speed: 1, cost: 2, privacy: 3, compliance: 0 } },
    { code: 'BB', flag: '🇧🇧', name: 'Barbados', subtitle: 'Treaty network', desc: 'Caribbean hub', base: 50, match: '51%', purposes: ['HOLDING'], customers: ['global'], priorities: ['lowTax'], dayOne: ['multicurrency'], profile: { banking: 1, credibility: 1, lowTax: 2, speed: 1, cost: 1, privacy: 1, compliance: 1 } },
  ];

  // Purpose ke recommended/caution + advisorWeights se scoring
  const normalizedPurpose = purpose ? String(purpose).toUpperCase() : null;
  const selectedPurpose = normalizedPurpose ? PURPOSES.find(p => p.code === normalizedPurpose) : null;

  const scored = allJurisdictions.map(j => {
    let score = j.base;
    if (purpose && j.purposes.includes(purpose)) score += 12;
    if (normalizedPurpose && j.purposes.includes(normalizedPurpose)) score += 12;
    if (customerLocation && j.customers.includes(customerLocation)) score += 10;
    priorities.forEach(p => { if (j.priorities.includes(p)) score += 6; });
    dayOneNeeds.forEach(d => { if (j.dayOne.includes(d)) score += 5; });

    if (selectedPurpose) {
      if (selectedPurpose.recommendedJurisdictions?.includes(j.code)) score += 25;
      if (selectedPurpose.cautionJurisdictions?.includes(j.code)) score -= 40;
      // advisorWeights * jurisdiction profile
      const w = selectedPurpose.advisorWeights || {};
      let wScore = 0;
      Object.keys(w).forEach(k => {
        const weight = w[k] || 0;
        const prof = j.profile?.[k] ?? 0;
        wScore += weight * prof;
      });
      score += wScore * 1.1;
    }
    return { ...j, score };
  }).sort((a, b) => b.score - a.score);

  const ranked = scored;
  const [selectedBest, setSelectedBest] = useState(ranked[0]);

  // jab ranking change ho (purpose/customer change pe) toh selected ko reset karo
  useEffect(() => {
    setSelectedBest(ranked[0]);
  }, [purpose, customerLocation, priorities.join(','), dayOneNeeds.join(',')]);

  const best = selectedBest;
  // advisor me jis country ka price define hai uska price save karo - same as RegisterJurisdictionScreen allCountries
  const PRICED_JURISDICTIONS = ['United States', 'United Kingdom', 'Hong Kong', 'Canada'];
  const PRICE_MAP = {
    'United States': '$299',
    'United Kingdom': '$595',
    'Hong Kong': '$799',
    'Canada': '$899',
  };
  const PRICE_NUMERIC_MAP = {
    'United States': 299,
    'United Kingdom': 595,
    'Hong Kong': 799,
    'Canada': 899,
  };
  const showPrice = PRICED_JURISDICTIONS.includes(best.name);
  const isUSA = best.code === 'US' || best.name === 'United States';
  const getPriceNumeric = (name) => PRICE_NUMERIC_MAP[name] ?? 0;
  const handleContinue = () => {
    const baseParams = { ...params, bestCountry: best.code, bestCountryName: best.name, advisorFlow: true };
    // country price yahan se aage ke screens (StructureSelection) me dikhane ke liye bhej do
    const numericPrice = getPriceNumeric(best.name);
    if (isUSA) {
      // US: country price + state fee (state fee BestStatesForYou me add hota hai)
      navigation.navigate('USStatePhysicalPresence', { ...baseParams, selectedCountry: best.code, selectedCountryPrice: numericPrice, bestCountryPrice: numericPrice });
    } else {
      // Non-US: skip US state screens, go directly to CompanyNaming
      // priced jurisdiction ka price calculate karo, non-priced ka 0 (Custom quote -> Your Order)
      navigation.navigate('CompanyNaming', { ...baseParams, selectedCountry: best.code, selectedCountryPrice: numericPrice, bestCountryPrice: numericPrice });
    }
  };
  // selected ko list se exclude karke baki dikhao
  const remaining = ranked.filter(j => j.name !== best.name);
  const strongAlts = remaining.slice(0, 3);
  const alsoPossible = remaining.slice(3);
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
          Your best <Text style={styles.titleItalic}>matches</Text>
        </Text>
        <Text style={styles.subtitle}>
          {allJurisdictions.length} jurisdictions ranked against your answers.
        </Text>

        {/* Filter Tags - dynamic */}
        <View style={styles.tagsContainer}>
          {displayTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagPill,
                tag.isAction && styles.actionTagPill,
              ]}
              activeOpacity={0.8}
              onPress={tag.isAction ? () => navigation.navigate('CompanyPurpose', params) : undefined}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Best Match Main Card */}
        <View style={styles.matchCard}>
          {/* Badge */}
          <View style={styles.bestMatchBadge}>
            <Text style={styles.badgeText}>★ BEST MATCH</Text>
          </View>

          {/* Header Info - dynamic best */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.countryCodeText}>{best.flag}</Text>
              <View>
                <Text style={styles.countryName}>{best.name}</Text>
                <Text style={styles.stateSubtitle}>{best.subtitle}</Text>
              </View>
            </View>

            <View style={styles.matchPercentageContainer}>
              <Text style={styles.matchPercentage}>{best.match}</Text>
              <Text style={styles.matchLabel}>MATCH</Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            {FEATURES.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.featureText}>
                  <Text style={styles.featureBold}>{item.boldText}</Text>
                  {item.normalText}
                </Text>
              </View>
            ))}
          </View>

          {/* Warning Note */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>Watch:</Text> registering in every state where you place workers. Budget for multi-state payroll.
            </Text>
          </View>

          {/* Price Footer - only US/UK/HK/CA show price (same as RegisterJurisdiction), others Custom quote */}
          <View style={styles.cardFooter}>
            {showPrice ? (
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>{PRICE_MAP[best.name] || '$299'}</Text>
                <Text style={styles.priceNote}>incl. service package</Text>
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <Text style={styles.customQuoteText}>Custom quote</Text>
              </View>
            )}
            <Text style={styles.timeframeText}>3–7 days</Text>
          </View>
        </View>

        {/* Strong Alternatives Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STRONG ALTERNATIVES</Text>
          <View style={styles.sectionDivider} />
        </View>

        {strongAlts.map(item => (
          <TouchableOpacity key={item.name} style={styles.altCard} activeOpacity={0.7} onPress={() => setSelectedBest(item)}>
            <View style={styles.altLeft}>
              <Text style={styles.altFlag}>{item.flag}</Text>
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

        <View style={[styles.sectionHeader, { marginTop: s(18) }]}>
          <Text style={styles.sectionTitle}>ALSO POSSIBLE</Text>
          <View style={styles.sectionDivider} />
        </View>

        {alsoPossible.map(item => (
          <TouchableOpacity key={item.name} style={[styles.altCard, styles.altCardSmall]} activeOpacity={0.7} onPress={() => setSelectedBest(item)}>
            <View style={styles.altLeft}>
              <Text style={[styles.altFlag, { fontSize: 20 }]}>{item.flag}</Text>
              <View style={styles.altTextWrap}>
                <Text style={[styles.altName, { fontSize: 14 }]}>{item.name}</Text>
                <Text style={styles.altDesc}>{item.desc}</Text>
              </View>
            </View>
            <View style={styles.altMatchWrap}>
              <Text style={[styles.altMatch, { fontSize: 16 }]}>{item.match}</Text>
              <Text style={styles.altMatchLabel}>MATCH</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.excludedCard}>
          <Text style={styles.excludedText}>4 jurisdictions excluded. BVI, Cayman, Belize and Seychelles cannot practically employ or place workers.</Text>
        </View>
        <Text style={styles.guidanceText}>Guidance only, not tax advice. We will flag anything unusual about your case before filing.</Text>
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={styles.actionButtonText}>
            Continue with {best.name}  →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.browseButton} activeOpacity={0.7}>
          <Text style={styles.browseText}>
            You can still browse all 50 countries
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
    paddingHorizontal: s(16),
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
  countryCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginRight: s(12),
  },
  countryName: {
    color: '#FFFFFF',
    fontSize: 20,
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
  customQuoteText: {
    color: '#D1A253',
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
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
  altCardSmall: {
    backgroundColor: '#0F1420',
    borderColor: '#1E2638',
  },
  altLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: s(10),
  },
  altFlag: {
    fontSize: 22,
  },
  altTextWrap: {
    flex: 1,
  },
  altName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  altDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: s(2),
    lineHeight: 14,
  },
  altMatchWrap: {
    alignItems: 'flex-end',
    marginLeft: s(8),
  },
  altMatch: {
    color: '#D1A253',
    fontSize: 18,
    fontWeight: '700',
  },
  altMatchLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  excludedCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: s(12),
    marginTop: s(16),
  },
  excludedText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  guidanceText: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
    marginTop: s(10),
    lineHeight: 14,
  },
  bottomContainer: {
    paddingHorizontal: s(20),
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
