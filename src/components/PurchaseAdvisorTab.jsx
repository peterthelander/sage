import React from 'react';
import { DollarSign } from 'lucide-react';

const PurchaseAdvisorTab = ({ purchaseInput, setPurchaseInput, handlePurchaseAdvice, isProcessing }) => (
  <div className="text-center">
    <div className="max-w-md mx-auto">
      <DollarSign className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-4">Smart Purchase Advisor</h3>
      <p className="text-gray-600 mb-6">
        Thinking about buying something? Get instant AI advice based on your spending patterns and budget.
      </p>
      <div className="space-y-4">
        <input
          type="text"
          value={purchaseInput}
          onChange={(e) => setPurchaseInput(e.target.value)}
          placeholder="Describe what you want to buy (e.g., '$120 Nike sneakers' or 'Coffee maker for $89')"
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handlePurchaseAdvice}
          disabled={isProcessing || !purchaseInput.trim()}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? 'Analyzing...' : 'Get Purchase Advice'}
        </button>
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm">
          💡 Tip: The more transaction data you've uploaded, the more personalized your advice will be!
        </p>
      </div>
    </div>
  </div>
);

export default PurchaseAdvisorTab;
