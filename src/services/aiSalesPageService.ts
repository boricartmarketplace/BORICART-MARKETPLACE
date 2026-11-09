import { Product, ProductReview, ProductFaq } from '../types';

export interface GeneratedSalesPageData {
  headline: string;
  shortDescription: string;
  storyHeadline: string;
  storyText: string;
  problem: string;
  solution: string;
  benefits: string[];
  urgencyNotice: string;
  timerHeadline: string;
  timerHours: number;
  guaranteeText?: string;
  reviewsList: ProductReview[];
  faqsList: ProductFaq[];
  specifications?: string;
  usageInstructions?: string;
}

/**
 * Calls server-side Gemini API to generate an irresistible, high-converting
 * direct-response sales page for Nigerian consumers.
 */
export async function generateSalesPageWithAI(params: {
  productName: string;
  categoryName?: string;
  existingDescription?: string;
  specifications?: string;
}): Promise<GeneratedSalesPageData> {
  const response = await fetch('/api/gemini/generate-sales-page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate sales page (Status: ${response.status})`);
  }

  const data: GeneratedSalesPageData = await response.json();
  return data;
}
