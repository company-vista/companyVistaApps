// Centralized price calculation - dono routes alag condition se
// ADVISOR ROUTE: BestMatches -> (USStateFlow) -> BestStatesForYou -> CompanyNaming -> Structure -> WhatsIncluded -> OptionalAddOns -> FounderDetails -> Review
// DIRECT ROUTE: RegisterJurisdiction -> ... -> CompanyNaming -> Structure -> WhatsIncluded -> OptionalAddOns -> FounderDetails -> Review
// advisorFlow === true ho to sirf advisor price (bestStatePrice / bestCountryPrice) use hoga, warna direct price (selectedCountryPrice + selectedStatePrice + structure)

export const STRUCTURE_PRICE_MAP = { LLC: 299, 'C-Corp': 399, 'S-Corp': 299 };

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
  // non-US priced advisor (UK/HK/CA etc): country price direct
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
