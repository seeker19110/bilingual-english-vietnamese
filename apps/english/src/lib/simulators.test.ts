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
    expect(res.breakEvenLower).toBeGreaterThan(0)
    expect(res.breakEvenUpper).toBeGreaterThan(res.breakEvenLower)
  })

  it('handles boundary cases for profit optimization', () => {
    // Zero or negative elasticity
    const noElasticity = calculateProfitOptimization(100000, 20000, 100, 0, 10000, 50000)
    expect(noElasticity.optimalPrice).toBe(20000)

    // Clamped minPrice and maxPrice
    const clampedMin = calculateProfitOptimization(100000, 50000, 100, 0.01, 100000, 200000)
    expect(clampedMin.optimalPrice).toBe(100000)

    const clampedMax = calculateProfitOptimization(100000, 50000, 100, 0.0001, 10000, 60000)
    expect(clampedMax.optimalPrice).toBe(60000)

    // Unreachable break-even (delta < 0)
    const impossibleBreakEven = calculateProfitOptimization(
      1000000000, // 1B fixed cost
      50000,
      10, // tiny demand
      0.1,
      10000,
      100000,
    )
    expect(impossibleBreakEven.breakEvenLower).toBe(0)
    expect(impossibleBreakEven.breakEvenUpper).toBe(0)
  })

  // 2. Compound Interest
  it('calculates multi-year compound interest and inflation adjustment', () => {
    const res = calculateCompoundInterest(10000000, 2000000, 10, 4, 5)
    expect(res.yearlyData.length).toBe(5)
    expect(res.totalWealth).toBeGreaterThan(res.totalContributed)
    expect(res.realWealth).toBeLessThan(res.totalWealth)
    expect(res.totalInterest).toBe(res.totalWealth - res.totalContributed)
  })

  it('handles zero years gracefully in compound interest', () => {
    const res = calculateCompoundInterest(5000000, 1000000, 10, 4, 0)
    expect(res.totalWealth).toBe(5000000)
    expect(res.totalInterest).toBe(0)
  })

  // 3. Loan Amortization
  it('calculates monthly mortgage payment with reducing balance', () => {
    const res = calculateLoanAmortization(1000000000, 9, 20) // 1 billion VND at 9% for 20 years
    expect(res.monthlyPayment).toBeGreaterThan(0)
    expect(res.totalPayment).toBeGreaterThan(1000000000)
    expect(res.totalInterestPaid).toBe(res.totalPayment - 1000000000)
    expect(res.firstMonthInterest).toBe(7500000) // 1B * (9% / 12) = 7.5M
  })

  it('handles zero loan amount or zero interest rate in amortization', () => {
    const zeroLoan = calculateLoanAmortization(0, 8, 10)
    expect(zeroLoan.monthlyPayment).toBe(0)

    const zeroInterest = calculateLoanAmortization(120000000, 0, 10)
    expect(zeroInterest.monthlyPayment).toBe(1000000) // 120M / 120 months
    expect(zeroInterest.totalInterestPaid).toBe(0)
    expect(zeroInterest.firstMonthInterest).toBe(0)
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

  it('handles high and low temperature variations in AC billing', () => {
    const hotAc = calculateEvnElectricityBill(12, 18, 60, 10, 100)
    const coldAc = calculateEvnElectricityBill(4, 28, 10, 2, 20)
    expect(hotAc.totalBill).toBeGreaterThan(coldAc.totalBill)
    expect(hotAc.acSavingPotentialKwh).toBeGreaterThan(0)
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
    expect(res.dangerLevel).toBe('safe')
  })

  it('evaluates different danger levels in vehicle braking', () => {
    const dangerRes = calculateBrakingDistance(120, 1.8, 0.3)
    expect(dangerRes.dangerLevel).toBe('danger')

    const cautionRes = calculateBrakingDistance(60, 0.9, 0.45)
    expect(cautionRes.dangerLevel).toBe('caution')
  })

  // 7. Alcohol Dilution
  it('computes exact dilution ratio for medical 70 degree alcohol', () => {
    const res = calculateAlcoholDilution(500, 90) // 500ml of 70 deg from 90 deg
    expect(res.initialAlcoholVolumeMl).toBe(389)
    expect(res.waterToAddMl).toBe(111)
    expect(res.initialAlcoholVolumeMl + res.waterToAddMl).toBe(500)
    expect(res.scientificReason).toContain('70°')

    const defaultDeg = calculateAlcoholDilution(1000)
    expect(defaultDeg.initialAlcoholVolumeMl).toBe(778)
  })

  // 8. pH Scale & Neutralization
  it('calculates logarithmic hydrogen ion concentration ratio', () => {
    expect(COMMON_PH_ITEMS.length).toBeGreaterThan(5)
    expect(getPhComparison(1.5, 2.5)).toBe(10)
    expect(getPhComparison(7.0, 5.0)).toBe(100)
  })

  // 9. BMR / TDEE & Macro
  it('computes Mifflin-St Jeor BMR and macro calories accurately', () => {
    const maleRes = calculateTdeeAndMacro(70, 175, 25, 'male', 1.375, 'fat_loss')
    expect(maleRes.bmr).toBe(1674)
    expect(maleRes.tdee).toBe(Math.round(1674 * 1.375))
    expect(maleRes.targetCalories).toBe(Math.round(maleRes.tdee * 0.8))
    expect(maleRes.proteinGrams).toBe(140)
    expect(maleRes.macroCalories.protein).toBe(560)

    const femaleMaintenance = calculateTdeeAndMacro(55, 160, 30, 'female', 1.2, 'maintenance')
    expect(femaleMaintenance.targetCalories).toBe(femaleMaintenance.tdee)

    const maleSurplus = calculateTdeeAndMacro(80, 180, 22, 'male', 1.55, 'muscle_gain')
    expect(maleSurplus.targetCalories).toBe(Math.round(maleSurplus.tdee * 1.15))
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

    // AB and AB -> 25% A, 50% AB, 25% B
    const abAbRes = predictOffspringBloodTypes('AB', 'AB')
    expect(abAbRes.find((x) => x.bloodType === 'AB')?.percentage).toBe(50)
  })
})
