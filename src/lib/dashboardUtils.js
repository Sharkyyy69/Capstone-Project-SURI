export function buildDashboardSummary(assessments = []) {
  const total = assessments.length;
  const statusCounts = {
    fresh: 0,
    questionable: 0,
    spoiled: 0,
    overripe: 0,
  };

  assessments.forEach((item) => {
    const result = String(item.result || '').trim().toLowerCase();

    if (Object.hasOwn(statusCounts, result)) {
      statusCounts[result] += 1;
    }
  });

  const averageScore = total
    ? Number((assessments.reduce((sum, item) => sum + Number(item.score || 0), 0) / total).toFixed(2))
    : 0;
  const highRisk = statusCounts.spoiled + statusCounts.overripe;

  const byProductType = assessments.reduce((acc, item) => {
    const key = String(item.productType || 'Other');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topProductType = Object.entries(byProductType).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    fresh: statusCounts.fresh,
    questionable: statusCounts.questionable,
    spoiled: statusCounts.spoiled,
    overripe: statusCounts.overripe,
    averageScore,
    highRisk,
    topProductType: topProductType ? { name: topProductType[0], count: topProductType[1] } : { name: 'N/A', count: 0 },
  };
}

export function exportAssessmentCsv(assessments = []) {
  const rows = [
    ['Item Name', 'Product Type', 'Result', 'Score', 'Recommendation', 'Date'],
    ...assessments.map((item) => [
      item.itemName || 'Unnamed item',
      item.productType || 'fruit',
      item.result || 'Unknown',
      item.score ?? 0,
      item.recommendation || 'N/A',
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
    ]),
  ];

  const formatCsvCell = (value) => {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  return rows
    .map((row) => row.map(formatCsvCell).join(','))
    .join('\n');
}
