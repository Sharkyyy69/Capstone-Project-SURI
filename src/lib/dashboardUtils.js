export function buildDashboardSummary(assessments = []) {
  const total = assessments.length;
  const fresh = assessments.filter((item) => String(item.result || '').toLowerCase() === 'fresh').length;
  const questionable = assessments.filter((item) => String(item.result || '').toLowerCase() === 'questionable').length;
  const spoiled = assessments.filter((item) => String(item.result || '').toLowerCase() === 'spoiled').length;
  const averageScore = total
    ? Number((assessments.reduce((sum, item) => sum + Number(item.score || 0), 0) / total).toFixed(2))
    : 0;
  const highRisk = spoiled;

  const byProductType = assessments.reduce((acc, item) => {
    const key = String(item.productType || 'Other');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topProductType = Object.entries(byProductType).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    fresh,
    questionable,
    spoiled,
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
