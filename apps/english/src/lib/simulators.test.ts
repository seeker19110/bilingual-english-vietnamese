// apps/english/src/lib/simulators.test.ts — Unit tests for the 10 real-life simulation models
import { describe, it, expect } from 'vitest'
import {
  calculateProfitOptimization,
  calculateCompoundInterest,
  calculateLoanAmortization,
  calculateEvnElectricityBill,
  calculateGpsRelativity,
  calculateBrakingDistance,
  calculateAlcoholDilution,
  getPhComparison,
  calculateTdeeAndMacro,
  predictOffspringBloodTypes,
  COMMON_PH_ITEMS,
} from './simulators'

describe('Applied Real-Life Simulators Engine', () => {
  // 1. Profit Optimization
  it('calculates optimal price and maximum profit accurately', () => {
    const res = calculateProfitOptimization(
      1000000, // fixed cost: 1M VND
      50000, // unit cost: 50k VND
      500, // base demand: 500 units
      0.002, // elasticity: -2 units per 1,000 VND increase
      20000,
      300000,
    )
    expect(res.optimalPrice).toBe(175000)
    expect(res.unitsSold).toBe(250)
    expect(res.maxProfit).toBe(30250000)
    expect(res.totalRevenue).toBe(res.optimalPrice * res.unitsSold)
  })

  // 2. Compound Interest
  it('calculates multi-year compound interest and inflation adjustment', () => {
    const res = calculateCompoundInterest(10000000, 2000000, 10, 4, 5)
    expect(res.yearlyData.length).toBe(5)
    expect(res.totalWealth).toBeGreaterThan(res.totalContributed)
    expect(res.realWealth).toBeLessThan(res.totalWealth)
    expect(res.totalInterest).toBe(res.totalWealth - res.totalContributed)
  })

  // 3. Loan Amortization
  it('calculates monthly mortgage payment with reducing balance', () => {
    const res = calculateLoanAmortization(1000000000, 9, 20) // 1 billion VND at 9% for 20 years
    expect(res.monthlyPayment).toBeGreaterThan(0)
    expect(res.totalPayment).toBeGreaterThan(1000000000)
    expect(res.totalInterestPaid).toBe(res.totalPayment - 1000000000)
    expect(res.firstMonthInterest).toBe(7500000) // 1B * (9% / 12) = 7.5M
  })

  // 4. EVN Electricity Bill
  it('computes 6-tier progressive electricity bill correctly', () => {
    const res = calculateEvnElectricityBill(8, 26, 30, 8, 50)
    expect(res.totalKwh).toBeGreaterThan(0)
    expect(res.tierBreakdown.length).toBeGreaterThan(0)
    expect(res.vat).toBe(Math.round(res.subtotal * 0.08))
    expect(res.totalBill).toBe(res.subtotal + res.vat)
    expect(res.acSavingPotentialKwh).toBeGreaterThanOrEqual(0)
  })

  // 5. GPS Relativity
  it('calculates special and general relativistic time dilation drift for GPS', () => {
    const res = calculateGpsRelativity(3)
    expect(res.srDilationUs).toBe(-21.6)
    expect(res.grDilationUs).toBe(137.4)
    expect(res.netDilationUs).toBe(115.8)
    expect(res.positionDriftKm).toBe(34.74)
  })

  // 6. Braking Distance
  it('computes reaction distance and physics braking distance based on friction', () => {
    const res = calculateBrakingDistance(60, 1.0, 0.7, 1500)
    expect(res.speedMps).toBe(16.7)
    expect(res.reactionDistanceM).toBe(16.7)
    expect(res.brakingDistanceM).toBeGreaterThan(0)
    expect(res.totalStoppingDistanceM).toBe(
      +(res.reactionDistanceM + res.brakingDistanceM).toFixed(1),
    )
    expect(res.initialKineticEnergyKj).toBeGreaterThan(0)
  })

  // 7. Alcohol Dilution
  it('computes exact dilution ratio for medical 70 degree alcohol', () => {
    const res = calculateAlcoholDilution(500, 90) // 500ml of 70 deg from 90 deg
    expect(res.initialAlcoholVolumeMl).toBe(389) // 70 * 500 / 90 = 388.88 -> 389
    expect(res.waterToAddMl).toBe(111)
    expect(res.initialAlcoholVolumeMl + res.waterToAddMl).toBe(500)
  })

  // 8. pH Scale & Neutralization
  it('calculates logarithmic hydrogen ion concentration ratio', () => {
    expect(COMMON_PH_ITEMS.length).toBeGreaterThan(5)
    // Between pH 1.5 and pH 2.5: ratio is 10^1 = 10
    expect(getPhComparison(1.5, 2.5)).toBe(10)
    // Between pH 7.0 and pH 5.0: ratio is 10^2 = 100
    expect(getPhComparison(7.0, 5.0)).toBe(100)
  })

  // 9. BMR / TDEE & Macro
  it('computes Mifflin-St Jeor BMR and macro calories accurately', () => {
    const maleRes = calculateTdeeAndMacro(70, 175, 25, 'male', 1.375, 'fat_loss')
    expect(maleRes.bmr).toBe(1674) // 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    expect(maleRes.tdee).toBe(Math.round(1674 * 1.375))
    expect(maleRes.targetCalories).toBe(Math.round(maleRes.tdee * 0.8))
    expect(maleRes.proteinGrams).toBe(140) // 70 * 2
    expect(maleRes.macroCalories.protein).toBe(560)
  })

  // 10. Mendelian Blood Type Genetics
  it('predicts offspring blood type probabilities via Punnett squares', () => {
    // Both parents O -> 100% O
    const oRes = predictOffspringBloodTypes('O', 'O')
    expect(oRes).toEqual([{ bloodType: 'O', percentage: 100 }])

    // AB and O -> 50% A, 50% B
    const abORes = predictOffspringBloodTypes('AB', 'O')
    expect(abORes.find((x) => x.bloodType === 'A')?.percentage).toBe(50)
    expect(abORes.find((x) => x.bloodType === 'B')?.percentage).toBe(50)
    expect(abORes.find((x) => x.bloodType === 'O')).toBeUndefined()
  })
})
