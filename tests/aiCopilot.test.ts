import { describe, it, expect } from 'vitest';
import { askGeminiLogisticsCopilot } from '../server/services/geminiService';

describe('Gemini Logistics Copilot & Bayesian Risk Intelligence', () => {
  it('should calculate Landslide Hazard Index (LHI) accurately', () => {
    // Mathematical Formula: LHI = (Rainfall * 0.35) + (InSAR * 1.8) + (Slope * 0.9)
    const computeLhi = (rainfall: number, insar: number, slope: number) => {
      return Math.min(100, Math.round(rainfall * 0.35 + insar * 1.8 + slope * 0.9));
    };

    const extremeRisk = computeLhi(95, 22, 45); // Heavy torrential monsoon + 22mm shift + steep slope
    expect(extremeRisk).toBeGreaterThanOrEqual(80);

    const normalRisk = computeLhi(10, 2, 15);
    expect(normalRisk).toBeLessThanOrEqual(40);
  });

  it('should generate grounded domain tactical responses for logistics queries', async () => {
    const response = await askGeminiLogisticsCopilot('Tawang oxygen stockout status');
    expect(response.reply).toBeDefined();
    expect(response.groundedDataContext).toBeDefined();
    expect(response.groundedDataContext.criticalDepots.length).toBeGreaterThan(0);
    expect(response.recommendedActions.length).toBeGreaterThan(0);
  });

  it('should provide dynamic actions for greeting or general query', async () => {
    const greeting = await askGeminiLogisticsCopilot('hi');
    expect(greeting.reply).toContain('Gemini Logistics Copilot');
    expect(greeting.groundedDataContext).toBeDefined();
  });
});
