import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/buttons/BackButton';
import logoR from '../../../assets/images/logoR.png';

const CountrySelectionScreen = ({ navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const allCountries = [
    { id: 'US', code: 'US', name: 'USA (United States)', price: 'from $299' },
    { id: 'AE', code: 'AE', name: 'UAE (United Arab Emirates)', price: 'from $1,499' },
    { id: 'GB', code: 'GB', name: 'UK (United Kingdom)', price: 'from $595' },
    { id: 'SG', code: 'SG', name: 'Singapore', price: 'from $899' },
    { id: 'EE', code: 'EE', name: 'Estonia', price: 'from $499' },
    { id: 'HK', code: 'HK', name: 'Hong Kong', price: 'from $1,475' },
    { id: 'CY', code: 'CY', name: 'Cyprus', price: 'from $399' },
    { id: 'MT', code: 'MT', name: 'Malta', price: 'from $599' },
    { id: 'CA', code: 'CA', name: 'Canada', price: 'from $1,299' },
    { id: 'IN', code: 'IN', name: 'India', price: 'from $599' },
    { id: 'CN', code: 'CN', name: 'China', price: 'from $599' },
    { id: 'AU', code: 'AU', name: 'Australia', price: 'from $599' },
    { id: 'DE', code: 'DE', name: 'Germany', price: 'from $599' },
    { id: 'NL', code: 'NL', name: 'Netherlands', price: 'from $599' },
    { id: 'IE', code: 'IE', name: 'Ireland', price: 'from $599' },
    { id: 'CH', code: 'CH', name: 'Switzerland', price: 'from $599' },
    { id: 'PA', code: 'PA', name: 'Panama', price: 'from $599' },
    { id: 'MY', code: 'MY', name: 'Malaysia', price: 'from $599' },
    { id: 'GE', code: 'GE', name: 'Georgia', price: 'from $599' },
    { id: 'IL', code: 'IL', name: 'Israel', price: 'from $599' },
    { id: 'JP', code: 'JP', name: 'Japan', price: 'from $599' },
    { id: 'KR', code: 'KR', name: 'South Korea', price: 'from $599' },
    { id: 'PT', code: 'PT', name: 'Portugal', price: 'from $599' },
    { id: 'ES', code: 'ES', name: 'Spain', price: 'from $599' },
    { id: 'FR', code: 'FR', name: 'France', price: 'from $599' },
    { id: 'IT', code: 'IT', name: 'Italy', price: 'from $599' },
    { id: 'PL', code: 'PL', name: 'Poland', price: 'from $599' },
    { id: 'CZ', code: 'CZ', name: 'Czech Republic', price: 'from $599' },
    { id: 'RO', code: 'RO', name: 'Romania', price: 'from $599' },
    { id: 'BG', code: 'BG', name: 'Bulgaria', price: 'from $599' },
    { id: 'LU', code: 'LU', name: 'Luxembourg', price: 'from $599' },
    { id: 'TH', code: 'TH', name: 'Thailand', price: 'from $599' },
    { id: 'ID', code: 'ID', name: 'Indonesia', price: 'from $599' },
    { id: 'PH', code: 'PH', name: 'Philippines', price: 'from $599' },
    { id: 'NZ', code: 'NZ', name: 'New Zealand', price: 'from $599' },
    { id: 'SA', code: 'SA', name: 'Saudi Arabia', price: 'from $599' },
    { id: 'QA', code: 'QA', name: 'Qatar', price: 'from $599' },
    { id: 'BH', code: 'BH', name: 'Bahrain', price: 'from $599' },
    { id: 'MX', code: 'MX', name: 'Mexico', price: 'from $599' },
    { id: 'BR', code: 'BR', name: 'Brazil', price: 'from $599' },
    { id: 'PE', code: 'PE', name: 'Peru', price: 'from $599' },
    { id: 'CL', code: 'CL', name: 'Chile', price: 'from $599' },
    { id: 'CO', code: 'CO', name: 'Colombia', price: 'from $599' },
    { id: 'UY', code: 'UY', name: 'Uruguay', price: 'from $599' },
    { id: 'MU', code: 'MU', name: 'Mauritius', price: 'from $599' },
    { id: 'VG', code: 'VG', name: 'British Virgin Islands', price: 'from $599' },
    { id: 'KY', code: 'KY', name: 'Cayman Islands', price: 'from $599' },
    { id: 'BZ', code: 'BZ', name: 'Belize', price: 'from $599' },
    { id: 'SC', code: 'SC', name: 'Seychelles', price: 'from $599' },
    { id: 'BB', code: 'BB', name: 'Barbados', price: 'from $599' },
  ];

  // Agar koi country select hai to sirf wahi dikhao (baki hide), warna search / full list
  const baseFiltered = searchQuery.trim()
    ? allCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCountries;

  const filteredCountries = selectedCountry
    ? baseFiltered.filter(c => c.id === selectedCountry)
    : baseFiltered;

  const usStates = [
  {
    "code": "WY",
    "name": "Wyoming",
    "popularityRank": 1,
    "tag": "Best value",
    "tagline": "Best value, strong privacy",
    "snippet": "Lowest running costs in the US with no income tax and members kept off public record.",
    "bestFor": "Solo founders, e-commerce, holding companies, cost-conscious setups",
    "keyPoints": [
      "$100 state fee — excellent value",
      "No state income, franchise or gross receipts tax",
      "Members not disclosed on public filings",
      "Lifetime proxy permitted for added anonymity"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 60,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report licence tax, $60 minimum, based on assets located in Wyoming.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "3–5 days",
    "serviceFee": 299,
    "stateIncomeTax": "None",
    "anonymousLLC": true,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "DE",
    "name": "Delaware",
    "popularityRank": 2,
    "tag": "Top pick",
    "tagline": "What investors expect",
    "snippet": "The state VCs insist on. Court of Chancery gives the deepest business-law precedent anywhere.",
    "bestFor": "Startups raising VC, companies issuing equity, holding structures",
    "keyPoints": [
      "Preferred by the overwhelming majority of US VCs",
      "Court of Chancery — judges, no juries, deep precedent",
      "No state income tax on income earned outside Delaware",
      "Members and managers not on public record"
    ],
    "govtFees": {
      "formation": 160,
      "annual": 300,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual franchise tax, $300 minimum for LLCs. Corporations calculated on authorised shares.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "None on out-of-state income",
    "anonymousLLC": true,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 459
  },
  {
    "code": "NM",
    "name": "New Mexico",
    "popularityRank": 3,
    "tag": "No annual fee",
    "tagline": "No annual report, ever",
    "snippet": "File once and it stays active. The only state with no annual filing at all.",
    "bestFor": "Passive holding entities, long-term dormant structures, IP holding",
    "keyPoints": [
      "$50 state fee — joint cheapest",
      "No annual report ever required",
      "No recurring state fee at all",
      "Members not disclosed publicly"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 0,
      "annualFrequency": "none",
      "currency": "USD",
      "annualNote": "No annual report or fee required for LLCs at any point.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–6 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.9% top rate on NM-sourced income",
    "anonymousLLC": true,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "FL",
    "name": "Florida",
    "popularityRank": 4,
    "tag": "Popular",
    "tagline": "No personal income tax",
    "snippet": "Fast processing and no state income tax. Strong for real estate and consumer businesses.",
    "bestFor": "Real estate holdings, consumer businesses, LatAm-connected founders",
    "keyPoints": [
      "$125 state fee",
      "No personal state income tax",
      "Strong real estate framework",
      "$138.75 annual report, strictly enforced"
    ],
    "govtFees": {
      "formation": 125,
      "annual": 138.75,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due 1 May. $400 penalty if filed late — this is strictly enforced.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–6 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 424
  },
  {
    "code": "TX",
    "name": "Texas",
    "popularityRank": 5,
    "tag": null,
    "tagline": "Big market, no income tax",
    "snippet": "Second-largest US economy. Franchise tax only kicks in above ~$2.47M revenue.",
    "bestFor": "Operating businesses, energy, logistics, larger ventures",
    "keyPoints": [
      "$310 state fee",
      "No personal state income tax",
      "Franchise tax only above ~$2.47M revenue",
      "Second-largest state economy"
    ],
    "govtFees": {
      "formation": 310,
      "annual": 0,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Franchise tax report required annually. No tax payable below the revenue threshold.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "Franchise tax above threshold",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 609
  },
  {
    "code": "NV",
    "name": "Nevada",
    "popularityRank": 6,
    "tag": null,
    "tagline": "Privacy focused",
    "snippet": "Strong privacy statutes and no income tax, though the annual licence keeps costs higher.",
    "bestFor": "Privacy-sensitive structures, asset protection",
    "keyPoints": [
      "$75 state fee",
      "No state income tax",
      "Strong statutory privacy",
      "$350 annual licence and list"
    ],
    "govtFees": {
      "formation": 75,
      "annual": 350,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Comprises $150 annual list plus $200 state business licence.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "None",
    "anonymousLLC": true,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 374
  },
  {
    "code": "CA",
    "name": "California",
    "popularityRank": 7,
    "tag": null,
    "tagline": "Silicon Valley access",
    "snippet": "Cheap to form, but $800 franchise tax applies every year regardless of revenue.",
    "bestFor": "Companies needing physical Silicon Valley presence",
    "keyPoints": [
      "$90 state fee",
      "$800 minimum franchise tax — even at zero revenue",
      "Largest US state economy",
      "Heaviest ongoing cost of any state"
    ],
    "govtFees": {
      "formation": 90,
      "annual": 800,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "$800 minimum franchise tax plus $20 Statement of Information. Payable even when dormant.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "7–12 days",
    "serviceFee": 299,
    "stateIncomeTax": "8.84% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 389
  },
  {
    "code": "NY",
    "name": "New York",
    "popularityRank": 8,
    "tag": null,
    "tagline": "Prestige, plus publication",
    "snippet": "Real financial-sector credibility. Budget $600–$1,600 extra for mandatory publication.",
    "bestFor": "Finance, fashion, media, businesses needing an NYC presence",
    "keyPoints": [
      "$275 state fee",
      "Publication adds $600–$1,600 one-time",
      "Financial-sector credibility",
      "Biennial filing, not annual"
    ],
    "govtFees": {
      "formation": 275,
      "annual": 9,
      "annualFrequency": "biennial",
      "currency": "USD",
      "annualNote": "$9 biennial statement. Publication cost is separate, one-time, and varies sharply by county.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "7–10 days",
    "serviceFee": 299,
    "stateIncomeTax": "6.5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 574
  },
  {
    "code": "KY",
    "name": "Kentucky",
    "popularityRank": 9,
    "tag": "Lowest state fee",
    "tagline": "Lowest state fee in the US",
    "snippet": "At $40 the cheapest legitimate route into a US company.",
    "bestFor": "Budget-conscious formations",
    "keyPoints": [
      "$40 state fee — lowest nationally",
      "$15 annual report",
      "Total first-year cost $339"
    ],
    "govtFees": {
      "formation": 40,
      "annual": 15,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 30 June.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 339
  },
  {
    "code": "OH",
    "name": "Ohio",
    "popularityRank": 10,
    "tag": null,
    "tagline": "No annual report",
    "snippet": "Low filing fee, no annual report for LLCs, central for logistics.",
    "bestFor": "Operating businesses, logistics, distribution",
    "keyPoints": [
      "$99 state fee",
      "No annual report for LLCs",
      "Central logistics position"
    ],
    "govtFees": {
      "formation": 99,
      "annual": 0,
      "annualFrequency": "none",
      "currency": "USD",
      "annualNote": "No annual report required for LLCs.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "Commercial Activity Tax above $150k",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 398
  },
  {
    "code": "MO",
    "name": "Missouri",
    "popularityRank": 11,
    "tag": null,
    "tagline": "No recurring fee",
    "snippet": "No annual report obligation, keeping long-term upkeep near zero.",
    "bestFor": "Cost-conscious operating businesses, holding entities",
    "keyPoints": [
      "$105 state fee",
      "No annual report for LLCs",
      "Central US location"
    ],
    "govtFees": {
      "formation": 105,
      "annual": 0,
      "annualFrequency": "none",
      "currency": "USD",
      "annualNote": "No annual report required for LLCs.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "3–6 days",
    "serviceFee": 299,
    "stateIncomeTax": "4% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 404
  },
  {
    "code": "AZ",
    "name": "Arizona",
    "popularityRank": 12,
    "tag": null,
    "tagline": "No annual report",
    "snippet": "Cheap to form with nothing due annually. Publication required in most counties.",
    "bestFor": "Small businesses, holding entities",
    "keyPoints": [
      "$50 state fee",
      "No annual report required",
      "Publication required in most counties"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 0,
      "annualFrequency": "none",
      "currency": "USD",
      "annualNote": "No annual report. Publication in an approved newspaper required within 60 days.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "4.9% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "CO",
    "name": "Colorado",
    "popularityRank": 13,
    "tag": null,
    "tagline": "Cheap and fast",
    "snippet": "$50 to form, $25 a year, with quick online processing and a strong tech scene.",
    "bestFor": "Tech startups, small businesses",
    "keyPoints": [
      "$50 formation fee",
      "$25 periodic report",
      "Fast online filing",
      "Growing tech ecosystem"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 25,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Periodic report due in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "3–5 days",
    "serviceFee": 299,
    "stateIncomeTax": "4.4% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "MI",
    "name": "Michigan",
    "popularityRank": 14,
    "tag": null,
    "tagline": "Low cost, simple upkeep",
    "snippet": "$50 to form and $25 a year — one of the most economical Midwest options.",
    "bestFor": "Manufacturing, operating businesses",
    "keyPoints": [
      "$50 formation fee",
      "$25 annual statement",
      "Manufacturing base"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 25,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual statement due 15 February.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "6% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "MS",
    "name": "Mississippi",
    "popularityRank": 15,
    "tag": null,
    "tagline": "Free annual report",
    "snippet": "Cheap to form, and the annual report costs nothing to file.",
    "bestFor": "Small operating businesses",
    "keyPoints": [
      "$50 formation fee",
      "Annual report free to file",
      "Low overall burden"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 0,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report required by 15 April but there is no filing fee.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "4–5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "UT",
    "name": "Utah",
    "popularityRank": 16,
    "tag": null,
    "tagline": "Low cost, fast-growing tech",
    "snippet": "Cheap to form and maintain, with the Silicon Slopes corridor nearby.",
    "bestFor": "Tech startups, small businesses",
    "keyPoints": [
      "$70 state fee",
      "$18 annual renewal",
      "Silicon Slopes tech corridor"
    ],
    "govtFees": {
      "formation": 70,
      "annual": 18,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual renewal due in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "3–6 days",
    "serviceFee": 299,
    "stateIncomeTax": "4.65% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 369
  },
  {
    "code": "MT",
    "name": "Montana",
    "popularityRank": 17,
    "tag": null,
    "tagline": "Low fees, no sales tax",
    "snippet": "Modest fees with no state sales tax at all.",
    "bestFor": "Holding entities, vehicle registration structures",
    "keyPoints": [
      "$70 state fee",
      "$20 annual report",
      "No state sales tax"
    ],
    "govtFees": {
      "formation": 70,
      "annual": 20,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 15 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "6.75% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 369
  },
  {
    "code": "IN",
    "name": "Indiana",
    "popularityRank": 18,
    "tag": null,
    "tagline": "Biennial reporting",
    "snippet": "Low filing fee and a report due only every second year.",
    "bestFor": "Manufacturing, small businesses",
    "keyPoints": [
      "$50 state fee",
      "$32 biennial report",
      "Low ongoing burden"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 32,
      "annualFrequency": "biennial",
      "currency": "USD",
      "annualNote": "Business entity report due every two years in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "4.9% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "IA",
    "name": "Iowa",
    "popularityRank": 19,
    "tag": null,
    "tagline": "Biennial reporting",
    "snippet": "Cheap to form with reporting required only every two years.",
    "bestFor": "Small businesses, agriculture",
    "keyPoints": [
      "$50 formation fee",
      "$30 biennial report",
      "Reduced filing frequency"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 30,
      "annualFrequency": "biennial",
      "currency": "USD",
      "annualNote": "Biennial report due in odd-numbered years by 1 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.5–7.1% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "SC",
    "name": "South Carolina",
    "popularityRank": 20,
    "tag": null,
    "tagline": "No annual report for LLCs",
    "snippet": "Most LLCs face no annual filing, keeping upkeep minimal.",
    "bestFor": "Manufacturing, logistics",
    "keyPoints": [
      "$110 formation fee",
      "No annual report for most LLCs",
      "Port access"
    ],
    "govtFees": {
      "formation": 110,
      "annual": 0,
      "annualFrequency": "none",
      "currency": "USD",
      "annualNote": "No annual report for LLCs unless taxed as a corporation.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 409
  },
  {
    "code": "GA",
    "name": "Georgia",
    "popularityRank": 21,
    "tag": null,
    "tagline": "Atlanta business hub",
    "snippet": "Reasonable fees with access to Atlanta's corporate and logistics ecosystem.",
    "bestFor": "Logistics, film, corporate services",
    "keyPoints": [
      "$100 formation fee",
      "$50 annual registration",
      "Atlanta corporate hub"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual registration due by 1 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.75% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "VA",
    "name": "Virginia",
    "popularityRank": 22,
    "tag": null,
    "tagline": "Government contracting base",
    "snippet": "Next to Washington DC and well-positioned for federal contract work.",
    "bestFor": "Government contracting, defence, technology",
    "keyPoints": [
      "$100 formation fee",
      "$50 annual registration",
      "Federal contracting access"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual registration fee due in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "6% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "NC",
    "name": "North Carolina",
    "popularityRank": 23,
    "tag": null,
    "tagline": "Research Triangle access",
    "snippet": "Lowest corporate tax in the nation at 2.5%, with a strong biotech cluster.",
    "bestFor": "Biotech, technology, research",
    "keyPoints": [
      "$125 formation fee",
      "$200 annual report",
      "Research Triangle cluster"
    ],
    "govtFees": {
      "formation": 125,
      "annual": 200,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 15 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "2.5% corporate — lowest in the nation",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 424
  },
  {
    "code": "WA",
    "name": "Washington",
    "popularityRank": 24,
    "tag": null,
    "tagline": "No income tax, B&O applies",
    "snippet": "No corporate income tax, but B&O tax hits gross receipts rather than profit.",
    "bestFor": "Technology, e-commerce",
    "keyPoints": [
      "$259 state fee",
      "No corporate income tax",
      "B&O tax on gross receipts",
      "Seattle tech ecosystem"
    ],
    "govtFees": {
      "formation": 259,
      "annual": 60,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "No income tax; B&O on gross receipts",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 558
  },
  {
    "code": "IL",
    "name": "Illinois",
    "popularityRank": 25,
    "tag": null,
    "tagline": "Chicago market access",
    "snippet": "Mid-range fees with access to the Chicago metropolitan market.",
    "bestFor": "Finance, logistics, professional services",
    "keyPoints": [
      "$150 formation fee",
      "$75 annual report",
      "Chicago market"
    ],
    "govtFees": {
      "formation": 150,
      "annual": 75,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due before the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "9.5% combined corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 449
  },
  {
    "code": "PA",
    "name": "Pennsylvania",
    "popularityRank": 26,
    "tag": null,
    "tagline": "Newly annual reporting",
    "snippet": "Switched from decennial to annual filing in 2025, though the fee is nominal.",
    "bestFor": "Manufacturing, professional services",
    "keyPoints": [
      "$125 formation fee",
      "$7 annual report (new from 2025)",
      "Large eastern market"
    ],
    "govtFees": {
      "formation": 125,
      "annual": 7,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report introduced 2025, replacing the former decennial filing.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "8.49% corporate, reducing annually",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 424
  },
  {
    "code": "NJ",
    "name": "New Jersey",
    "popularityRank": 27,
    "tag": null,
    "tagline": "Northeast corridor",
    "snippet": "New York proximity at meaningfully lower cost.",
    "bestFor": "Pharma, logistics, professional services",
    "keyPoints": [
      "$125 formation fee",
      "$75 annual report",
      "NYC proximity at lower cost"
    ],
    "govtFees": {
      "formation": 125,
      "annual": 75,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "9% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 424
  },
  {
    "code": "TN",
    "name": "Tennessee",
    "popularityRank": 28,
    "tag": null,
    "tagline": "Per-member fee structure",
    "snippet": "$50 per member with a $300 floor — cost rises as membership grows.",
    "bestFor": "Operating businesses with few members",
    "keyPoints": [
      "$300 minimum ($50 per member)",
      "Annual report also $300 minimum",
      "No personal income tax"
    ],
    "govtFees": {
      "formation": 300,
      "annual": 300,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "$50 per member, minimum $300, maximum $3,000. Due on the first day of the fourth month after fiscal year end.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "6.5% excise tax",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 599
  },
  {
    "code": "NH",
    "name": "New Hampshire",
    "popularityRank": 29,
    "tag": null,
    "tagline": "No sales or income tax",
    "snippet": "No state sales tax and no personal income tax on earned income.",
    "bestFor": "Retail, small businesses",
    "keyPoints": [
      "$100 formation fee",
      "$100 annual report",
      "No sales tax"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 100,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 1 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "7.5% business profits tax",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "OR",
    "name": "Oregon",
    "popularityRank": 30,
    "tag": null,
    "tagline": "No sales tax",
    "snippet": "No state sales tax, with matching $100 formation and annual fees.",
    "bestFor": "Retail, e-commerce, outdoor sector",
    "keyPoints": [
      "$100 formation fee",
      "$100 annual report",
      "No state sales tax"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 100,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due on the formation anniversary.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "6.6–7.6% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "OK",
    "name": "Oklahoma",
    "popularityRank": 31,
    "tag": null,
    "tagline": "Low annual certificate",
    "snippet": "Standard formation cost with a low $25 annual certificate.",
    "bestFor": "Energy, agriculture",
    "keyPoints": [
      "$100 formation fee",
      "$25 annual certificate",
      "Energy sector"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 25,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual certificate due on the formation anniversary.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "4% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "LA",
    "name": "Louisiana",
    "popularityRank": 32,
    "tag": null,
    "tagline": "Port and energy access",
    "snippet": "Standard fees with major port infrastructure and an established energy sector.",
    "bestFor": "Energy, shipping, logistics",
    "keyPoints": [
      "$100 formation fee",
      "$35 annual report",
      "Major port access"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 35,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due on the formation anniversary.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "7.5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "AR",
    "name": "Arkansas",
    "popularityRank": 33,
    "tag": null,
    "tagline": "Flat franchise tax",
    "snippet": "Cheap to form, but a flat $150 franchise tax applies regardless of revenue.",
    "bestFor": "Small businesses, agriculture",
    "keyPoints": [
      "$50 state fee",
      "$150 annual franchise tax",
      "Low entry cost"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 150,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual franchise tax due by 1 May.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.1% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "ID",
    "name": "Idaho",
    "popularityRank": 34,
    "tag": null,
    "tagline": "Free annual report",
    "snippet": "The annual report must be filed but costs nothing.",
    "bestFor": "Agriculture, technology, small businesses",
    "keyPoints": [
      "$100 formation fee",
      "Annual report free to file",
      "Fast-growing economy"
    ],
    "govtFees": {
      "formation": 100,
      "annual": 0,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report required in the anniversary month but free.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.8% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 399
  },
  {
    "code": "MN",
    "name": "Minnesota",
    "popularityRank": 35,
    "tag": null,
    "tagline": "Free annual renewal",
    "snippet": "Annual renewal is required but carries no fee at all.",
    "bestFor": "Healthcare, retail, manufacturing",
    "keyPoints": [
      "$135 state fee",
      "Annual renewal free to file",
      "Large corporate presence"
    ],
    "govtFees": {
      "formation": 135,
      "annual": 0,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual renewal required by 31 December but free to file.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "9.8% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 434
  },
  {
    "code": "WI",
    "name": "Wisconsin",
    "popularityRank": 36,
    "tag": null,
    "tagline": "Low annual fee",
    "snippet": "Moderate formation cost with just $25 due annually.",
    "bestFor": "Manufacturing, agriculture",
    "keyPoints": [
      "$130 formation fee",
      "$25 annual report",
      "Manufacturing base"
    ],
    "govtFees": {
      "formation": 130,
      "annual": 25,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due in the anniversary quarter.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–7 days",
    "serviceFee": 299,
    "stateIncomeTax": "7.9% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 429
  },
  {
    "code": "WV",
    "name": "West Virginia",
    "popularityRank": 37,
    "tag": null,
    "tagline": "Low annual fee",
    "snippet": "Standard formation cost with a low $25 annual report.",
    "bestFor": "Energy, small businesses",
    "keyPoints": [
      "$100 formation fee",
      "$25 annual report",
      "Energy sector"
    ],
    "govtFees": {
      "formation": 130,
      "annual": 25,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due between 1 January and 30 June.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "6.5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 429
  },
  {
    "code": "NE",
    "name": "Nebraska",
    "popularityRank": 38,
    "tag": null,
    "tagline": "Biennial, cheap renewal",
    "snippet": "$13 every two years is among the lowest recurring costs anywhere.",
    "bestFor": "Small businesses, agriculture",
    "keyPoints": [
      "$13 biennial report",
      "Publication requirement applies",
      "Low renewal cost"
    ],
    "govtFees": {
      "formation": 110,
      "annual": 13,
      "annualFrequency": "biennial",
      "currency": "USD",
      "annualNote": "Biennial report due in odd years. Newspaper publication required at formation.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "5.58–7.25% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 409
  },
  {
    "code": "KS",
    "name": "Kansas",
    "popularityRank": 39,
    "tag": null,
    "tagline": "Mid-range fees",
    "snippet": "Straightforward processing with moderate costs at both stages.",
    "bestFor": "Agriculture, aviation, logistics",
    "keyPoints": [
      "$165 state fee",
      "$50 annual report",
      "Aviation sector"
    ],
    "govtFees": {
      "formation": 165,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due on the 15th day of the fourth month after tax year end.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "4% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 464
  },
  {
    "code": "ND",
    "name": "North Dakota",
    "popularityRank": 40,
    "tag": null,
    "tagline": "Energy sector base",
    "snippet": "Standard fees in an economy anchored by energy and agriculture.",
    "bestFor": "Energy, agriculture",
    "keyPoints": [
      "$135 formation fee",
      "$50 annual report",
      "Energy sector"
    ],
    "govtFees": {
      "formation": 135,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 1 November.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "4.31% top corporate rate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 434
  },
  {
    "code": "SD",
    "name": "South Dakota",
    "popularityRank": 41,
    "tag": null,
    "tagline": "No corporate income tax",
    "snippet": "No corporate or personal income tax, with strong trust law.",
    "bestFor": "Financial services, agriculture, trusts",
    "keyPoints": [
      "No corporate income tax",
      "$150 formation fee",
      "$50 annual report",
      "Strong trust law"
    ],
    "govtFees": {
      "formation": 150,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due in the anniversary month.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "4–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "None",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 449
  },
  {
    "code": "VT",
    "name": "Vermont",
    "popularityRank": 42,
    "tag": null,
    "tagline": "Low annual report",
    "snippet": "Moderate formation cost with just $35 due annually.",
    "bestFor": "Agriculture, tourism, small businesses",
    "keyPoints": [
      "$125 formation fee",
      "$35 annual report",
      "Small business friendly"
    ],
    "govtFees": {
      "formation": 125,
      "annual": 35,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due within 3 months of fiscal year end.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "8.5% top corporate rate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 424
  },
  {
    "code": "ME",
    "name": "Maine",
    "popularityRank": 43,
    "tag": null,
    "tagline": "Higher fee structure",
    "snippet": "Above-average fees at both stages. Best with a genuine Maine connection.",
    "bestFor": "Tourism, fishing, small businesses",
    "keyPoints": [
      "$175 formation fee",
      "$85 annual report",
      "Tourism economy"
    ],
    "govtFees": {
      "formation": 175,
      "annual": 85,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 1 June.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "8.93% top corporate rate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 474
  },
  {
    "code": "RI",
    "name": "Rhode Island",
    "popularityRank": 44,
    "tag": null,
    "tagline": "Compact market",
    "snippet": "Standard fees in the smallest state, suited to local marine and coastal work.",
    "bestFor": "Small businesses, marine industries",
    "keyPoints": [
      "$150 formation fee",
      "$50 annual report",
      "Marine sector"
    ],
    "govtFees": {
      "formation": 150,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due between 1 February and 1 May.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "7% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 449
  },
  {
    "code": "CT",
    "name": "Connecticut",
    "popularityRank": 45,
    "tag": null,
    "tagline": "Financial services adjacent",
    "snippet": "New York proximity with somewhat lower operating costs.",
    "bestFor": "Financial services, insurance",
    "keyPoints": [
      "$120 formation fee",
      "$80 annual report",
      "Insurance and finance sector"
    ],
    "govtFees": {
      "formation": 120,
      "annual": 80,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due by 31 March.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–8 days",
    "serviceFee": 299,
    "stateIncomeTax": "7.5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 419
  },
  {
    "code": "HI",
    "name": "Hawaii",
    "popularityRank": 46,
    "tag": null,
    "tagline": "Low annual fee",
    "snippet": "Cheap to form and just $15 a year, though geography limits most models.",
    "bestFor": "Tourism, hospitality, small businesses",
    "keyPoints": [
      "$50 formation fee",
      "$15 annual report",
      "Tourism economy"
    ],
    "govtFees": {
      "formation": 50,
      "annual": 15,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due in the anniversary quarter.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–10 days",
    "serviceFee": 299,
    "stateIncomeTax": "4.4–6.4% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 349
  },
  {
    "code": "MD",
    "name": "Maryland",
    "popularityRank": 47,
    "tag": null,
    "tagline": "High filing fee",
    "snippet": "Expensive at both stages. Chosen mainly for genuine DC proximity.",
    "bestFor": "Government-adjacent services, biotech",
    "keyPoints": [
      "$450 state fee",
      "$300 annual report",
      "DC proximity"
    ],
    "govtFees": {
      "formation": 450,
      "annual": 300,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report and personal property return due 15 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "8.25% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 749
  },
  {
    "code": "MA",
    "name": "Massachusetts",
    "popularityRank": 48,
    "tag": null,
    "tagline": "Highest fees, best talent",
    "snippet": "The most expensive state, offset by Boston's biotech and academic ecosystem.",
    "bestFor": "Biotech, deep tech, academic spinouts",
    "keyPoints": [
      "$500 state fee — highest nationally",
      "$500 annual report",
      "Boston biotech and academic cluster"
    ],
    "govtFees": {
      "formation": 500,
      "annual": 500,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Annual report due on the formation anniversary.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "8% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 799
  },
  {
    "code": "AL",
    "name": "Alabama",
    "popularityRank": 49,
    "tag": null,
    "tagline": "Privilege tax applies",
    "snippet": "Standard formation with an annual privilege tax based on net worth.",
    "bestFor": "Small operating businesses",
    "keyPoints": [
      "$180 state fee",
      "$50 minimum privilege tax",
      "Manufacturing base"
    ],
    "govtFees": {
      "formation": 180,
      "annual": 50,
      "annualFrequency": "annual",
      "currency": "USD",
      "annualNote": "Business Privilege Tax, $50 minimum, based on net worth.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "6.5% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 479
  },
  {
    "code": "AK",
    "name": "Alaska",
    "popularityRank": 50,
    "tag": null,
    "tagline": "No sales or income tax",
    "snippet": "No state sales or income tax, with biennial rather than annual reporting.",
    "bestFor": "Resource extraction, fishing, tourism",
    "keyPoints": [
      "$250 state fee",
      "No state sales or income tax",
      "$100 biennial report"
    ],
    "govtFees": {
      "formation": 250,
      "annual": 100,
      "annualFrequency": "biennial",
      "currency": "USD",
      "annualNote": "Biennial report due by 2 January in alternating years.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–10 days",
    "serviceFee": 299,
    "stateIncomeTax": "0–9.4% graduated corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 549
  },
  {
    "code": "DC",
    "name": "District of Columbia",
    "popularityRank": 51,
    "tag": null,
    "tagline": "Federal proximity",
    "snippet": "Not a state, but available. Positioned for government-adjacent work.",
    "bestFor": "Government relations, associations, consultancies",
    "keyPoints": [
      "$220 filing fee",
      "$300 biennial report",
      "Federal proximity"
    ],
    "govtFees": {
      "formation": 220,
      "annual": 300,
      "annualFrequency": "biennial",
      "currency": "USD",
      "annualNote": "Biennial report due by 1 April.",
      "verified": true,
      "source": "CompanyVista official rate card"
    },
    "timeline": "5–9 days",
    "serviceFee": 299,
    "stateIncomeTax": "8.25% corporate",
    "anonymousLLC": false,
    "entityTypes": [
      "LLC",
      "C-CORP",
      "S-CORP",
      "NONPROFIT"
    ],
    "packageIncludes": [
      "Name availability check",
      "Registered Address (1 year)",
      "Registered Agent (1 year)",
      "EIN application",
      "Bank account assistance"
    ],
    "totalFirstYear": 519
  }
];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Image source={logoR} style={styles.topLogo} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={styles.mainTitle}>
            Where would you like to{'\n'}
            <Text style={styles.italicTitle}>register?</Text>
          </Text>

          <Text style={styles.subtitle}>
            Most founders choose the United States for global credibility and banking access.
          </Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#475569" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 50+ countries..."
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#475569" />
              </TouchableOpacity>
            )}
          </View>

          {/* Popular Countries - Vertical List */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>{selectedCountry ? 'SELECTED COUNTRY' : searchQuery.trim() ? `SEARCH RESULTS (${filteredCountries.length})` : 'MOST POPULAR'}</Text>
            {selectedCountry && (
              <TouchableOpacity onPress={() => { setSelectedCountry(null); setSelectedState(null); }}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredCountries.length === 0 ? (
            <Text style={{ color: '#64748B', fontSize: 12, paddingVertical: 12, marginBottom: 20 }}>No countries found for "{searchQuery}"</Text>
          ) : (
            <View style={[styles.countryList, { marginBottom: 20 }]}>
              {filteredCountries.map((item) => {
                const isSelected = selectedCountry === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.countryCardList, isSelected && styles.countryCardSelected]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedCountry(null);
                        setSelectedState(null);
                      } else {
                        setSelectedCountry(item.id);
                        setSelectedState(null);
                      }
                    }}
                  >
                    <View style={styles.countryLeft}>
                      <View style={styles.countryCodeCircle}>
                        <Text style={styles.countryCodeTextList}>{item.code}</Text>
                      </View>
                      <View>
                        <Text style={[styles.countryNameList, isSelected && styles.goldText]}>{item.name}</Text>
                        <Text style={styles.countryPriceList}>{item.price}</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <View style={styles.checkmarkBadgeList}>
                        <Ionicons name="checkmark" size={12} color="#060913" />
                      </View>
                    ) : (
                      <View style={styles.radioOuter} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* US States - sirf country select hone par dikhao */}
          {selectedCountry && (
            <>
              <View style={styles.stateHeaderRow}>
                <Ionicons name="chevron-down" size={14} color="#475569" />
                <Text style={styles.sectionHeader}>  {selectedCountry === 'US' ? 'SELECT US STATE' : `SELECT STATE / REGION - ${selectedCountry}`}</Text>
              </View>

              {selectedCountry === 'US' ? (
                <View style={styles.stateGrid}>
                  {usStates.map((state) => {
                    const stateId = state.code || state.id;
                    const isSelected = selectedState === stateId;
                    const isGreenTag = state.popularityRank === 1 || state.tag === 'Top pick' || state.tag === 'Lowest cost' || state.tag === 'No annual fee';
                    const desc = state.snippet || state.desc || state.tagline || '';
                    const price = state.govtFees?.formation != null ? `$${state.govtFees.formation}` : state.serviceFee ? `$${state.serviceFee}` : state.price;
                    const duration = state.timeline || state.duration;
                    return (
                      <TouchableOpacity
                        key={stateId}
                        style={[styles.stateCard, isSelected && styles.stateCardSelected]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedState(stateId)}
                      >
                        <View style={styles.stateTitleRow}>
                          <Text style={styles.stateName}>{state.name}</Text>
                          {state.tag && (
                            <View style={[styles.tagBadge, isGreenTag ? styles.greenTag : styles.blueTag]}>
                              <Text style={[styles.tagText, isGreenTag ? styles.greenTagText : styles.blueTagText]}>
                                {state.tag}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.stateDesc} numberOfLines={3}>{desc}</Text>
                        <View style={styles.stateFooterRow}>
                          <Text style={styles.statePrice}>{price}</Text>
                          <Text style={styles.stateDuration}>{duration}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noStateBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                  <Text style={styles.noStateText}>No state selection needed for {allCountries.find(c => c.id === selectedCountry)?.name}. Continue directly.</Text>
                </View>
              )}
            </>
          )}

        </Animated.View>
      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedCountry && styles.continueBtnDisabled, selectedCountry === 'US' && !selectedState && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          disabled={!selectedCountry || (selectedCountry === 'US' && !selectedState)}
          onPress={() => {
            const stateName = usStates.find(s => (s.code||s.id) === selectedState)?.name || selectedState;
            navigation.navigate('CompanyNaming', { selectedState: stateName || (selectedCountry !== 'US' ? selectedCountry : null), selectedCountry });
          }}
        >
          <Text style={[styles.continueBtnText, (!selectedCountry || (selectedCountry === 'US' && !selectedState)) && styles.continueBtnTextDisabled]}>
            {!selectedCountry ? 'Select a country to continue' : selectedCountry === 'US' && !selectedState ? 'Select a state to continue' : `Continue with ${usStates.find(s => (s.code||s.id) === selectedState)?.name || selectedState || allCountries.find(c=>c.id===selectedCountry)?.name}  →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CountrySelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060913' },
  progressContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, gap: 8 },
  progressStep: { flex: 1, height: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
  progressActive: { backgroundColor: '#C9A84C' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 90 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 34 },
  topLogo: { width: 150, height: 38, resizeMode: 'contain', marginTop: 10 },
  mainTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', lineHeight: 28, marginBottom: 8, marginTop: 6 },
  italicTitle: { color: '#C9A84C', fontStyle: 'italic', fontFamily: 'serif' },
  subtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14, height: 46, marginBottom: 24,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 13, marginLeft: 10 },
  sectionHeader: { color: '#475569', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  changeText: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
  noStateBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10 },
  noStateText: { color: '#64748B', fontSize: 11, flex: 1, lineHeight: 16 },
  stateHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  countryGrid: { flexDirection: 'row', gap: 10, paddingRight: 16 },
  countryCard: {
    width: 110, backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', position: 'relative',
  },
  countryCardSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.04)' },
  checkmarkBadge: {
    position: 'absolute', top: 8, right: 8, width: 16, height: 16,
    borderRadius: 8, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center',
  },
  countryCodeText: { color: '#CBD5E1', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  countryName: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  goldText: { color: '#C9A84C' },
  countryPrice: { color: '#64748B', fontSize: 9, marginTop: 2 },
  countryList: { flexDirection: 'column', gap: 8 },
  countryCardList: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  countryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countryCodeCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', alignItems: 'center', justifyContent: 'center' },
  countryCodeTextList: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  countryNameList: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  countryPriceList: { color: '#64748B', fontSize: 11, marginTop: 2 },
  checkmarkBadgeList: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  stateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stateCard: {
    width: '48.5%', backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14, padding: 12, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 10,
    justifyContent: 'space-between', minHeight: 110,
  },
  stateCardSelected: { borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.03)' },
  stateTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  stateName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  tagBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  greenTag: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  greenTagText: { color: '#10B981' },
  blueTag: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  blueTagText: { color: '#60A5FA' },
  tagText: { fontSize: 8, fontWeight: '600' },
  stateDesc: { color: '#64748B', fontSize: 9.5, lineHeight: 13, marginBottom: 10 },
  stateFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statePrice: { color: '#C9A84C', fontSize: 11, fontWeight: 'bold' },
  stateDuration: { color: '#475569', fontSize: 9 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#060913', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueBtn: { backgroundColor: '#D4AF37', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: 'rgba(212,175,55,0.3)' },
  continueBtnText: { color: '#060913', fontSize: 14, fontWeight: 'bold' },
  continueBtnTextDisabled: { color: 'rgba(6,9,19,0.5)' },
});
