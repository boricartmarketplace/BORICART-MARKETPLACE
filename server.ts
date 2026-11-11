import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback high-converting sales page generator (for resilient operation)
function generateFallbackSalesPage(productName: string, categoryName: string = 'General') {
  const cleanName = productName.trim() || 'Everyday Living Innovation';
  const cleanCat = categoryName.trim() || 'Home Essentials';

  return {
    headline: `Experience the Ultimate Ease with ${cleanName} — Built for Nigerian Homes`,
    shortDescription: `Upgrade your daily routine with ${cleanName}. Premium durability, maximum convenience, and 100% Cash on Delivery across Nigeria.`,
    storyHeadline: `The Story: How Nigerian Families Are Finally Taking Control`,
    storyText: `Like many busy Nigerians, Blessing in Ikeja, Lagos was tired of wasting hours and hard-earned money on everyday hassles that never seemed to get solved. Every weekend felt like a struggle with low-quality alternatives that broke down after just two weeks.\n\nEverything changed when she gave Boricart’s ${cleanName} a try. Within minutes of taking it out of the box, she noticed the superior craftsmanship. No complicated setup, no fragile plastic, and no stress.\n\n"I honestly didn't believe it until the courier handed it to me and I inspected it right at my gate before paying," Blessing shared. "Now I recommend it to all my family and friends."`,
    problem: `Most regular products on the market are built with cheap materials that disappoint when you need them most, leaving you frustrated and spending double on replacements.`,
    solution: `Boricart ${cleanName} is engineered specifically for reliability and heavy-duty daily use. Designed with modern ergonomics, it delivers effortless results every single time.`,
    benefits: [
      `Save Hours Every Week: Spend less time on exhausting tasks and more time relaxing with family.`,
      `Engineered for Durability: High-grade materials tested to withstand continuous daily use in Nigerian environments.`,
      `Zero Risk Guarantee: Pay Cash on Delivery after inspecting your order right at your doorstep.`,
      `Energy & Cost Efficient: Designed to deliver maximum results with zero complicated maintenance or ongoing bills.`,
    ],
    urgencyNotice: `⚡ SPECIAL PROMOTION: Up to 35% OFF Today + Pay on Delivery! Only 9 units remaining in our Lagos warehouse.`,
    timerHeadline: `🔥 PROMOTIONAL OFFER EXPIRES IN:`,
    timerHours: 24,
    guaranteeText: `100% Inspection Guarantee: Check your package with the courier before paying. Includes our 7-Day Replacement Warranty.`,
    reviewsList: [
      {
        id: `rev-${Date.now()}-1`,
        author: 'Mrs. Chidinma Okafor',
        location: 'Lekki Phase 1, Lagos',
        rating: 5,
        comment: `Received mine in Lagos within 24 hours. The rider let me open the carton and verify everything before I transferred the money. The quality of this ${cleanName} is 100% top-notch!`,
        date: 'Yesterday',
        verifiedBuyer: true,
      },
      {
        id: `rev-${Date.now()}-2`,
        author: 'Alhaji Ibrahim Danladi',
        location: 'Gwarinpa, Abuja',
        rating: 5,
        comment: `Excellent product and very easy to use. I was skeptical about ordering online, but paying on delivery gave me complete peace of mind. Highly recommended!`,
        date: '3 days ago',
        verifiedBuyer: true,
      },
      {
        id: `rev-${Date.now()}-3`,
        author: 'Engr. Babatunde Adeleke',
        location: 'Bodija, Ibadan',
        rating: 5,
        comment: `My wife loves this so much. Solid build, exactly as described in the pictures. Delivery to Ibadan was super fast.`,
        date: '5 days ago',
        verifiedBuyer: true,
      },
      {
        id: `rev-${Date.now()}-4`,
        author: 'Dr. (Mrs) Nkechi Eze',
        location: 'GRA Phase 2, Port Harcourt',
        rating: 5,
        comment: `Game changer for our home. It has saved us so much stress and time. Worth every single Naira.`,
        date: '1 week ago',
        verifiedBuyer: true,
      },
    ],
    faqsList: [
      {
        id: `faq-1`,
        question: `How does Cash on Delivery work?`,
        answer: `You do not pay a single Naira upfront! When our dispatch courier arrives at your address, you inspect the parcel to confirm everything is in pristine condition before paying with cash or instant bank transfer.`,
      },
      {
        id: `faq-2`,
        question: `How fast is delivery?`,
        answer: `Lagos and Abuja orders are delivered within 24 to 48 hours. Deliveries to other Nigerian states take 2 to 4 business days.`,
      },
      {
        id: `faq-3`,
        question: `What if it doesn't work or gets damaged during transit?`,
        answer: `All Boricart orders come with a 7-Day Replacement Warranty. If anything is amiss, our WhatsApp support team (+2348140008921) will dispatch a brand-new replacement immediately without hassle.`,
      },
      {
        id: `faq-4`,
        question: `Is it difficult to use or set up?`,
        answer: `Not at all! Every unit comes with a clear, step-by-step user guide and pre-assembled parts so you can start using it within 60 seconds of unboxing.`,
      },
    ],
    specifications: `Category: ${cleanCat} | Material: Commercial-grade ABS & Stainless Steel | Compatibility: Universal Nigerian Home Standards | Warranty: 7-Day Replacement Guarantee`,
    usageInstructions: `1. Unbox your ${cleanName} and check all included accessories.\n2. Follow the quick-start diagram included in the box.\n3. Enjoy effortless, reliable everyday results!`,
  };
}

// API Route: AI-Powered Sales Page Generator
app.post('/api/gemini/generate-sales-page', async (req, res) => {
  const { productName, categoryName, existingDescription, specifications } = req.body || {};

  if (!productName || typeof productName !== 'string' || !productName.trim()) {
    res.status(400).json({ error: 'Product name is required.' });
    return;
  }

  const cleanName = productName.trim();
  const cleanCat = (categoryName || 'Home & Everyday Living').trim();

  // If no API key configured, use our tailored fallback
  if (!process.env.GEMINI_API_KEY) {
    const fallback = generateFallbackSalesPage(cleanName, cleanCat);
    res.json(fallback);
    return;
  }

  try {
    const prompt = `You are an expert direct-response copywriter for Nigerian ecommerce specializing in high-converting, irresistible single-product sales pages.
Product Name: "${cleanName}"
Category: "${cleanCat}"
Existing Info: "${existingDescription || 'None'}"
Specifications Hint: "${specifications || 'None'}"

Generate a complete, high-converting direct-response sales landing page tailored for Nigerian consumers (Lagos, Abuja, Port Harcourt, Ibadan, etc.).
Requirements:
1. headline: High-impact, benefit-driven, catchy sales headline.
2. shortDescription: 1-2 punchy sentences summarizing the core transformation.
3. storyHeadline: An engaging title for the relatable story (e.g. "The Story: How Amaka Saved ₦85,000 on Repairs").
4. storyText: A 2-3 paragraph simple, deeply relatable story featuring everyday Nigerian struggles (e.g., busy schedules, traffic, household chores, light/generator issues, stubborn dirt, saving money) where the character discovers this product and experiences relief.
5. problem: The frustrating, exhausting everyday struggle customers experience without this.
6. solution: The Boricart breakthrough solution and why it works effortlessly.
7. benefits: An array of 4-5 bullet points, each starting with a strong bold benefit followed by the payoff.
8. urgencyNotice: An urgent scarcity banner (e.g., "⚡ Special Flash Promo: 35% OFF Today Only + Pay on Delivery! Only 8 units left in Lagos warehouse.").
9. timerHeadline: Urgency countdown headline (e.g., "🔥 LIMITED PROMOTIONAL SALE ENDS IN:").
10. timerHours: Number (e.g. 24).
11. guaranteeText: Reassuring statement about inspecting upon delivery before paying and 7-day warranty.
12. reviewsList: Array of 4 realistic reviews from verified Nigerian buyers with Nigerian names, locations (e.g., Lekki, Gwarinpa, Ikeja, Port Harcourt), 5-star rating, review text, and recent date.
13. faqsList: Array of 4 FAQs handling delivery speed, Cash on Delivery inspection, warranty, and ease of use.
14. specifications: Key: Value | Key: Value formatted string.
15. usageInstructions: Clear 1-2-3 step instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an elite ecommerce conversion copywriter for the Nigerian market. Return only structured JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            shortDescription: { type: Type.STRING },
            storyHeadline: { type: Type.STRING },
            storyText: { type: Type.STRING },
            problem: { type: Type.STRING },
            solution: { type: Type.STRING },
            benefits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            urgencyNotice: { type: Type.STRING },
            timerHeadline: { type: Type.STRING },
            timerHours: { type: Type.NUMBER },
            guaranteeText: { type: Type.STRING },
            reviewsList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  author: { type: Type.STRING },
                  location: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  comment: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ['author', 'location', 'rating', 'comment', 'date'],
              },
            },
            faqsList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
            specifications: { type: Type.STRING },
            usageInstructions: { type: Type.STRING },
          },
          required: [
            'headline',
            'shortDescription',
            'storyHeadline',
            'storyText',
            'problem',
            'solution',
            'benefits',
            'urgencyNotice',
            'timerHeadline',
            'reviewsList',
            'faqsList',
          ],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      // Ensure reviews have IDs
      if (Array.isArray(parsed.reviewsList)) {
        parsed.reviewsList = parsed.reviewsList.map((rev: any, idx: number) => ({
          ...rev,
          id: rev.id || `ai-rev-${Date.now()}-${idx}`,
          verifiedBuyer: true,
        }));
      }
      // Ensure FAQs have IDs
      if (Array.isArray(parsed.faqsList)) {
        parsed.faqsList = parsed.faqsList.map((faq: any, idx: number) => ({
          ...faq,
          id: faq.id || `ai-faq-${Date.now()}-${idx}`,
        }));
      }
      res.json(parsed);
      return;
    }

    res.json(generateFallbackSalesPage(cleanName, cleanCat));
  } catch (error: any) {
    console.error('Gemini sales page generation error:', error);
    // Graceful fallback to guarantee zero frontend disruption
    const fallback = generateFallbackSalesPage(cleanName, cleanCat);
    res.json(fallback);
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for any client SPA routes in development
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve('index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Boricart full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
