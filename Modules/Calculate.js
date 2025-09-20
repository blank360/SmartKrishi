// ✅ Calculate pH health score (ideal range: 6 - 7.5)
export const calculatePH = (ph) => {
  if (!ph) return 0;
  if (ph < 4 || ph > 9) return 0; // Extremely bad
  if (ph >= 6 && ph <= 7.5) return 100; // Perfect
  // Linearly scale outside the perfect range
  return ph < 6
    ? ((ph - 4) / 2) * 50 // scale 4-6 to 0-50
    : ((9 - ph) / 1.5) * 50; // scale 7.5-9 to 50-0
};

// ✅ Calculate SOC health score (0-20 g/kg typical range)
export const calculateSOC = (soc) => {
  if (!soc) return 0;
  const capped = Math.min(soc, 20); // 20 g/kg is very good
  return (capped / 20) * 100;
};


// ✅ Calculate Bulk Density (bdod) Score (lower = better)
export const calculateBDOD = (bdod) => {
  if (!bdod) return 0;
  // Ideal BDOD ~ 1200 - 1400 kg/m³
  if (bdod >= 1200 && bdod <= 1400) return 100;
  const diff = Math.abs(bdod - 1300);
  return Math.max(0, 100 - (diff / 400) * 100); // Normalize deviation
};
