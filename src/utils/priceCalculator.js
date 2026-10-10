// Centralized price calculation - dono routes alag condition se
// ADVISOR ROUTE: BestMatches -> (USStateFlow) -> BestStatesForYou -> CompanyNaming -> Structure -> WhatsIncluded -> OptionalAddOns -> FounderDetails -> Review
// DIRECT ROUTE: RegisterJurisdiction -> ... -> CompanyNaming -> Structure -> WhatsIncluded -> OptionalAddOns -> FounderDetails -> Review
// advisorFlow === true ho to sirf advisor price (bestStatePrice / bestCountryPrice) use hoga, warna direct price (selectedCountryPrice + selectedStatePrice + structure)
import { COUNTRIES, getCountryPrice } from '../constants/countries';

export const STRUCTURE_PRICE_MAP = { LLC: 299, 'C-Corp': 399, 'S-Corp': 399, Nonprofit: 399 };

export function getStructurePrice(selectedStructure, fallback) {
  if (fallback != null) return Number(fallback);
  return STRUCTURE_PRICE_MAP[selectedStructure] ?? 299;
}

// ---- ADVISOR ROUTE calculation ----
export function getAdvisorBasePrice(params, structurePrice) {
  const p = params || {};
  const advisorStatePrice = Number(p.bestStatePrice ?? 0);
  const advisorCountryPrice = Number(p.bestCountryPrice ?? p.selectedCountryPrice ?? 0);
  const hasAdvisorPrice = advisorStatePrice > 0 || advisorCountryPrice > 0;
  if (!p.advisorFlow || !hasAdvisorPrice) return null; // not advisor route
  // USA advisor: bestStatePrice already includes 299+govFee, C-Corp ka +100 delta add karo
  if (advisorStatePrice > 0) {
    const delta = (Number(structurePrice) || 299) - 299;
    return advisorStatePrice + (delta > 0 ? delta : 0);
  }
  // non-US priced advisor (UK/SG/EE/AE etc): country price direct
  return advisorCountryPrice;
}

// ---- DIRECT ROUTE calculation ----
export function getDirectBasePrice(params, structurePrice) {
  const p = params || {};
  const countryPrice = Number(p.selectedCountryPrice ?? 0);
  const stateFee = Number(p.selectedStatePrice ?? p.bestStateGovFee ?? 0);
  const struct = Number(structurePrice ?? 299);
  const isUS = (p.selectedCountry || p.bestCountry) === 'US' || p.selectedCountry === 'US' || !!p.bestState;
  // direct US: country + stateFee + structure ; direct non-US: country only
  // Note: direct US me countryPrice usually 0, stateFee + struct hi main hai
  if (isUS) {
    return countryPrice + stateFee + struct;
  }
  return countryPrice;
}

// Unified: pehle advisor check, fir direct
export function getBasePrice(params, structurePrice) {
  const advisor = getAdvisorBasePrice(params, structurePrice);
  if (advisor !== null) return advisor;
  return getDirectBasePrice(params, structurePrice);
}

export function hasPrice(params) {
  const p = params || {};
  return Number(p.selectedCountryPrice || p.bestCountryPrice || p.bestStatePrice || p.selectedStatePrice || p.selectedStructurePrice || 0) > 0;
}

// Jurisdictions jinka package price define hai — registry config (src/constants/countries.js)
// ke fixed-price countries se sourced (single source of truth, packageFee se derive hota hai).
// Baaki sab custom-quote ('quoted') rahenge.
export const PRICED_COUNTRY_PRICE = COUNTRIES.reduce((map, c) => {
  if (c.pricingModel === 'fixed' && c.packageFee) {
    map[c.code] = Number(c.packageFee);
  }
  return map;
}, {});

export function getPricedCountryPrice(countryCode) {
  const code = String(countryCode || '').toUpperCase();
  if (PRICED_COUNTRY_PRICE[code] != null) return Number(PRICED_COUNTRY_PRICE[code]);
  // Registry ka packageFee fallback — naya fixed-price country bina map update add ho jaye
  return getCountryPrice(code);
}

// Kya is params set me koi REAL price hai? Structure price jaan-boojh kar
// shamil nahi kiya — wo default 299 rehta hai aur custom-quote country ko bhi
// 'fixed' bana deta tha. Sirf wo fields jo user ne country/state se aaye.
export function hasRealPrice(params) {
  const p = params || {};
  return (
    Number(p.selectedCountryPrice ?? 0) > 0 ||
    Number(p.bestCountryPrice ?? 0) > 0 ||
    Number(p.selectedStatePrice ?? 0) > 0 ||
    Number(p.bestStatePrice ?? 0) > 0 ||
    Number(p.runningTotal ?? 0) > 0 ||
    Number(p.combinedTotal ?? 0) > 0 ||
    Number(p.totalAmount ?? 0) > 0
  );
}

// Backend sirf USA ko 'fixed' maanta hai (computeOrderTotal me selectedCountry
// === 'US' check). GB/SG/EE/AE jaise priced jurisdictions ko wo 'quoted' + total 0
// bhej deta hai — chahe frontend ne structure/state price bhar di ho.
//
// Isliye pricingType frontend se resolve karo: koi real price hai -> 'fixed',
// warna backend ka value (custom quote -> 'quoted').
export function resolvePricingType(params, backendPricingType) {
  if (hasRealPrice(params)) return 'fixed';
  const t = String(backendPricingType || '').toLowerCase();
  return t || 'quoted';
}
