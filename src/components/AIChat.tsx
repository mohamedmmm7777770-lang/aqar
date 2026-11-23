import { useState, useRef, useEffect } from "react";
import { Send, Map, Bot, User, Loader2, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  chunks?: any[];
  audio?: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      text: "مرحباً! أنا المساعد الذكي الخاص بعقارات. يمكنك سؤالي عن أسعار العقارات، الخدمات المتاحة، المدارس، والمناطق في مدينة كفر البطيخ وضواحيها. كيف يمكنني مساعدتك اليوم؟"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "ما هي أسعار الشقق في وسط البلد؟",
    "هل يوجد فلل للإيجار؟",
    "أين تقع أفضل المدارس هنا؟",
    "ما هي المشاريع الجديدة في كفر البطيخ؟",
  ];

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 1 || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      // 1. Get Text Response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const aiMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { 
        id: aiMessageId, 
        role: "ai", 
        text: data.text,
        chunks: data.chunks
      }]);
      setIsLoading(false); // Stop loading immediately for text

      // 2. Fetch Audio in background
      try {
        const audioResponse = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.text })
        });
        const audioData = await audioResponse.json();
        if (audioData.audio) {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, audio: audioData.audio } : msg
          ));
          const audio = new Audio(`data:audio/wav;base64,${audioData.audio}`);
          audio.play().catch(e => console.error("Auto-play failed:", e));
        }
      } catch (audioErr) {
        console.error("Audio fetch failed:", audioErr);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        text: "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً." 
      }]);
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-assistant" className="py-20 bg-slate-900 text-slate-200 relative overflow-hidden">
      {/* Decorative meshes */}
      <div className="absolute top-1/2 left-0 -ml-64 -mt-64 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 rounded-2xl mb-4 text-emerald-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">المساعد العقاري الذكي</h2>
          <p className="text-slate-400 text-lg">
            مدعوم بالذكاء الاصطناعي وخرائط جوجل ليقدم لك معلومات دقيقة عن كفر البطيخ والمنطقة المحيطة
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] text-slate-800"
        >
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">المستشار العقاري</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> متصل الآن
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'mr-auto flex-row-reverse' : ''}`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-900 text-emerald-400 shadow-md'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-none shadow-md shadow-emerald-500/10' : 'bg-white shadow-sm border border-slate-100 rounded-tl-none'}`}>
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                    
                    {msg.audio && (
                      <div className="mt-3">
                        <audio controls className="w-full max-w-[250px] h-10 outline-none" src={`data:audio/wav;base64,${msg.audio}`} />
                      </div>
                    )}
                    
                    {/* Maps Grounding UI */}
                    {msg.chunks && msg.chunks.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Map className="w-3 h-3" /> مصادر الخرائط
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.chunks.map((chunk, idx) => {
                            if (chunk.maps?.uri && chunk.maps?.title) {
                              return (
                                <a 
                                  key={idx}
                                  href={chunk.maps.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-md transition-colors"
                                >
                                  {chunk.maps.title}
                                </a>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-[85%]"
              >
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 rounded-tl-none flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري التفكير...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors text-right"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="اسأل عن أي مكان أو عقار في كفر البطيخ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-full py-4 px-6 pr-14 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                dir="rtl"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 w-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow"
              >
                <Send className="w-5 h-5 -ml-1 rotate-180" />
              </button>
            </form>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
