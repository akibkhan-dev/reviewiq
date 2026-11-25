import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Quote,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useVoiceAssistant, VoiceState } from '../hooks/useVoiceAssistant';
import { VoiceWaveform } from './VoiceWaveform';
import { FormattedMessage } from './FormattedMessage';
import { api } from '../services/api';
import { ChatMessage, ChatSupportingReview, Review } from '../types';

interface AIVoiceAssistantHeroProps {
  onSelectReview?: (review: Review) => void;
}

const DEFAULT_SUGGESTIONS = [
  'Which product has the most negative reviews?',
  'What are the common battery complaints?',
  'Summarize positive customer feedback.',
  'Compare NovaBook Ultra vs AudioPro Headphones.',
  'What problems should the company fix first?',
];

export const AIVoiceAssistantHero: React.FC<AIVoiceAssistantHeroProps> = ({
  onSelectReview,
}) => {
  // Whether the conversation view is active or compact visualizer view
  const [isConversationActive, setIsConversationActive] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>(DEFAULT_SUGGESTIONS.slice(0, 3));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send query to ReviewIQ Gemini AI
  const handleSendQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    // Interrupt any active voice speech first
    voice.interrupt();

    // Ensure conversation panel is visible
    setIsConversationActive(true);

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    voice.setVoiceState('thinking');

    try {
      // Build conversation history for context
      const historyContext = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const response = await api.askReviewIQ(q, historyContext);

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: response.answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        supportingReviews: response.supportingReviews,
        suggestedFollowUps: response.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setActiveFollowUps(response.suggestedFollowUps);
      }

      // Automatically speak the response aloud using SpeechSynthesis
      voice.speakText(response.answerText);
    } catch (err: any) {
      console.error('Voice Assistant query error:', err);
      voice.setVoiceState('error');
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error analyzing customer reviews. Please check your network connection or try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Wire up the voice assistant hook
  const voice = useVoiceAssistant({
    onTranscriptComplete: (transcript) => {
      if (transcript && transcript.trim().length > 0) {
        handleSendQuery(transcript);
      }
    },
  });

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (isConversationActive && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isConversationActive, voice.interimTranscript]);

  const handleStartConversation = () => {
    setIsConversationActive(true);
    voice.startListening();
  };

  const handleClearConversation = () => {
    voice.interrupt();
    setMessages([]);
    setIsConversationActive(false);
    setActiveFollowUps(DEFAULT_SUGGESTIONS.slice(0, 3));
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Assistant Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#06B6D4] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>ReviewIQ Voice Copilot</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-[#635BFF] border border-violet-100">
                Live AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded in 52 verified customer reviews
            </p>
          </div>
        </div>

        {/* Audio & Header Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mute/Unmute Audio Toggle */}
          <button
            type="button"
            onClick={voice.toggleMute}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              voice.isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={voice.isMuted ? 'Voice output is muted (Click to unmute)' : 'Voice output is active (Click to mute)'}
          >
            {voice.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Conversation */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearConversation}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Full Chat History */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConversationActive(!isConversationActive)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              {isConversationActive ? 'Compact' : 'Show Chat'}
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* COMPACT VIEW (Initial Hero State) */}
        {!isConversationActive ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            {/* Visualizer Waveform Core */}
            <VoiceWaveform
              state={voice.voiceState}
              audioLevel={voice.audioLevel}
              onMicClick={() => {
                if (voice.isListening) {
                  voice.stopListening();
                } else {
                  handleStartConversation();
                }
              }}
              isMuted={voice.isMuted}
            />

            {/* Error Message if any */}
            {voice.errorMessage && (
              <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{voice.errorMessage}</span>
                </div>
              </div>
            )}

            {/* Start Conversation Button */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleStartConversation}
                className="w-full flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#06B6D4]" />
                <span>Start Voice Conversation</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConversationActive(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Chat</span>
              </button>
            </div>

            {/* Quick Clickable Suggestions */}
            <div className="w-full pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Or Tap to Ask ReviewIQ
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {DEFAULT_SUGGESTIONS.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendQuery(prompt)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-[#635BFF] text-slate-700 border border-slate-200 hover:border-violet-200 transition-all text-left cursor-pointer"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CONVERSATION TRANSCRIPT VIEW */
          <div className="flex flex-col space-y-4">
            {/* Top Compact Waveform Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (voice.isListening) {
                      voice.stopListening();
                    } else if (voice.isSpeaking) {
                      voice.stopSpeaking();
                    } else {
                      voice.startListening();
                    }
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                    voice.isListening
                      ? 'bg-gradient-to-tr from-[#635BFF] to-[#06B6D4] text-white ring-4 ring-violet-200 animate-pulse'
                      : voice.isSpeaking
                      ? 'bg-slate-900 text-cyan-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300'
                  }`}
                >
                  {voice.isListening ? (
                    <Mic className="w-4 h-4 text-white" />
                  ) : voice.isSpeaking ? (
                    <Square className="w-3.5 h-3.5 text-white fill-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-[#635BFF]" />
                  )}
                </button>

                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {voice.isListening
                      ? 'Listening to you...'
                      : voice.isSpeaking
                      ? 'Speaking response aloud'
                      : voice.isThinking
                      ? 'Analyzing reviews...'
                      : 'Ready for your next question'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {voice.isSpeaking ? 'Tap stop button to interrupt' : 'Tap mic to speak or type below'}
                  </span>
                </div>
              </div>

              {/* Stop Speaking / Interrupt button */}
              {voice.isSpeaking && (
                <button
                  type="button"
                  onClick={voice.stopSpeaking}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Interrupt</span>
                </button>
              )}
            </div>

            {/* Scrollable Conversation History */}
            <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-3.5 pr-1">
              {messages.length === 0 && (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-6 h-6 text-violet-400 mx-auto" />
                  <p className="text-xs">
                    Start speaking or click any suggested prompt below to begin the voice session.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white font-medium rounded-br-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-semibold opacity-70">
                      <span>{msg.sender === 'user' ? 'You' : 'ReviewIQ Voice'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Text Body rendered with Markdown formatting (no raw ** displayed) */}
                    <FormattedMessage content={msg.text} isUser={msg.sender === 'user'} />

                    {/* Expandable Supporting Review Evidence */}
                    {msg.supportingReviews && msg.supportingReviews.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => toggleEvidence(msg.id)}
                          className="flex items-center justify-between w-full text-[11px] font-bold text-[#635BFF] hover:text-indigo-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1">
                            <Quote className="w-3 h-3" />
                            <span>
                              {expandedEvidence[msg.id] ? 'Hide' : 'View'} Evidence ({msg.supportingReviews.length} Verified Reviews)
                            </span>
                          </span>
                          {expandedEvidence[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {expandedEvidence[msg.id] && (
                          <div className="mt-2 space-y-2 animate-in fade-in">
                            {msg.supportingReviews.map((rev) => (
                              <div
                                key={rev.id}
                                className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="text-slate-900 truncate max-w-[180px]">
                                    {rev.product}
                                  </span>
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>{rev.rating}★</span>
                                  </div>
                                </div>
                                <p className="italic text-slate-600">
                                  "{rev.quote}"
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                  <span>— {rev.customer}</span>
                                  <span
                                    className={`font-semibold ${
                                      rev.sentiment === 'Positive'
                                        ? 'text-emerald-600'
                                        : rev.sentiment === 'Negative'
                                        ? 'text-rose-600'
                                        : 'text-amber-600'
                                    }`}
                                  >
                                    {rev.sentiment}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Real-time Interim Listening Caption */}
              {voice.interimTranscript && (
                <div className="flex flex-col items-end animate-in fade-in">
                  <div className="max-w-[90%] rounded-2xl px-4 py-2.5 text-xs bg-slate-800 text-cyan-200 rounded-br-xs border border-cyan-400/30 flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 animate-pulse text-[#06B6D4]" />
                    <span>Listening: "{voice.interimTranscript}"</span>
                  </div>
                </div>
              )}

              {/* Thinking Indicator */}
              {voice.isThinking && (
                <div className="flex flex-col items-start animate-in fade-in">
                  <div className="rounded-2xl px-4 py-2.5 text-xs bg-slate-100 text-slate-600 rounded-bl-xs border border-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#635BFF] animate-ping" />
                    <span>ReviewIQ Brain is calculating answer...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Follow-up Questions */}
            {activeFollowUps.length > 0 && !voice.isListening && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Suggested Questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeFollowUps.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendQuery(prompt)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-[#635BFF] text-slate-700 border border-slate-200 hover:border-violet-200 transition-all text-left cursor-pointer"
                    >
                      💬 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Persistent Input Bar (Microphone & Text alternative) */}
        <div className="pt-2 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(textInput);
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
                  handleStartConversation();
                }
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                voice.isListening
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title={voice.isListening ? 'Stop listening' : 'Start microphone speech input'}
            >
              {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#06B6D4]" />}
            </button>

            {/* Text Input Field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  voice.isListening
                    ? 'Listening to your voice...'
                    : 'Type a question or click the microphone...'
                }
                className="w-full text-xs font-normal text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all shadow-2xs placeholder-slate-400"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!textInput.trim() || voice.isThinking}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs"
              title="Send text question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
