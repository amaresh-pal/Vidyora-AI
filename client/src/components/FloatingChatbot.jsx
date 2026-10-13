import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { aiAPI } from '../services/api';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useVoiceOutput } from '../hooks/useVoiceOutput';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  BrainCircuit,
  Volume2,
  VolumeX,
  Maximize2,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Languages,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Mic,
  MicOff,
  Image as ImageIcon,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cleanChatbotText, PointToPointResponse } from '../utils/formatChatResponse';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(lang || 'or');
  const [loading, setLoading] = useState(false);
  const [showSavedPicker, setShowSavedPicker] = useState(false);

  // Auto-close chat if user logs out
  useEffect(() => {
    if (!user && isOpen) {
      setIsOpen(false);
    }
  }, [user, isOpen]);

  // Voice Input (Microphone) & Output (Text-to-Speech)
  const {
    isListening,
    startListening,
    stopListening,
    toggleListening,
    error: voiceError
  } = useVoiceInput();

  const { isSpeaking, speakingId, speak, stop: stopSpeaking } = useVoiceOutput();

  const getSavedQuestions = (l) => [
    {
      label: l === 'or' ? '🌿 ଆଲୋକ ଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟା ବୁଝାନ୍ତୁ' : '🌿 Explain Photosynthesis in simple words with formula',
      query: 'Explain Photosynthesis in simple Odia and English with chemical equation and key stages',
    },
    {
      label: l === 'or' ? '🚀 ନ୍ୟୁଟନଙ୍କ ଗତି ନିୟମଗୁଡ଼ିକ କ’ଣ?' : "🚀 Explain Newton's Three Laws of Motion with real-life examples",
      query: "Explain Newton's Three Laws of Motion with daily life examples and formulas",
    },
    {
      label: l === 'or' ? '📐 ପିଥାଗୋରାସ ଉପପାଦ୍ୟ ଏବଂ ସୂତ୍ର' : '📐 Explain Pythagoras Theorem with formula and diagram example',
      query: 'Explain Pythagoras Theorem step-by-step with right angled triangle formula',
    },
    {
      label: l === 'or' ? '🔬 ଉଦ୍ଭିଦ ଓ ପ୍ରାଣୀ କୋଷ ମଧ୍ୟରେ ପାର୍ଥକ୍ୟ' : '🔬 Difference between Plant Cell and Animal Cell',
      query: 'What are the main differences between Plant Cell and Animal Cell in Class 8 Science?',
    },
    {
      label: l === 'or' ? '🤖 ଏଆଇ (AI) କିପରି ପାଠପଢାରେ ସାହାଯ୍ୟ କରେ?' : '🤖 What is Artificial Intelligence and how does it help students?',
      query: 'Explain what is Artificial Intelligence in simple terms for school students',
    },
  ];

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: lang === 'or'
        ? `ନମସ୍କାର! ମୁଁ ବିଦ୍ୟୋରା ଏଆଇ ଶିକ୍ଷକ । ଆପଣ ତଳେ ଥିବା ଯେକୌଣସି ସାଇତି ରଖାଯାଇଥିବା ପ୍ରଶ୍ନ ଉପରେ କ୍ଲିକ୍ କରିପାରିବେ, ମାଇକ୍ 🎤 ବଟନ୍ ଦବାଇ କଥା କହିପାରିବେ, କିମ୍ବା ନିଜର ପ୍ରଶ୍ନ ଟାଇପ୍ କରି ପଚାରିପାରିବେ:`
        : `Hello! I am your Vidyora AI Tutor. Tap any pre-saved question below, use the microphone 🎤 to speak, or type your own question anytime:`,
      showSavedQuestions: true,
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading, showSavedPicker]);

  const handleSendMessage = async (textToSend) => {
    // Extra safety guard: require login
    if (!user) {
      setIsOpen(false);
      navigate('/login');
      return;
    }

    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    if (isListening) stopListening();
    setShowSavedPicker(false);

    const userMsg = {
      role: 'user',
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await aiAPI.askChat({
        message: query.trim(),
        language: selectedLanguage,
        classLevel: user?.classLevel || 'Class 8',
        subject: 'General',
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: cleanChatbotText(res.data.explanation),
          language: res.data.language,
          workflowSteps: res.data.workflowSteps,
          diagram: res.data.diagram,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, could not process doubt right now. Please check server connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        role: 'assistant',
        content: selectedLanguage === 'or'
          ? `ନମସ୍କାର! ମୁଁ ବିଦ୍ୟୋରା ଏଆଇ ଶିକ୍ଷକ । ଆପଣ ତଳେ ଥିବା ଯେକୌଣସି ସାଇତି ରଖାଯାଇଥିବା ପ୍ରଶ୍ନ ଉପରେ କ୍ଲିକ୍ କରିପାରିବେ, କିମ୍ବା ନିଜର ପ୍ରଶ୍ନ ଟାଇପ୍ କରି ପଚାରିପାରିବେ:`
          : `Hello! I am your Vidyora AI Tutor. Tap any pre-saved question below to get an instant explanation, or type your own question anytime:`,
        showSavedQuestions: true,
      },
    ]);
  };

  const handleLauncherClick = () => {
    if (!user) {
      // Without login, automatically move to sign-in page
      navigate('/login');
      return;
    }
    setIsOpen(true);
  };

  const savedList = getSavedQuestions(selectedLanguage);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50">
      
      {/* Floating Action Launcher Button with Mascot Avatar Image */}
      {!isOpen && (
        <button
          onClick={handleLauncherClick}
          className="group px-3 py-2 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-brand-navy via-brand-navyLight to-slate-900 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 sm:gap-3 border-2 border-brand-teal/50 cursor-pointer shadow-brand-teal/20"
          title={user ? "Open Vidyora AI Assistant" : "Sign in to access Vidyora AI Assistant"}
        >
          {/* Avatar Image */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-brand-navy p-0.5 border-2 border-brand-teal shadow-md flex items-center justify-center">
              <img
                src="/chatbot-avatar.png"
                alt="Vidyora AI Robot Tutor"
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            {user ? (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-brand-navy" />
              </>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black border-2 border-brand-navy shadow-xs">
                🔒
              </span>
            )}
          </div>

          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black tracking-wide leading-none text-white">
                Vidyora AI
              </p>
              {!user && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40">
                  Login Req.
                </span>
              )}
            </div>
            <p className="text-[10px] text-brand-teal font-medium mt-0.5">
              {user
                ? (lang === 'or' ? 'ଭଏସ୍ ଓ ଏଆଇ ଶିକ୍ଷକ' : 'Voice & AI Doubt Solver')
                : (lang === 'or' ? 'ଲଗ୍-ଇନ୍ କରି ଆକ୍ସେସ୍ କରନ୍ତୁ ➔' : 'Sign in to access ➔')}
            </p>
          </div>
        </button>
      )}

      {/* Main Chat Popup Card */}
      {isOpen && user && (
        <div className="w-[calc(100vw-24px)] sm:w-[410px] h-[540px] max-h-[calc(100vh-140px)] rounded-3xl bg-white shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header Bar with Bot Avatar Image */}
          <div className="p-4 bg-gradient-to-r from-brand-navy via-brand-navyLight to-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-brand-navy border border-brand-teal/40 shadow-sm shrink-0 p-0.5">
                <img
                  src="/chatbot-avatar.png"
                  alt="Vidyora AI"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  <span>Vidyora AI Tutor</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal font-bold uppercase">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300">
                  {lang === 'or' ? 'ଭଏସ୍ ସହ ଓଡ଼ିଆ ଓ ଇଂରାଜୀ ଶିକ୍ଷଣ' : 'Voice-Enabled Bilingual AI'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switch */}
              <button
                onClick={() => setSelectedLanguage(selectedLanguage === 'or' ? 'en' : 'or')}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-colors cursor-pointer"
                title="Switch Language"
              >
                {selectedLanguage === 'or' ? 'ଓଡ଼ିଆ' : 'EN'}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Full Tutor Page Link */}
              <button
                onClick={() => { setIsOpen(false); navigate('/tutor'); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Open Fullscreen Studio"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => { setIsOpen(false); stopSpeaking(); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[92%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.role === 'assistant' && (
                    <img
                      src="/chatbot-avatar.png"
                      alt="AI Mascot"
                      className="w-7 h-7 rounded-full border border-brand-teal/40 shadow-xs shrink-0 mt-0.5"
                    />
                  )}

                  <div
                    className={`p-4 rounded-2xl text-sm sm:text-base leading-relaxed space-y-2.5 ${
                      m.role === 'user'
                        ? 'bg-brand-navy text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <PointToPointResponse content={m.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}

                    {/* Attached Visual / Diagram Preview */}
                    {m.diagram && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-brand-teal">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-brand-orange" />
                            <span className="capitalize">{m.diagram.topic}</span>
                          </span>
                          <button
                            onClick={() => { setIsOpen(false); navigate('/scanner'); }}
                            className="text-[10px] text-slate-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-md transition-all"
                          >
                            <span>Open Studio</span> ➔
                          </button>
                        </div>

                        {/* Real Photorealistic AI Image */}
                        {(m.diagram.imageUrl || m.diagram.photoUrl) && (
                          <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[16/10] max-h-52 flex items-center justify-center group shadow-md">
                            <img
                              src={m.diagram.imageUrl || m.diagram.photoUrl}
                              alt={m.diagram.topic}
                              className="w-full h-full object-cover rounded-xl group-hover:scale-102 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                if (m.diagram.photoUrl && e.target.src !== m.diagram.photoUrl) {
                                  e.target.src = m.diagram.photoUrl;
                                }
                              }}
                            />
                            <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-md text-brand-teal font-bold border border-slate-700">
                              📸 HD AI Visual
                            </div>
                          </div>
                        )}

                        {m.diagram.caption && (
                          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                            {selectedLanguage === 'or' ? (m.diagram.captionOdia || m.diagram.caption) : m.diagram.caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pre-saved interactive questions inside chat */}
                    {m.showSavedQuestions && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-brand-teal" />
                          <span>{selectedLanguage === 'or' ? 'ସାଇତି ରଖାଯାଇଥିବା ପ୍ରଶ୍ନ (କ୍ଲିକ୍ କରନ୍ତୁ):' : 'Pre-saved Questions (Tap to ask):'}</span>
                        </div>
                        {savedList.slice(0, 3).map((sq, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sq.query)}
                            className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-brand-teal/10 hover:border-brand-teal border border-slate-200 text-[11px] font-semibold text-brand-navy transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <span className="line-clamp-1">{sq.label}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-brand-teal shrink-0 ml-1" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assistant Audio Action Button */}
                {m.role === 'assistant' && (
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 pl-9">
                    <button
                      onClick={() => speak(cleanChatbotText(m.content), `chat_${idx}`, selectedLanguage)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        speakingId === `chat_${idx}`
                          ? 'text-brand-teal font-bold animate-pulse'
                          : 'hover:text-brand-teal'
                      }`}
                    >
                      {speakingId === `chat_${idx}` ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>{speakingId === `chat_${idx}` ? 'Stop Audio' : 'Listen (ଶୁଣନ୍ତୁ)'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-brand-teal font-semibold shadow-2xs">
                <img
                  src="/chatbot-avatar.png"
                  alt="Thinking"
                  className="w-5 h-5 rounded-full animate-bounce shrink-0"
                />
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking in {selectedLanguage === 'or' ? 'Odia' : 'English'}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Drawer for Pre-saved questions on demand */}
          {showSavedPicker && (
            <div className="p-3 bg-slate-100 border-t border-slate-200 max-h-48 overflow-y-auto space-y-1.5 text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-[11px] text-brand-navy flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose any pre-saved question:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSavedPicker(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              {savedList.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(sq.query)}
                  className="w-full text-left p-2 rounded-xl bg-white hover:bg-brand-teal/10 hover:border-brand-teal border border-slate-200 text-xs font-semibold text-brand-navy transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>{sq.label}</span>
                  <ArrowRight className="w-3 h-3 text-brand-teal shrink-0 ml-1" />
                </button>
              ))}
            </div>
          )}

          {/* Voice Listening Active Indicator Banner */}
          {isListening && (
            <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-[11px] font-bold text-rose-700 animate-pulse">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>{selectedLanguage === 'or' ? 'କୁହନ୍ତୁ... (Listening...)' : 'Listening... Speak question now'}</span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded hover:bg-rose-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {voiceError && (
            <div className="px-3 py-1 bg-rose-50 border-t border-rose-200 text-[10px] text-rose-600">
              {voiceError}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-1.5">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-1.5"
            >
              {/* Toggle Saved Questions Picker */}
              <button
                type="button"
                onClick={() => setShowSavedPicker(!showSavedPicker)}
                className={`p-2 rounded-xl border text-xs transition-colors shrink-0 cursor-pointer ${
                  showSavedPicker
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="View all pre-saved questions"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedLanguage === 'or' ? 'ଏଠାରେ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ ବା ମାଇକ୍ ଦବାନ୍ତୁ...' : 'Type or speak your question...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-teal/40 outline-none"
              />

              {/* Microphone Voice Input Button */}
              <button
                type="button"
                onClick={() => toggleListening({
                  lang: selectedLanguage,
                  onTranscript: (txt) => setInputMessage(txt),
                })}
                className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-brand-teal/15 hover:text-brand-teal'
                }`}
                title={isListening ? 'Stop Listening' : 'Speak Question with Microphone (ଭଏସ୍)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2 rounded-xl bg-brand-navy text-white hover:bg-brand-navyLight disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                title="Send Question"
              >
                <Send className="w-4 h-4 text-brand-teal" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>💡 Tap 💡 for saved, 🎤 to speak</span>
              <span>Regional AI Tutor</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
