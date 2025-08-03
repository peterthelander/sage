import React from 'react';
import { Upload } from 'lucide-react';

const UploadTab = ({ transactions, handleFileUpload, fileInputRef }) => (
  <div className="text-center">
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors">
      <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-4">Upload Your Transaction Data</h3>
      <p className="text-gray-600 mb-6">
        Upload a CSV file from your bank or credit card to get personalized financial insights.
        Common formats from Chase, Bank of America, Wells Fargo, and others are supported.
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Choose CSV File
      </button>
      {transactions.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            ✅ Successfully loaded {transactions.length} transactions
          </p>
        </div>
      )}
    </div>
  </div>
);

export default UploadTab;
