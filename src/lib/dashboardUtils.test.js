import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardSummary, exportAssessmentCsv } from './dashboardUtils.js';

test('buildDashboardSummary calculates totals and averages correctly', () => {
  const assessments = [
    { productType: 'fruit', result: 'Fresh', score: 90, itemName: 'Mango', createdAt: '2026-10-27T00:00:00.000Z' },
    { productType: 'meat', result: 'Questionable', score: 62, itemName: 'Chicken Breast', createdAt: '2026-10-26T00:00:00.000Z' },
    { productType: 'fruit', result: 'Spoiled', score: 38, itemName: 'Banana', createdAt: '2026-10-25T00:00:00.000Z' },
  ];

  const summary = buildDashboardSummary(assessments);

  assert.equal(summary.total, 3);
  assert.equal(summary.fresh, 1);
  assert.equal(summary.questionable, 1);
  assert.equal(summary.spoiled, 1);
  assert.equal(summary.averageScore, 63.33);
  assert.equal(summary.highRisk, 1);
});

test('exportAssessmentCsv includes the expected header and rows', () => {
  const assessments = [
    { itemName: 'Mango', productType: 'fruit', result: 'Fresh', score: 90, recommendation: 'Buy', createdAt: '2026-10-27T00:00:00.000Z' },
  ];

  const csv = exportAssessmentCsv(assessments);

  assert.ok(csv.startsWith('Item Name,Product Type,Result,Score,Recommendation,Date'));
  assert.ok(csv.includes('Mango,fruit,Fresh,90,Buy'));
});
