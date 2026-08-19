import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory Cloud Database store (synced across devices by syncKey)
const cloudDatabase: Record<string, { data: any; updatedAt: string; deviceCount: number }> = {};

// Lazy-safe Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), cloudUsers: Object.keys(cloudDatabase).length });
  });

  // 2. Cloud Sync Endpoints
  app.post('/api/sync/push', (req: Request, res: Response) => {
    try {
      const { syncKey, data } = req.body;
      if (!syncKey || typeof syncKey !== 'string') {
        return res.status(400).json({ error: 'Geçersiz Senkronizasyon Anahtarı (syncKey)' });
      }

      const existing = cloudDatabase[syncKey];
      const deviceCount = existing ? (existing.deviceCount || 1) : 1;

      cloudDatabase[syncKey] = {
        data,
        updatedAt: new Date().toISOString(),
        deviceCount: deviceCount
      };

      res.json({
        success: true,
        message: 'Veriler güvenli bulut sunucusuna başarıyla yüklendi.',
        syncedAt: cloudDatabase[syncKey].updatedAt,
        syncKey
      });
    } catch (err: any) {
      console.error('Cloud Sync Push Error:', err);
      res.status(500).json({ error: 'Bulut senkronizasyonu sırasında bir hata oluştu.' });
    }
  });

  app.get('/api/sync/pull/:syncKey', (req: Request, res: Response) => {
    try {
      const { syncKey } = req.params;
      if (!syncKey) {
        return res.status(400).json({ error: 'Senkronizasyon anahtarı belirtilmedi.' });
      }

      const entry = cloudDatabase[syncKey];
      if (!entry) {
        return res.status(404).json({
          found: false,
          message: 'Bu anahtara ait henüz bulut verisi bulunamadı. İlk verinizi yükleyebilirsiniz.'
        });
      }

      res.json({
        found: true,
        data: entry.data,
        updatedAt: entry.updatedAt
      });
    } catch (err: any) {
      console.error('Cloud Sync Pull Error:', err);
      res.status(500).json({ error: 'Bulut verisi çekilirken bir hata oluştu.' });
    }
  });

  // 3. Gemini AI Smart Savings Advisor & Financial Coach
  app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
    try {
      const ai = getGeminiClient();
      const { transactions, bills, goals, monthlyIncome, currency } = req.body;

      if (!ai) {
        // Fallback rule-based smart advisor if no key is configured
        const totalExp = transactions?.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0) || 0;
        const totalInc = transactions?.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0) || monthlyIncome || 1;
        const savingsRate = Math.max(0, Math.round(((totalInc - totalExp) / totalInc) * 100));

        return res.json({
          savingsScore: Math.min(100, Math.max(30, savingsRate + 30)),
          summary: `Mevcut finansal tablonuzda aylık tasarruf oranınız yaklaşık %${savingsRate}. Harcamalarınızın büyük kısmını sabit giderler ve yeme-içme kalemleri oluşturuyor.`,
          topInsights: [
            `Aylık net gelirinizin %${100 - savingsRate} kadarı giderlere ayrılıyor.`,
            `Yaklaşan ${bills?.filter((b: any) => !b.isPaid).length || 0} adet ödenmemiş faturanız bulunuyor.`,
            `Hedeflerinize ulaşmak için 50/30/20 kuralına göre istek harcamalarını %15 kısabilirsiniz.`
          ],
          actionableTips: [
            {
              title: 'Abonelik ve Fatura Detoksu',
              description: 'Kullanmadığınız dijital üyelikleri ve fatura tarife aşım ücretlerini kontrol edin.',
              potentialMonthlySaving: 450,
              difficulty: 'kolay'
            },
            {
              title: 'Haftalık Yemek Planlaması',
              description: 'Dışarıdan sipariş yerine haftalık market listesi ile porsiyon hazırlığı yapın.',
              potentialMonthlySaving: 1800,
              difficulty: 'orta'
            },
            {
              title: 'Otomatik Hedefe Aktarma',
              description: 'Maaş gününde doğrudan tasarruf hedefinize %15 otomatik virman yapın.',
              potentialMonthlySaving: 3500,
              difficulty: 'kolay'
            }
          ],
          budgetAlerts: [
            totalExp > totalInc ? 'Dikkat: Harcamalarınız bu ay gelirinizi aşmış durumda!' : 'Giderleriniz gelir limitinizin altında ilerliyor.'
          ],
          motivationalQuote: 'Küçük tasarruflar, büyük özgürlüklerin temel taşıdır. Her gün bir adım!'
        });
      }

      const prompt = `
Aşağıdaki finansal verileri incele ve kullanıcıya Türkçe, samimi, son derece motive edici, nokta atışı tasarruf ve bütçe tavsiyesi üret.
Para Birimi: ${currency || 'TRY'}
Aylık Gelir: ${monthlyIncome || 0}
İşlemler (Son Harcamalar & Gelirler): ${JSON.stringify(transactions?.slice(0, 20) || [])}
Faturalar / Düzenli Ödemeler: ${JSON.stringify(bills || [])}
Tasarruf Hedefleri: ${JSON.stringify(goals || [])}

Lütfen JSON şemasına harfiyen uyarak yanıt ver.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Sen Türkiye şartlarına ve modern kişisel finans yönetimine hakim, kullanıcıyı tasarrufa teşvik eden, gereksiz harcama tuzaklarını tespit eden samimi ve uzman bir AI Finans Koçusun.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              savingsScore: { type: Type.NUMBER, description: '0 ile 100 arasında finansal sağlık ve tasarruf puanı' },
              summary: { type: Type.STRING, description: '1-2 cümlelik genel değerlendirme özeti' },
              topInsights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'En önemli 3 finansal tespit veya harcama kaçağı'
              },
              actionableTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    potentialMonthlySaving: { type: Type.NUMBER },
                    difficulty: { type: Type.STRING, enum: ['kolay', 'orta', 'ileri'] }
                  },
                  required: ['title', 'description', 'potentialMonthlySaving', 'difficulty']
                }
              },
              budgetAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Kritik uyarılar (örn: yaklasan faturalar, limit asimlari)'
              },
              motivationalQuote: { type: Type.STRING, description: 'Günün tasarruf aforizması' }
            },
            required: ['savingsScore', 'summary', 'topInsights', 'actionableTips', 'budgetAlerts', 'motivationalQuote']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Advisor Error:', err);
      res.status(500).json({ error: 'AI tavsiyesi oluşturulurken bir sorun oluştu.' });
    }
  });

  // 4. Gemini Interactive Financial Coach Chat
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Mesaj boş olamaz.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          reply: 'Tasarruf ve harcama tavsiyeleri için harcamalarınızı kategorilere ayırarak başlayabilirsiniz. En hızlı tasarruf genelde dışarıda yeme-içme ve abonelik denetimleriyle sağlanır!'
        });
      }

      const promptContext = `
Kullanıcının Finansal Veri Özeti:
- Para Birimi: ${context?.currency || 'TRY'}
- Toplam Gelir: ${context?.totalIncome || 0}
- Toplam Harcama: ${context?.totalExpense || 0}
- Net Kalan: ${(context?.totalIncome || 0) - (context?.totalExpense || 0)}
- Hedefler: ${JSON.stringify(context?.goalsSummary || [])}
- Ödenmemiş Faturalar: ${JSON.stringify(context?.pendingBills || [])}

Kullanıcı Sorusu / İsteği: "${message}"

Lütfen Türkçe, anlaşılır, pratik, moral verici ve uygulanabilir bir finans koçu tavsiyesi ver. Markdown listeleri kullanabilirsin.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: promptContext,
        config: {
          systemInstruction: 'Sen kullanıcıların bütçelerini yönetmelerine, gereksiz harcamaları kısmalarına ve tasarruf hedeflerine sadık kalmalarına yardım eden pozitif ve disiplinli bir finans koçusun.'
        }
      });

      res.json({ reply: response.text || 'Tasarruf yolculuğunuzda disiplin en büyük gücünüzdür!' });
    } catch (err: any) {
      console.error('Gemini Chat Error:', err);
      res.status(500).json({ error: 'Cevap üretilirken bir hata oluştu.' });
    }
  });

  // 5. Vite Middleware or Static Assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ParaPusula Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
