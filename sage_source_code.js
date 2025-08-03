import React, { useState, useRef, useEffect } from 'react';
import { Upload, MessageCircle, DollarSign, Camera, PieChart, TrendingUp, Shield, Plus, Send, FileText, BarChart3 } from 'lucide-react';

const FinancialAdvisor = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [transactions, setTransactions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [purchaseInput, setPurchaseInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Sample welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        type: 'assistant',
        message: "Hello! I'm Sage, your AI financial advisor. Upload your transaction data to get started, or feel free to ask me any questions about managing your finances. I'm here to help you make informed financial decisions!",
        timestamp: new Date()
      }]);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Parse CSV data
  const parseCSV = (csvText) => {
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
        
        // Standardize common field names
        const amount = transaction.amount || transaction.debit || transaction.credit || transaction.transaction_amount || '0';
        const description = transaction.description || transaction.memo || transaction.payee || transaction.transaction_description || '';
        const date = transaction.date || transaction.transaction_date || transaction.posted_date || '';
        
        // Categorize transaction
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

  // Simple transaction categorization
  const categorizeTransaction = (description) => {
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

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target.result;
        const parsedTransactions = parseCSV(csvData);
        setTransactions(parsedTransactions);
        
        setChatHistory(prev => [...prev, {
          type: 'system',
          message: `Successfully loaded ${parsedTransactions.length} transactions from your CSV file. I can now provide personalized insights about your spending!`,
          timestamp: new Date()
        }]);
        
        setActiveTab('chat');
      };
      reader.readAsText(file);
    }
  };

  // Generate spending insights
  const generateInsights = () => {
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

  // Handle chat with Claude
  const handleChatMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Prepare context about user's financial data
      const financialContext = transactions.length > 0 ? 
        `User's Financial Data Summary:
        - Total Transactions: ${transactions.length}
        - Categories: ${[...new Set(transactions.map(t => t.category))].join(', ')}
        - Date Range: ${transactions.length > 0 ? `${transactions[0]?.date} to ${transactions[transactions.length - 1]?.date}` : 'N/A'}
        - Total Spending: $${transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
        
        Recent Transactions:
        ${transactions.slice(-10).map(t => `${t.date}: ${t.description} - $${Math.abs(t.amount).toFixed(2)} (${t.category})`).join('\n')}` :
        'No financial data uploaded yet.';

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are Sage, a helpful and friendly AI financial advisor. You provide practical, non-judgmental advice about personal finances. 

${financialContext}

User's question: "${inputMessage}"

Provide a helpful response based on their financial data (if available) and general financial wisdom. Be encouraging and practical. If they ask about specific spending patterns, reference their actual transaction data when relevant.`
            }
          ]
        })
      });

      const data = await response.json();
      const assistantMessage = {
        type: 'assistant',
        message: data.content[0].text,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        type: 'assistant',
        message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    }

    setIsProcessing(false);
  };

  // Handle purchase advice
  const handlePurchaseAdvice = async () => {
    if (!purchaseInput.trim()) return;

    setIsProcessing(true);

    try {
      const financialContext = transactions.length > 0 ?
        `User's Current Financial Situation:
        - Total Recent Spending: $${transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
        - Main Categories: ${[...new Set(transactions.map(t => t.category))].slice(0, 5).join(', ')}
        - Average Transaction: $${(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length).toFixed(2)}
        
        Recent spending in similar categories:
        ${transactions.slice(-20).map(t => `${t.description} - $${Math.abs(t.amount).toFixed(2)} (${t.category})`).join('\n')}` :
        'No financial data available for personalized advice.';

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `You are Sage, a helpful AI financial advisor providing real-time purchase advice. Be friendly but honest about spending decisions.

${financialContext}

The user is considering buying: "${purchaseInput}"

Provide brief, practical advice about this potential purchase. Consider:
1. If they have financial data, how does this fit their spending patterns?
2. Is this a reasonable expense?
3. Any red flags or green lights?
4. Brief recommendation (go for it, wait, consider alternatives, etc.)

Keep response under 100 words and be encouraging but realistic.`
            }
          ]
        })
      });

      const data = await response.json();
      
      setChatHistory(prev => [...prev, 
        {
          type: 'user',
          message: `💳 Purchase Check: ${purchaseInput}`,
          timestamp: new Date()
        },
        {
          type: 'assistant',
          message: `🛍️ **Purchase Advice**: ${data.content[0].text}`,
          timestamp: new Date()
        }
      ]);

      setPurchaseInput('');
      setActiveTab('chat');
    } catch (error) {
      setChatHistory(prev => [...prev, {
        type: 'assistant',
        message: "I'm having trouble analyzing that purchase right now. Please try again.",
        timestamp: new Date()
      }]);
    }

    setIsProcessing(false);
  };

  // Calculate spending by category for visualization
  const getSpendingByCategory = () => {
    const categories = {};
    transactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => ({ category, amount }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Sage</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your personal AI financial advisor. Upload your transaction data for personalized insights, 
            get real-time purchase advice, and take control of your financial future with Sage's guidance.
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-green-600">
            <Shield className="h-4 w-4 mr-1" />
            <span>100% Private - Your data never leaves your browser</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-md p-2">
          {[
            { id: 'upload', label: 'Upload Data', icon: Upload },
            { id: 'chat', label: 'Financial Chat', icon: MessageCircle },
            { id: 'purchase', label: 'Purchase Advisor', icon: DollarSign },
            { id: 'insights', label: 'Insights', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-md mx-1 my-1 transition-colors ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
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
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : msg.type === 'system'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-white text-gray-800 shadow-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-gray-200 px-4 py-2 rounded-lg">
                      <p>Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                  placeholder="Ask about your spending, budgeting tips, or financial advice..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleChatMessage}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Purchase Advisor Tab */}
          {activeTab === 'purchase' && (
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
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div>
              {transactions.length === 0 ? (
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
                        {getSpendingByCategory().map(({ category, amount }, index) => (
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
                        <p>• Average transaction: ${(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length).toFixed(2)}</p>
                        <p>• Most active category: {getSpendingByCategory()[0]?.category}</p>
                        <p>• Largest single expense: ${Math.max(...transactions.map(t => Math.abs(t.amount))).toFixed(2)}</p>
                        <p>• Smallest expense: ${Math.min(...transactions.map(t => Math.abs(t.amount))).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialAdvisor;