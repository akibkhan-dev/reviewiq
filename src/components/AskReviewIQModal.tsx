import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Quote,
  Star,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, ChatSupportingReview, Review } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { FormattedMessage } from './FormattedMessage';

interface AskReviewIQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReview?: (review: Review) => void;
}

const SUGGESTED_PROMPTS = [
  'What are the most common complaints across all products?',
  'Which product has the highest positive sentiment?',
  'What are customers saying about battery performance?',
  'Which product needs immediate engineering attention?',
  'Compare NovaBook Ultra 16 vs AudioPro ANC Headphones feedback.',
  'Summarize all 1-star and 2-star reviews.',
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: "Hello! I am **Ask ReviewIQ**, your enterprise customer intelligence copilot. I am directly connected to the active customer reviews dataset. Ask me anything about sentiment patterns, product defects, or customer praise, and I'll cite verified customer reviews as evidence.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedFollowUps: [
      'What are the most common complaints?',
      'Which product has the highest positive sentiment?',
      'What are customers saying about battery performance?',
    ],
  },
];

export const AskReviewIQModal: React.FC<AskReviewIQModalProps> = ({
  isOpen,
  onClose,
  onSelectReview,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const voice = useVoiceAssistant({
    onTranscriptComplete: (text) => {
      if (text.trim()) {
        handleSendMessage(text);
      }
    },
  });

  // Stop speaking when modal closes
  useEffect(() => {
    if (!isOpen) {
      voice.interrupt();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Interrupt any speech before sending new query
    voice.interrupt();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await api.askReviewIQ(query, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        supportingReviews: res.supportingReviews,
        suggestedFollowUps: res.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
      voice.speakText(res.answerText);
    } catch (e) {
      console.error('Chat error:', e);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue analyzing the dataset. Please try rephrasing your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    voice.interrupt();
    setMessages(INITIAL_MESSAGES);
    setInput('');
  };

  const handleClose = () => {
    voice.interrupt();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#06B6D4] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Ask ReviewIQ Voice Copilot</h3>
                <span className="text-[10px] font-bold bg-violet-50 text-[#635BFF] px-2 py-0.5 rounded border border-violet-100">
                  {voice.isSpeaking ? 'Speaking' : voice.isListening ? 'Listening' : 'Grounded AI'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Answers strictly backed by verified customer reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Interrupt button if speaking */}
            {voice.isSpeaking && (
              <button
                type="button"
                onClick={voice.stopSpeaking}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Stop</span>
              </button>
            )}

            {/* Mute/Unmute audio button */}
            <button
              type="button"
              onClick={voice.toggleMute}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                voice.isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={voice.isMuted ? 'Audio muted (Click to unmute)' : 'Audio active (Click to mute)'}
            >
              {voice.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Clear conversation */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const hasEvidence = msg.supportingReviews && msg.supportingReviews.length > 0;
            const isEvidenceOpen = expandedEvidence[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-3 ${
                    isUser
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <FormattedMessage content={msg.text} isUser={isUser} />

                  {/* Supporting Reviews Evidence Accordion */}
                  {hasEvidence && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <button
                        onClick={() => toggleEvidence(msg.id)}
                        className="flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <Quote className="w-3 h-3" />
                        <span>
                          {isEvidenceOpen ? 'Hide Supporting Evidence' : `View Evidence (${msg.supportingReviews!.length} Reviews)`}
                        </span>
                        {isEvidenceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isEvidenceOpen && (
                        <div className="mt-2 space-y-2 animate-in fade-in">
                          {msg.supportingReviews!.map((rev) => (
                            <div
                              key={rev.id}
                              className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-slate-700 font-semibold">
                                <span>{rev.customer} ({rev.product})</span>
                                <span className="text-amber-500 font-bold">{rev.rating}★</span>
                              </div>
                              <p className="text-slate-600 italic">"{rev.quote}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up Prompts */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-full">
                        Suggested Follow-ups:
                      </span>
                      {msg.suggestedFollowUps.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[10px] block text-right ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>Scanning customer reviews dataset & synthesizing answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Shelf */}
        <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Try asking:</span>
          {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap cursor-pointer hover:border-slate-300"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (voice.isListening) {
                  voice.stopListening();
                } else {
                  voice.startListening();
                }
              }}
              className={`p-3 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 ${
                voice.isListening
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title={voice.isListening ? 'Stop listening' : 'Start microphone speech input'}
            >
              {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#06B6D4]" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                voice.isListening
                  ? 'Listening to your voice...'
                  : "Ask anything about customer feedback (e.g., 'What are the main battery complaints?')..."
              }
              className="flex-1 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all shadow-2xs placeholder-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
