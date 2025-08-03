import React from 'react';
import { FileText, PieChart } from 'lucide-react';
import { getSpendingByCategory } from '../utils/transactions';

const InsightsTab = ({ transactions }) => (
  transactions.length === 0 ? (
    <div className="text-center">
      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-4">No Data Available</h3>
      <p className="text-gray-600">Upload your transaction data to see personalized insights.</p>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">
              ${transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(0)}
            </p>
            <p className="opacity-90">Total Spending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{transactions.length}</p>
            <p className="opacity-90">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {[...new Set(transactions.map(t => t.category))].length}
            </p>
            <p className="opacity-90">Categories</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Top Spending Categories
          </h4>
          <div className="space-y-3">
            {getSpendingByCategory(transactions).map(({ category, amount }) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium">{category}</span>
                <span className="text-gray-600">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Quick Insights</h4>
          <div className="space-y-3 text-sm">
            <p>• Average transaction: {(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length).toFixed(2)}</p>
            <p>• Most active category: {getSpendingByCategory(transactions)[0]?.category}</p>
            <p>• Largest single expense: ${Math.max(...transactions.map(t => Math.abs(t.amount))).toFixed(2)}</p>
            <p>• Smallest expense: ${Math.min(...transactions.map(t => Math.abs(t.amount))).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
);

export default InsightsTab;
