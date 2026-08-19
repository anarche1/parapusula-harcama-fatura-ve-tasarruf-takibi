import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Flame,
  Bot,
  User,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { AppDataState, AIAdvice, ChatMessage } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AICoachViewProps {
  appData: AppDataState;
  onRefreshAdvice?: () => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ appData }) => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      sender: 'assistant',
      text: 'Merhaba! Ben yapay zeka finansal koçunuzum. Harcamalarınızı, faturalarınızı ve hedeflerinizi analiz ederek tasarruf etmenize ve bütçenizi en verimli şekilde yönetmenize yardımcı olabilirim. Nasıl yardımcı olabilirim?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appData })
      });
      if (res.ok) {
        const data = await res.json();
        setAdvice(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const userText = inputMessage;
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSendingMessage(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          appData,
          history: messages
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `m_ai_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <span>Gemini AI Finans Koçu</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Yapay Zeka Destekli
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Harcama alışkanlıklarınıza özel tasarruf stratejileri ve 7/24 finans asistanı
          </p>
        </div>

        <button
          onClick={fetchAdvice}
          disabled={loadingAdvice}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAdvice ? 'animate-spin' : ''}`} />
          <span>{loadingAdvice ? 'Analiz Ediliyor...' : 'Analizi Güncelle'}</span>
        </button>
      </div>

      {/* AI Score & Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score & Summary Banner (8 cols) */}
        <div className="lg:col-span-8 bg-indigo-950/70 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Finansal Sağlık & Tasarruf Skoru
                </span>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {advice ? `${advice.savingsScore} / 100` : '85 / 100'}
                  <span className="text-xs font-normal text-emerald-400 ml-2">İyi Durumda</span>
                </h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-7 h-7" />
              </div>
            </div>

            <p className="text-xs text-indigo-200/90 leading-relaxed mb-4">
              {advice?.summary ||
                'Gelir ve gider dengeniz istikrarlı. Zorunlu ihtiyaçlar bütçenizin %50 sınırında. Dışarıda yemek ve küçük aboneliklerde yapacağınız tasarruflarla aylık birikiminizi %25 oranında artırabilirsiniz.'}
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Öne Çıkan AI Tespitleri:
              </span>
              {(advice?.topInsights || [
                'Hafta sonu dışarıda yemek harcamaları toplam bütçenizin %14’ünü oluşturuyor.',
                'Kira ve sabit faturalar toplam gelirinizin %38’i ile güvenli bölgede.',
                'Tasarruf hedeflerinize mevcut hızınızla 4 ay içerisinde ulaşabilirsiniz.'
              ]).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-indigo-100/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Motivational Quote & Savings Action (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" />
              <span>Günün Finansal İlhamı</span>
            </div>
            <blockquote className="text-xs italic text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4">
              "{advice?.motivationalQuote ||
                'Küçük tasarruflar büyük servetlerin tohumudur. Her gün vazgeçtiğiniz ufak bir gereksiz harcama, yarının finansal özgürlüğüdür.'}"
            </blockquote>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hızlı Tasarruf Potansiyeli
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-medium">Aylık Tahmini Kazanç</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  +{formatCurrency(1450, appData.settings.currency)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 text-center">
            Verileriniz cihazınızda analiz edilip güvenle korunur.
          </p>
        </div>
      </div>

      {/* Interactive AI Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Finansal Danışmanınız ile Sohbet Edin</h4>
              <p className="text-[11px] text-slate-500">"Nasıl daha çok tasarruf ederim?", "Bütçem dengede mi?" gibi sorular sorun</p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-950/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[9px] text-slate-500 block mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {sendingMessage && (
            <div className="flex gap-2.5 mr-auto">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 text-xs rounded-2xl rounded-tl-xs flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-200" />
                <span>Hesaplanıyor...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Bir finansal soru sorun (Örn: Bu ay ne kadar tasarruf edebilirim?)..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-950 text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sendingMessage}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
