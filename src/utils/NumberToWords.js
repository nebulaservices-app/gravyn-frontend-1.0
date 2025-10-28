// numberToWordsUtils.js

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const scalesWest = ["", "thousand", "million", "billion", "trillion"];
const scalesIndia = ["", "thousand", "lakh", "crore"];


function convertTwoDigits(num) {
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
}


function convertThreeDigits(num) {
  let word = "";
  if (num > 99) {
    word += ones[Math.floor(num / 100)] + " hundred ";
    num %= 100;
  }
  if (num > 0) {
    word += convertTwoDigits(num);
  }
  return word.trim();
}


function numberToWordsWestern(num) {
  if (num === 0) return "zero";
  let words = [];
  let scaleIndex = 0;

  while (num > 0) {
    let chunk = num % 1000;
    if (chunk > 0) {
      words.unshift(convertThreeDigits(chunk) + (scalesWest[scaleIndex] ? " " + scalesWest[scaleIndex] : ""));
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  return words.join(", ");
}


function numberToWordsIndian(num) {
  if (num === 0) return "zero";
  let words = [];
  // Handle last 3 digits first (hundred place)
  let lastThree = num % 1000;
  if (lastThree > 0) words.unshift(convertThreeDigits(lastThree));
  num = Math.floor(num / 1000);

  let scaleIndex = 1;
  while (num > 0) {
    let chunk = num % 100;
    if (chunk > 0) {
      words.unshift(convertTwoDigits(chunk) + " " + scalesIndia[scaleIndex]);
    }
    num = Math.floor(num / 100);
    scaleIndex++;
  }
  return words.join(" ").trim();
}

const fractionalUnits = {
  INR: "paise",
  USD: "cents",
  GBP: "pence",
  EUR: "cents",
  AUD: "cents",
  CAD: "cents",
  // add other currency fractional units as needed
};

/**
 * Format amount to words with currency code
 * Handles integer and two-digit fractional parts
 * @param {string|number} amount - e.g. "945.90", "2,50,000"
 * @param {string} currencyCode - e.g. "INR", "USD"
 * @returns {string} Number in words with fractional units and currency code
 */
export function formatAmountToWords(amount, currencyCode) {
  // Remove commas and spaces, convert to string
  const numStr = amount.toString().replace(/[, ]/g, "");
  const [intPartStr, fracPartStr] = numStr.split(".");

  const intPart = parseInt(intPartStr, 10) || 0;
  const fracPart = fracPartStr ? parseInt(fracPartStr.slice(0, 2).padEnd(2, "0"), 10) : 0;

  let words = "";
  if (currencyCode === "INR") {
    words = numberToWordsIndian(intPart);
  } else {
    words = numberToWordsWestern(intPart);
  }

  if (fracPart > 0) {
    const fracWords = convertTwoDigits(fracPart);
    const fracUnit = fractionalUnits[currencyCode] || "cents";
    words += ` and ${fracWords} ${fracUnit}`;
  }

  return words + " ";
}
