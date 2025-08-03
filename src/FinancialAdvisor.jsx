import React, { useState, useRef, useEffect } from 'react';
import { Upload, MessageCircle, DollarSign, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import UploadTab from './components/UploadTab';
import ChatTab from './components/ChatTab';
import PurchaseAdvisorTab from './components/PurchaseAdvisorTab';
import InsightsTab from './components/InsightsTab';
import { parseCSV } from './utils/transactions';

const FinancialAdvisor = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [transactions, setTransactions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [purchaseInput, setPurchaseInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        type: 'assistant',
        message: "Hello! I'm Sage, your AI financial advisor. Upload your transaction data to get started, or feel free to ask me any questions about managing your finances. I'm here to help you make informed financial decisions!",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'upload' && (
            <UploadTab
              transactions={transactions}
              handleFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
            />
          )}

          {activeTab === 'chat' && (
            <ChatTab
              chatHistory={chatHistory}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleChatMessage={handleChatMessage}
              isProcessing={isProcessing}
              chatEndRef={chatEndRef}
            />
          )}

          {activeTab === 'purchase' && (
            <PurchaseAdvisorTab
              purchaseInput={purchaseInput}
              setPurchaseInput={setPurchaseInput}
              handlePurchaseAdvice={handlePurchaseAdvice}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsTab transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialAdvisor;
