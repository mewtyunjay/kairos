'use client'

import { useState } from 'react';
import { Message } from '../types';

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isTyping: boolean;
}

export default function ChatBox({ onSendMessage, messages, isTyping }: ChatBoxProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm text-zinc-400 mb-2">
        Do you want to change anything? Tell me what task and how long it should take or its priority (1-5).
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-zinc-800/50 text-zinc-300'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 text-zinc-300 rounded-xl px-4 py-2">
              <div className="flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-100">•</span>
                <span className="animate-bounce delay-200">•</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your adjustments here..."
          className="flex-1 bg-zinc-800/50 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
} 