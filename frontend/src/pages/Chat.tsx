import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  isBot: boolean;
  createdAt: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7));

  // Voice States
  const [speechLang, setSpeechLang] = useState<'en' | 'hi'>('en');
  const [voiceOutput, setVoiceOutput] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const suggestions = [
    'What are the core admission eligibility requirements?',
    'What is the tuition fee for Computer Science programs?',
    'Are there any scholarship aid options?',
    'How many departments are available in the university?',
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  // Speech Recognition initialization
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, []);

  // Update recognition language on toggle
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLang === 'hi' ? 'hi-IN' : 'en-US';
    }
  }, [speechLang]);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat/history');
        const result = await response.json();
        if (response.ok) {
          setMessages(result.data.history);
        } else {
          setError(result.message || 'Failed to load chat history');
        }
      } catch {
        setError('Error fetching history from server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Speak bot response text
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop active speech

    const cleanText = text.replace(/[*#_`~]/g, ''); // Strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechLang === 'hi' ? 'hi-IN' : 'en-US';

    // Find custom voices for the language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(speechLang === 'hi' ? 'hi' : 'en'));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setError(null);
    setInput('');
    setIsStreaming(true);

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      message: textToSend,
      isBot: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Setup streaming container
    const botMsgId = Math.random().toString();
    const botMsgPlaceholder: ChatMessage = {
      id: botMsgId,
      message: '',
      isBot: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, botMsgPlaceholder]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          sessionToken,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Failed to connect to chatbot server');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Connection failed to capture streaming reader');
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const textChunk = decoder.decode(value);
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.chunk) {
                  accumulatedText += data.chunk;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId ? { ...msg, message: accumulatedText } : msg,
                    ),
                  );
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch {
                // Ignore partial chunks or parse errors
              }
            }
          }
        }
      }

      // Read Bot text aloud if voice output is active
      if (voiceOutput && accumulatedText) {
        speakText(accumulatedText);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred during communication';
      setError(msg);
      // Remove placeholder bot message on failure
      setMessages((prev) => prev.filter((m) => m.id !== botMsgId));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleClearHistory = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                navigate('/');
              }}
              className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Admission AI Advisor
              </h2>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active and Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selection */}
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value as 'en' | 'hi')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>

            {/* Read Aloud Toggle */}
            <button
              onClick={() => {
                if (voiceOutput) {
                  window.speechSynthesis.cancel();
                }
                setVoiceOutput(!voiceOutput);
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                voiceOutput
                  ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-400'
                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-400'
              }`}
              title={voiceOutput ? 'Mute Read-Aloud' : 'Unmute Read-Aloud'}
            >
              {voiceOutput ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-500 hover:text-slate-350 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-6 flex flex-col gap-6 overflow-hidden">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Message Panel */}
        <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-6 min-h-[300px]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-500 text-sm">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto py-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Ask your first question</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Start an academic conversation with our AI Admission Counselor. Click one of the
                  suggested prompts below or enter your own query.
                </p>
              </div>

              {/* Suggestions Cards */}
              <div className="grid grid-cols-1 gap-2.5 w-full pt-4">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="p-3 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 text-left text-xs text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Bot Avatar Icon */}
                  {msg.isBot && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 shadow-md">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed border relative group ${
                      msg.isBot
                        ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                        : 'bg-indigo-600 border-indigo-500 text-white'
                    }`}
                  >
                    {msg.isBot ? (
                      msg.message ? (
                        <div className="space-y-2">
                          <div className="prose prose-invert max-w-none text-slate-200">
                            <ReactMarkdown>{msg.message}</ReactMarkdown>
                          </div>
                          <div className="flex justify-end pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => speakText(msg.message)}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 transition-all cursor-pointer flex items-center gap-1 mt-1 text-[10px]"
                              title="Read Aloud"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* streaming loader */
                        <div className="flex gap-1.5 items-center justify-center py-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-300"></span>
                        </div>
                      )
                    ) : (
                      <span>{msg.message}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Active Stream Loader */}
              {isStreaming && messages[messages.length - 1]?.message === '' && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 shadow-md">
                    AI
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 flex gap-1.5 items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-150"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-300"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Dock */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-3 items-center relative"
        >
          {/* Recording wave visual overlay */}
          {isRecording && (
            <div className="absolute inset-y-0 left-0 right-[60px] bg-indigo-900/10 border border-indigo-500/25 rounded-xl flex items-center px-4 gap-3 select-none pointer-events-none animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs text-indigo-300 font-semibold">
                Listening in {speechLang === 'hi' ? 'Hindi' : 'English'}... Speak now
              </span>
            </div>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={isRecording ? '' : 'Type your message here...'}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          {/* Speech Mic Button */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isStreaming}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              isRecording
                ? 'bg-red-600/15 border-red-500 text-red-400 shadow-lg shadow-red-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
