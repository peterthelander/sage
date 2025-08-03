import React from 'react';
import { Send } from 'lucide-react';

const ChatTab = ({ chatHistory, inputMessage, setInputMessage, handleChatMessage, isProcessing, chatEndRef }) => (
  <div className="h-96 flex flex-col">
    <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
      {chatHistory.map((msg, index) => (
        <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
          <div
            className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.type === 'user'
                ? 'bg-blue-600 text-white'
                : msg.type === 'system'
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-gray-800 shadow-md'
            }`}
          >
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
);

export default ChatTab;
