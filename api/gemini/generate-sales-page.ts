import { GoogleGenAI, Type } from '@google/genai';

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
    ],
    specifications: `Category: ${cleanCat} | Material: Commercial-grade ABS & Stainless Steel | Compatibility: Universal Nigerian Home Standards | Warranty: 7-Day Replacement Guarantee`,
    usageInstructions: `1. Unbox your ${cleanName} and check all included accessories.\n2. Follow the quick-start diagram included in the box.\n3. Enjoy effortless, reliable everyday results!`,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { productName, categoryName, existingDescription, specifications } = req.body || {};

  if (!productName || typeof productName !== 'string' || !productName.trim()) {
    res.status(400).json({ error: 'Product name is required.' });
    return;
  }

  const cleanName = productName.trim();
  const cleanCat = (categoryName || 'Home & Everyday Living').trim();

  if (!process.env.GEMINI_API_KEY) {
    res.json(generateFallbackSalesPage(cleanName, cleanCat));
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are an expert direct-response copywriter for Nigerian ecommerce specializing in high-converting, irresistible single-product sales pages.
Product Name: "${cleanName}"
Category: "${cleanCat}"
Existing Info: "${existingDescription || 'None'}"
Specifications Hint: "${specifications || 'None'}"

Generate a complete, high-converting direct-response sales landing page tailored for Nigerian consumers (Lagos, Abuja, Port Harcourt, Ibadan, etc.). Return structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an elite ecommerce conversion copywriter for the Nigerian market. Return only structured JSON matching the requested schema.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      res.json(JSON.parse(text));
      return;
    }

    res.json(generateFallbackSalesPage(cleanName, cleanCat));
  } catch (error: any) {
    res.json(generateFallbackSalesPage(cleanName, cleanCat));
  }
}
