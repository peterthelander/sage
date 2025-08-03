import { describe, it, expect } from 'vitest';
import { categorizeTransaction, identifyRecurringTransactions, detectSpendingTrends } from './transactions';

describe('categorizeTransaction', () => {
  it('classifies using keyword matching', () => {
    expect(categorizeTransaction('Walmart Supercenter')).toBe('Shopping');
  });

  it('classifies using pattern recognition', () => {
    expect(categorizeTransaction('Whole Foods Market')).toBe('Groceries');
  });
});

describe('identifyRecurringTransactions', () => {
  it('detects recurring payments', () => {
    const data = [
      { date: '2024-01-01', description: 'Spotify', amount: -9.99, category: 'Subscriptions' },
      { date: '2024-02-01', description: 'Spotify', amount: -9.99, category: 'Subscriptions' },
      { date: '2024-03-01', description: 'Spotify', amount: -9.99, category: 'Subscriptions' },
    ];
    const recurring = identifyRecurringTransactions(data);
    expect(recurring.length).toBe(1);
    expect(recurring[0].description).toBe('Spotify');
  });
});

describe('detectSpendingTrends', () => {
  it('finds increasing spend in categories', () => {
    const data = [
      { date: '2024-01-10', description: 'Cafe', amount: -10, category: 'Dining Out' },
      { date: '2024-02-10', description: 'Cafe', amount: -20, category: 'Dining Out' },
    ];
    const trends = detectSpendingTrends(data);
    expect(trends.length).toBeGreaterThan(0);
    expect(trends[0].category).toBe('Dining Out');
    expect(trends[0].direction).toBe('up');
  });
});
