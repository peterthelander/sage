export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length >= 3) {
      const transaction = {};
      headers.forEach((header, index) => {
        transaction[header] = values[index] || '';
      });

      const amount = transaction.amount || transaction.debit || transaction.credit || transaction.transaction_amount || '0';
      const description = transaction.description || transaction.memo || transaction.payee || transaction.transaction_description || '';
      const date = transaction.date || transaction.transaction_date || transaction.posted_date || '';

      const category = categorizeTransaction(description);

      transactions.push({
        date: date,
        description: description,
        amount: parseFloat(amount.replace(/[^-\d.]/g, '')) || 0,
        category: category,
        id: Date.now() + Math.random()
      });
    }
  }

  return transactions.filter(t => t.description && t.amount !== 0);
};

export const categorizeTransaction = (description) => {
  const desc = description.toLowerCase();

  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food')) return 'Groceries';
  if (desc.includes('gas') || desc.includes('fuel') || desc.includes('shell') || desc.includes('exxon')) return 'Transportation';
  if (desc.includes('restaurant') || desc.includes('dining') || desc.includes('coffee') || desc.includes('pizza')) return 'Dining Out';
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('subscription') || desc.includes('amazon prime')) return 'Subscriptions';
  if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('phone')) return 'Utilities';
  if (desc.includes('rent') || desc.includes('mortgage')) return 'Housing';
  if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('target') || desc.includes('walmart')) return 'Shopping';
  if (desc.includes('medical') || desc.includes('pharmacy') || desc.includes('doctor')) return 'Healthcare';
  if (desc.includes('gym') || desc.includes('fitness')) return 'Fitness';

  return 'Other';
};

export const getSpendingByCategory = (transactions) => {
  const categories = {};
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
  });
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, amount]) => ({ category, amount }));
};

export const generateInsights = (transactions) => {
  if (transactions.length === 0) return "Please upload your transaction data first.";

  const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const categories = {};
  const monthlySpending = {};

  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    const month = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    monthlySpending[month] = (monthlySpending[month] || 0) + Math.abs(t.amount);
  });

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  const avgMonthly = Object.values(monthlySpending).reduce((a, b) => a + b, 0) / Object.keys(monthlySpending).length;

  return `Based on your transaction history:

💰 Total Spending: $${totalSpent.toFixed(2)}
📊 Top Category: ${topCategory[0]} ($${topCategory[1].toFixed(2)})
📈 Average Monthly: $${avgMonthly.toFixed(2)}

Key Insights:
• You spend most on ${topCategory[0].toLowerCase()}
• ${Object.keys(categories).length} different spending categories identified
• ${transactions.length} transactions analyzed`;
};
