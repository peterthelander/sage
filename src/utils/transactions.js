import stringSimilarity from 'string-similarity';

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

const samplePatterns = {
  'Groceries': ['whole foods market', 'kroger', 'trader joe', 'supermarket', 'grocery'],
  'Transportation': ['uber', 'lyft', 'shell', 'exxon', 'bp', 'gas station'],
  'Dining Out': ['restaurant', 'dining', 'coffee shop', 'pizza hut', 'burger king'],
  'Subscriptions': ['netflix', 'spotify', 'hulu', 'amazon prime', 'subscription'],
  'Utilities': ['comcast', 'verizon', 'electric company', 'water bill', 'internet'],
  'Housing': ['rent', 'mortgage payment', 'landlord'],
  'Shopping': ['walmart', 'target', 'amazon order', 'mall'],
  'Healthcare': ['pharmacy', 'walgreens', 'cvs', 'doctor', 'hospital'],
  'Fitness': ['gym', 'fitness', 'yoga', 'workout']
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

  let bestCategory = 'Other';
  let highestRating = 0;
  Object.entries(samplePatterns).forEach(([category, samples]) => {
    const match = stringSimilarity.findBestMatch(desc, samples);
    if (match.bestMatch.rating > highestRating) {
      highestRating = match.bestMatch.rating;
      bestCategory = category;
    }
  });

  return highestRating > 0.3 ? bestCategory : 'Other';
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

export const identifyRecurringTransactions = (transactions) => {
  const map = {};
  transactions.forEach(t => {
    const key = t.description.toLowerCase();
    const month = t.date.slice(0, 7);
    if (!map[key]) map[key] = { description: t.description, amounts: [], months: new Set() };
    map[key].amounts.push(Math.abs(t.amount));
    map[key].months.add(month);
  });
  return Object.values(map)
    .filter(r => r.months.size >= 3)
    .map(r => ({
      description: r.description,
      averageAmount: r.amounts.reduce((a, b) => a + b, 0) / r.amounts.length,
      occurrences: r.amounts.length
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);
};

export const detectSpendingTrends = (transactions) => {
  const byMonth = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7);
    byMonth[month] = byMonth[month] || {};
    byMonth[month][t.category] = (byMonth[month][t.category] || 0) + Math.abs(t.amount);
  });

  const months = Object.keys(byMonth).sort();
  if (months.length < 2) return [];
  const latest = months[months.length - 1];
  const prev = months[months.length - 2];
  const categories = new Set([...Object.keys(byMonth[latest] || {}), ...Object.keys(byMonth[prev] || {})]);

  const trends = [];
  categories.forEach(cat => {
    const current = byMonth[latest][cat] || 0;
    const previous = byMonth[prev][cat] || 0;
    const change = current - previous;
    if (change !== 0) {
      trends.push({ category: cat, change, direction: change > 0 ? 'up' : 'down' });
    }
  });

  return trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
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

  const recurring = identifyRecurringTransactions(transactions);
  const trends = detectSpendingTrends(transactions);
  const increasing = trends.filter(t => t.direction === 'up').map(t => t.category);
  const decreasing = trends.filter(t => t.direction === 'down').map(t => t.category);

  let summary = `Based on your transaction history:

💰 Total Spending: $${totalSpent.toFixed(2)}
📊 Top Category: ${topCategory[0]} ($${topCategory[1].toFixed(2)})
📈 Average Monthly: $${avgMonthly.toFixed(2)}

Key Insights:
• You spend most on ${topCategory[0].toLowerCase()}
• ${Object.keys(categories).length} different spending categories identified
• ${transactions.length} transactions analyzed`;

  if (recurring.length > 0) {
    summary += `\n• Recurring payments: ${recurring.map(r => r.description).slice(0,3).join(', ')}`;
  }
  if (increasing.length > 0) {
    summary += `\n• Spending increasing in: ${increasing.join(', ')}`;
  }
  if (decreasing.length > 0) {
    summary += `\n• Spending decreasing in: ${decreasing.join(', ')}`;
  }

  return summary;
};
