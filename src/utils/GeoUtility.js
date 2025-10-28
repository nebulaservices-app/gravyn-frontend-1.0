// GeoUtility.js
import { DateTime } from "luxon";

const FLAG_CDN_BASE = "https://flagcdn.com/";

const geoDataMap = {
  US: { currencyCode: "USD", currencyName: "US Dollar", timezone: "America/New_York", locale: "en-US" },
  IN: { currencyCode: "INR", currencyName: "Indian Rupee", timezone: "Asia/Kolkata", locale: "en-IN" },
  GB: { currencyCode: "GBP", currencyName: "British Pound", timezone: "Europe/London", locale: "en-GB" },
  AU: { currencyCode: "AUD", currencyName: "Australian Dollar", timezone: "Australia/Sydney", locale: "en-AU" },
  JP: { currencyCode: "JPY", currencyName: "Japanese Yen", timezone: "Asia/Tokyo", locale: "ja-JP" },
  AE: { currencyCode: "AED", currencyName: "United Arab Emirates Dirham", timezone: "Asia/Dubai", locale: "en-AE" },
  EU: { currencyCode: "EUR", currencyName: "Euro", timezone: "Europe/Brussels", locale: "en-IE" }, // EU aggregate
  CA: { currencyCode: "CAD", currencyName: "Canadian Dollar", timezone: "America/Toronto", locale: "en-CA" },
  // You can add more countries as needed here
};

export function getFlagUrl(countryCode) {
  return `${FLAG_CDN_BASE}${countryCode.toLowerCase()}.svg`;
}

export function getCurrencyInfo(countryCode) {
  const info = geoDataMap[countryCode.toUpperCase()];
  if (!info) return null;
  return { currencyCode: info.currencyCode, currencyName: info.currencyName };
}

export function getTimezone(countryCode) {
  const info = geoDataMap[countryCode.toUpperCase()];
  return info ? info.timezone : null;
}

export function formatDateInTimezone(utcISODate, timeZone, opts = {}) {
  const defaultOpts = {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  };
  const options = { ...defaultOpts, ...opts };
  return DateTime.fromISO(utcISODate, { zone: "utc" })
    .setZone(timeZone)
    .toLocaleString(options);
}

export function calculateBudgetUsage(budgetTotal, amountUsed) {
  if (budgetTotal <= 0) return 0;
  return +((amountUsed / budgetTotal) * 100).toFixed(2);
}

export function calculateDuration(startISO, endISO, timeZone = "utc") {
  const start = DateTime.fromISO(startISO, { zone: timeZone });
  const end = DateTime.fromISO(endISO, { zone: timeZone });
  const diff = end.diff(start, ["days", "hours", "minutes"]).toObject();
  return {
    days: Math.floor(diff.days),
    hours: Math.floor(diff.hours),
    minutes: Math.floor(diff.minutes),
  };
}

export function convertTimeZone(timeStr, fromZone, toZone) {
  return DateTime.fromISO(timeStr, { zone: fromZone }).setZone(toZone).toISO();
}

export function getAvailableCountryCodes() {
  return Object.keys(geoDataMap);
}

export function getAllGeoData() {
  return Object.entries(geoDataMap).map(([countryCode, info]) => ({
    countryCode,
    flagUrl: getFlagUrl(countryCode),
    currencyCode: info.currencyCode,
    currencyName: info.currencyName,
    timezone: info.timezone,
    locale: info.locale,
  }));
}

/**
 * Format numeric string or number to locale form by country code
 * @param {string|number} value
 * @param {string} countryCode
 * @returns {string} formatted number with commas as per locale
 */
export function formatNumberForCountry(value, countryCode) {
  if (value === undefined || value === null) return "";
  const info = geoDataMap[countryCode.toUpperCase()];
  const locale = info?.locale || "en-US";

  let numericVal = value.toString().replace(/[, ]+/g, "");

  if (isNaN(numericVal)) return "";

  const number = Number(numericVal);

  // Use Intl.NumberFormat with locale; India uses lakhs, others million
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(number);
}

/**
 * Parse locale formatted string number back to number
 * Supports Indian lakhs formatting as well
 * @param {string} formattedNumber
 * @param {string} countryCode
 * @returns {number}
 */
export function parseLocaleNumber(formattedNumber, countryCode) {
  if (!formattedNumber) return 0;
  const info = geoDataMap[countryCode.toUpperCase()];
  const locale = info?.locale || "en-US";

  try {
    // Remove all non-numeric except . and -
    const cleaned = formattedNumber.replace(/[^0-9.-]+/g, "");
    const value = Number(cleaned);
    if (isNaN(value)) return 0;
    return value;
  } catch {
    return 0;
  }
}

/**
 * Returns all unique timezones in geoDataMap
 * @returns {string[]}
 */
export function getAllTimezones() {
  const tzSet = new Set();
  Object.values(geoDataMap).forEach(({ timezone }) => tzSet.add(timezone));
  return Array.from(tzSet);
}
