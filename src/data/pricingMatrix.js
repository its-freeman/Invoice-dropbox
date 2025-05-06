const pricingMatrix = {
    "Euramax": {
      baseRateMultiplier: 1,
      folds: [1, 2, 3],
      rates: {
        "100": { "1": 10, "2": 11, "3": 12 },
        "200": { "1": 11, "2": 12, "3": 13 },
        "300": { "1": 12, "2": 13, "3": 14 },
      },
    },
    "Colorsteel": {
      baseRateMultiplier: 1,
      folds: [1, 2, 3],
      rates: {
        "100": { "1": 9, "2": 10, "3": 11 },
        "200": { "1": 10, "2": 11, "3": 12 },
        "300": { "1": 11, "2": 12, "3": 13 },
      },
    },
  };
  
  export default pricingMatrix;
  