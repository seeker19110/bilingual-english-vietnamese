# Spec: Interactive Real-Life Simulation Lab & Applied Knowledge Hub

- **Status:** Approved for implementation
- **Date:** 2026-08-18
- **Author:** Dong Hanh Core Team
- **Domain:** Learning & Cross-Domain Applied Knowledge

## 1. Problem & Objectives

Many learners struggle with the question: _"Why do we need to learn this formula / theorem in school?"_. Academic curriculum (K12) often feels detached from real-world decision making, household finance, personal health, and modern technology.

The objective of this feature is to bridge school curriculum (Mathematics, Physics, Chemistry, Biology, Computer Science, Economics & Law) with interactive simulations and real-world problem solving.

## 2. Architectural Design

1. **Simulation Engine (`apps/english/src/lib/simulators.ts`):**
   - 10 pure mathematical/scientific models:
     1. Profit Optimization (Calculus derivative $P'(x) = 0$)
     2. Compound Interest & FIRE Plan ($A = P(1+r)^n$)
     3. Loan Amortization (Reducing balance schedule)
     4. EVN 6-Tier Progressive Electricity Bill ($A = P \cdot t$)
     5. Einstein GPS Relativity Time Dilation
     6. Safe Braking Distance & Kinetic Energy ($E_k = \frac{1}{2}mv^2$)
     7. Antiseptic Alcohol Dilution ($C_1 V_1 = C_2 V_2$)
     8. pH Scale Logarithmic Acidity Comparison
     9. Mifflin-St Jeor BMR/TDEE & Macro distribution
     10. Mendelian Blood Type Allele Genetics

2. **Applied Knowledge Database (`apps/english/src/data/appliedKnowledgeData.ts`):**
   - 4-layer reality framework: Theory -> Intuition -> Everyday Problem -> Industry Application.

3. **Interactive UI (`apps/english/src/pages/AppliedKnowledge.tsx`):**
   - 4 tabs: Simulators Lab, Knowledge Library, AI Explainer, Hands-on Mini Projects.

## 3. Verification & DoD

- Typecheck: 0 errors
- Lint: 0 warnings
- Tests: 100% pass on simulator logic and branch coverage
- Build: successful Vite client and Node server bundle
