import React, { useState } from 'react';
import { parseCSV } from '../utils/transactions';

const OnboardingModal = ({ onComplete, setTransactions }) => {
  const [taxFileName, setTaxFileName] = useState('');
  const [transactionFileName, setTransactionFileName] = useState('');
  const [name, setName] = useState('');
  const [goals, setGoals] = useState('');
  const [questions, setQuestions] = useState('');

  const handleTaxUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaxFileName(file.name);
    }
  };

  const handleTransactionUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const parsed = parseCSV(ev.target.result);
        setTransactions(parsed);
      };
      reader.readAsText(file);
      setTransactionFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ name, goals, questions, taxReturn: taxFileName });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Welcome to Sage</h2>
        <p className="text-gray-600 mb-6 text-center">
          Let's personalize your experience. You can skip any step and update details later.
        </p>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Financial Goals (optional)</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Save for a house, pay off debt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Questions (optional)</label>
            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Am I on track for retirement?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Tax Return (optional)</label>
            <input type="file" accept=".pdf,.csv" onChange={handleTaxUpload} className="w-full" />
            {taxFileName && (
              <p className="text-xs text-gray-500 mt-1">Selected: {taxFileName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Transactions CSV (optional)</label>
            <input type="file" accept=".csv" onChange={handleTransactionUpload} className="w-full" />
            {transactionFileName && (
              <p className="text-xs text-gray-500 mt-1">Loaded: {transactionFileName}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => onComplete({})}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Skip for now
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingModal;
