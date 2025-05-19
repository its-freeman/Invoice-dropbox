// src/utils/pricingTools.js

/**
 * Generates a pricing matrix from 1mm to 1200mm girths using a linear gradient
 * between priceAt100 and priceAt1200, applied across all folds.
 *
 * @param {number} priceAt100 - The base price at 100mm girth.
 * @param {number} priceAt1200 - The base price at 1200mm girth.
 * @param {number[]} folds - Array of fold counts to apply the base price to.
 * @returns {Object} A nested rates object structured as girth -> fold -> price.
 */
export function spanGirthPricesToMax(endPrice, maxGirth = 1200, folds = []) {
  const rates = {};
  for (let girth = 1; girth <= maxGirth; girth++) {
    const ratio = (girth - 1) / (maxGirth - 1);
    const basePrice = +(endPrice * ratio).toFixed(2);

    rates[girth] = {};
    folds.forEach((fold) => {
      rates[girth][fold] = basePrice;
    });
  }
  return rates;
}


/**
 * Applies a per-fold multiplier to an existing rates matrix.
 * Assumes that the rate for 1 fold is the base rate.
 *
 * @param {Object} existingRates - Existing rates matrix (girth -> fold -> base price).
 * @param {number} foldPrice - Price per additional fold (after first).
 * @param {number[]} folds - Array of fold counts to apply.
 * @returns {Object} A modified rates matrix with fold multipliers applied.
 */
export function applyFoldMultipliers(existingRates, foldPrice, folds = []) {
  const newRates = {};

  Object.entries(existingRates).forEach(([girthStr, foldMap]) => {
    const girth = parseInt(girthStr, 10);
    const base = foldMap[0]; // Use 0-fold (FLAT) as the base

    newRates[girth] = {};

    folds.forEach((fold) => {
      if (fold === 0) {
        newRates[girth][0] = base; // Preserve the flat base
      } else {
        const total = base + fold * foldPrice;
        newRates[girth][fold] = +total.toFixed(2);
      }
    });
  });

  return newRates;
}



