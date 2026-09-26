import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';

interface PolicyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentText: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_QUESTIONS = [
  'Can they sell or share my personal data?',
  'How do I cancel my subscription or account?',
  'Do they train AI models on my content/prompts?',
  'Am I forced into mandatory arbitration?',
  'Can they change the terms without notifying me?',
];

export const PolicyChatDrawer: React.FC<PolicyChatDrawerProps> = ({
  isOpen,
  onClose,
  documentName,
  documentText,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I've analyzed **${documentName}**. Ask any question regarding clauses, privacy rights, cancellation terms, or data sharing rules.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const text = (questionText || input).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName,
          documentText,
          messages: newMessages.slice(-8),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Could not retrieve answer.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#09090b] border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">
                Policy Assistant
              </h3>
              <p className="text-xs text-zinc-400 truncate max-w-[280px]">{documentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs sm:text-sm ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 text-xs items-center text-zinc-400 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 max-w-[80%]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              <span>Analyzing clauses...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        {messages.length < 3 && (
          <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/30">
            <div className="text-[11px] text-zinc-400 mb-1.5">
              Suggested questions:
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 whitespace-nowrap transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about this policy..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 transition-colors shrink-0 font-medium"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
