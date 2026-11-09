import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Star,
  Check,
  Plus,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Clock,
  Flame,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Product, Category, ProductReview, ProductFaq } from '../../types';
import { slugify, uploadProductImage } from '../../firebase/services';
import { generateSalesPageWithAI } from '../../services/aiSalesPageService';

interface ProductFormModalProps {
  product?: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product> & { name: string }) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}) => {
  // Navigation tabs inside modal for clean organization
  const [activeTab, setActiveTab] = useState<'basics' | 'sales_page' | 'reviews_faqs' | 'pricing' | 'specs'>('basics');

  // Core Basic Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [regularPrice, setRegularPrice] = useState<number | ''>('');
  const [promotionalPrice, setPromotionalPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [showInHeroAds, setShowInHeroAds] = useState(false);
  const [heroAdBadge, setHeroAdBadge] = useState('');
  const [heroAdHeadline, setHeroAdHeadline] = useState('');
  const [productType, setProductType] = useState<'physical' | 'digital' | 'bundle' | 'service'>('physical');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [adSpend, setAdSpend] = useState<number | ''>('');
  const [offlinePrice, setOfflinePrice] = useState<number | ''>('');

  // Sales Page & Direct Response Fields
  const [headline, setHeadline] = useState('');
  const [storyHeadline, setStoryHeadline] = useState('');
  const [storyText, setStoryText] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [urgencyNotice, setUrgencyNotice] = useState('');
  const [enableTimer, setEnableTimer] = useState(true);
  const [timerHeadline, setTimerHeadline] = useState('🔥 LIMITED PROMOTIONAL SALE ENDS IN:');
  const [timerHours, setTimerHours] = useState<number>(24);
  const [guaranteeText, setGuaranteeText] = useState('100% Cash on Delivery: Inspect your parcel upon arrival before paying. 7-Day Replacement Warranty.');

  // Customer Reviews & FAQs State
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [faqsList, setFaqsList] = useState<ProductFaq[]>([]);

  // AI Generator state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setSku(product.sku);
      setCategoryId(product.categoryId);
      setCategoryName(product.categoryName);
      setRegularPrice(product.regularPrice);
      setPromotionalPrice(product.promotionalPrice || '');
      setStockQuantity(product.stockQuantity);
      setStockStatus(product.stockStatus);
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setSpecifications(product.specifications || '');
      setUsageInstructions(product.usageInstructions || '');
      setTagsInput(product.tags?.join(', ') || '');
      setStatus(product.status);
      setIsFeatured(product.isFeatured);
      setIsBestSeller(product.isBestSeller);
      setShowInHeroAds(Boolean(product.showInHeroAds));
      setHeroAdBadge(product.heroAdBadge || '');
      setHeroAdHeadline(product.heroAdHeadline || '');
      setProductType(product.productType || 'physical');
      setCostPrice(product.costPrice ?? '');
      setAdSpend(product.adSpend ?? '');
      setOfflinePrice(product.offlinePrice ?? '');
      setImages(product.images || [product.mainImage]);
      setMainImage(product.mainImage);

      // Sales landing page fields
      setHeadline(product.headline || '');
      setStoryHeadline(product.storyHeadline || '');
      setStoryText(product.storyText || '');
      setProblem(product.problem || '');
      setSolution(product.solution || '');
      setBenefitsList(product.benefits && product.benefits.length > 0 ? product.benefits : []);
      setUrgencyNotice(product.urgencyNotice || '⚡ Special Flash Sale: Up to 35% OFF Today + Pay on Delivery!');
      setEnableTimer(product.enableTimer !== undefined ? product.enableTimer : true);
      setTimerHeadline(product.timerHeadline || '🔥 LIMITED PROMOTIONAL SALE ENDS IN:');
      setTimerHours(product.timerHours || 24);
      setGuaranteeText(product.guaranteeText || '100% Cash on Delivery: Inspect your parcel upon arrival before paying.');
      setReviewsList(product.reviewsList || []);
      setFaqsList(product.faqsList || []);
    } else {
      // Defaults for new product
      setName('');
      setSlug('');
      setSku(`BC-${Date.now().toString().slice(-5)}`);
      setCategoryId(categories[0]?.id || '');
      setCategoryName(categories[0]?.name || '');
      setRegularPrice('');
      setPromotionalPrice('');
      setCostPrice('');
      setAdSpend('');
      setOfflinePrice('');
      setProductType('physical');
      setStockQuantity(20);
      setStockStatus('in_stock');
      setShortDescription('');
      setDescription('');
      setSpecifications('');
      setUsageInstructions('');
      setTagsInput('');
      setStatus('published');
      setIsFeatured(false);
      setIsBestSeller(false);
      setShowInHeroAds(false);
      setHeroAdBadge('');
      setHeroAdHeadline('');
      setImages([]);
      setMainImage('');

      // Sales landing page defaults
      setHeadline('');
      setStoryHeadline('');
      setStoryText('');
      setProblem('');
      setSolution('');
      setBenefitsList([]);
      setUrgencyNotice('⚡ Special Flash Sale: Up to 35% OFF Today + Pay on Delivery!');
      setEnableTimer(true);
      setTimerHeadline('🔥 LIMITED PROMOTIONAL SALE ENDS IN:');
      setTimerHours(24);
      setGuaranteeText('100% Cash on Delivery: Inspect your package with the courier before paying.');
      setReviewsList([]);
      setFaqsList([]);
    }
    setErrorMessage(null);
    setAiSuccessMessage(null);
    setActiveTab('basics');
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) {
      setSlug(slugify(val));
    }
  };

  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    const found = categories.find((c) => c.id === catId);
    if (found) {
      setCategoryName(found.name);
    }
  };

  // AI-Powered Sales Page Auto-Generation
  const handleGenerateSalesPage = async (forceName?: string) => {
    const targetName = (forceName || name).trim();
    if (!targetName) {
      setErrorMessage('Please enter the Product Name first so the AI can generate tailored copy.');
      return;
    }

    setIsGeneratingAI(true);
    setErrorMessage(null);
    setAiSuccessMessage(null);

    try {
      const generated = await generateSalesPageWithAI({
        productName: targetName,
        categoryName,
        existingDescription: description || shortDescription,
        specifications,
      });

      // Populate sales landing page fields
      if (generated.headline) setHeadline(generated.headline);
      if (generated.shortDescription && !shortDescription) setShortDescription(generated.shortDescription);
      if (generated.storyHeadline) setStoryHeadline(generated.storyHeadline);
      if (generated.storyText) setStoryText(generated.storyText);
      if (generated.problem) setProblem(generated.problem);
      if (generated.solution) setSolution(generated.solution);
      if (generated.benefits && generated.benefits.length > 0) setBenefitsList(generated.benefits);
      if (generated.urgencyNotice) setUrgencyNotice(generated.urgencyNotice);
      if (generated.timerHeadline) setTimerHeadline(generated.timerHeadline);
      if (generated.timerHours) setTimerHours(generated.timerHours);
      if (generated.guaranteeText) setGuaranteeText(generated.guaranteeText);
      if (generated.reviewsList && generated.reviewsList.length > 0) setReviewsList(generated.reviewsList);
      if (generated.faqsList && generated.faqsList.length > 0) setFaqsList(generated.faqsList);
      if (generated.specifications && !specifications) setSpecifications(generated.specifications);
      if (generated.usageInstructions && !usageInstructions) setUsageInstructions(generated.usageInstructions);

      setAiSuccessMessage(`✨ AI has generated a compelling sales story, urgency hooks, ${generated.reviewsList?.length || 4} verified customer reviews, and FAQs for "${targetName}"!`);
      // Auto-switch to the Sales Page tab so admin can review and edit
      setActiveTab('sales_page');
    } catch (err: any) {
      console.error('AI generation error:', err);
      setErrorMessage('Failed to connect to AI generator. You can still fill out the sales page fields manually.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Benefit item handlers
  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setBenefitsList([...benefitsList, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList(benefitsList.filter((_, i) => i !== index));
  };

  // Review item handlers
  const handleAddReview = () => {
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: 'Nigerian Customer',
      location: 'Lagos, Nigeria',
      rating: 5,
      comment: 'Excellent product and arrived very fast with Cash on Delivery.',
      date: 'Recent',
      verifiedBuyer: true,
    };
    setReviewsList([newRev, ...reviewsList]);
  };

  const handleUpdateReview = (id: string, field: keyof ProductReview, value: any) => {
    setReviewsList(
      reviewsList.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveReview = (id: string) => {
    setReviewsList(reviewsList.filter((r) => r.id !== id));
  };

  // FAQ item handlers
  const handleAddFaq = () => {
    const newFaq: ProductFaq = {
      id: `faq-${Date.now()}`,
      question: 'Can I pay on delivery?',
      answer: 'Yes, 100% Cash on Delivery available nationwide. You inspect before paying.',
    };
    setFaqsList([...faqsList, newFaq]);
  };

  const handleUpdateFaq = (id: string, field: keyof ProductFaq, value: string) => {
    setFaqsList(
      faqsList.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleRemoveFaq = (id: string) => {
    setFaqsList(faqsList.filter((f) => f.id !== id));
  };

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const uploadPromises: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        uploadPromises.push(uploadProductImage(files[i]));
      }

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);

      if (!mainImage && newImages.length > 0) {
        setMainImage(newImages[0]);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setErrorMessage('Could not upload image. You can also paste an image URL directly.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (urlInput.trim()) {
      const newImages = [...images, urlInput.trim()];
      setImages(newImages);
      if (!mainImage) {
        setMainImage(urlInput.trim());
      }
      setUrlInput('');
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    const filtered = images.filter((img) => img !== imgUrl);
    setImages(filtered);
    if (mainImage === imgUrl) {
      setMainImage(filtered[0] || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (!regularPrice || Number(regularPrice) <= 0) {
      setErrorMessage('Please specify a valid regular price in NGN.');
      return;
    }

    const fallbackImage =
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
    const effectiveImages = images.length > 0 ? images : [fallbackImage];
    const effectiveMainImage = mainImage || effectiveImages[0];

    setIsSaving(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSave({
        id: product?.id,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        sku: sku.trim(),
        categoryId,
        categoryName,
        regularPrice: Number(regularPrice),
        promotionalPrice: promotionalPrice ? Number(promotionalPrice) : undefined,
        stockQuantity: Number(stockQuantity) || 0,
        stockStatus,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        specifications: specifications.trim(),
        usageInstructions: usageInstructions.trim(),
        tags,
        mainImage: effectiveMainImage,
        images: effectiveImages,
        status,
        isFeatured,
        isBestSeller,
        showInHeroAds,
        heroAdBadge: heroAdBadge.trim() || undefined,
        heroAdHeadline: heroAdHeadline.trim() || undefined,
        productType,
        costPrice: costPrice !== '' ? Number(costPrice) : 0,
        adSpend: adSpend !== '' ? Number(adSpend) : 0,
        offlinePrice: offlinePrice !== '' ? Number(offlinePrice) : undefined,

        // High-converting Sales Landing Page Fields
        headline: headline.trim() || undefined,
        storyHeadline: storyHeadline.trim() || undefined,
        storyText: storyText.trim() || undefined,
        problem: problem.trim() || undefined,
        solution: solution.trim() || undefined,
        benefits: benefitsList.length > 0 ? benefitsList : undefined,
        urgencyNotice: urgencyNotice.trim() || undefined,
        enableTimer,
        timerHeadline: timerHeadline.trim() || undefined,
        timerHours: Number(timerHours) || 24,
        guaranteeText: guaranteeText.trim() || undefined,
        reviewsList: reviewsList.length > 0 ? reviewsList : undefined,
        faqsList: faqsList.length > 0 ? faqsList : undefined,
      });

      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Error saving product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
                  {product ? 'Edit Product & Sales Page' : 'Create High-Converting Sales Page'}
                </h2>
                <span className="text-[10px] bg-amber-100 text-[#D98200] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  AI-Powered
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Each product renders as a distraction-free, high-converting sales page with urgency, story & verified reviews.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 bg-gray-50/70 px-6 overflow-x-auto gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('basics')}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'basics'
                  ? 'border-[#F5A623] text-[#D98200] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              1. Product & Media
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sales_page')}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeTab === 'sales_page'
                  ? 'border-[#F5A623] text-[#D98200] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>2. Sales Story & Urgency</span>
              {headline && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews_faqs')}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeTab === 'reviews_faqs'
                  ? 'border-[#F5A623] text-[#D98200] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>3. Reviews ({reviewsList.length}) & FAQs ({faqsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'pricing'
                  ? 'border-[#F5A623] text-[#D98200] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              4. Pricing & Unit Margins
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'specs'
                  ? 'border-[#F5A623] text-[#D98200] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              5. Specs & Instructions
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} id="product-form" className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {aiSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-start gap-2 animate-in fade-in">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {/* AI AUTO-GENERATOR HERO BANNER (ALWAYS VISIBLE AT TOP) */}
            <div className="p-5 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-white rounded-2xl border border-amber-300/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D98200]" />
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    AI Sales Page Copywriter
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Enter your product name below, then click to auto-craft an authentic story, urgency timer, reviews & benefits tailored for Nigerian buyers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateSalesPage()}
                disabled={isGeneratingAI || !name.trim()}
                className="shrink-0 bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-200 disabled:text-gray-400 text-black font-black px-5 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Writing Sales Copy...' : 'Generate with AI'}</span>
              </button>
            </div>

            {/* TAB 1: BASICS & MEDIA */}
            {activeTab === 'basics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cordless Electric Spin Scrubber Pro"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={() => {
                          if (name.trim() && !headline && !isGeneratingAI) {
                            handleGenerateSalesPage(name);
                          }
                        }}
                        className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerateSalesPage()}
                        disabled={isGeneratingAI || !name.trim()}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-[#D98200] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        title="Auto-generate sales page copy"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Copy</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Tip: Entering product name automatically triggers AI sales copy generation when you click away!
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Unique Slug</label>
                    <input
                      type="text"
                      placeholder="electric-spin-scrubber-pro"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      placeholder="BC-CLN-001"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bathroom, Kitchen, Cordless"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Short Description (Direct offer hook)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="High-torque dual-speed motor designed for quick bathroom and kitchen tile scrubbing without back pain."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                {/* Image Management Section */}
                <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Product Gallery Images <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Upload from computer/phone or enter direct image URLs. Star indicates main photo.
                      </p>
                    </div>
                    {isUploading && (
                      <span className="text-xs text-[#D98200] font-bold animate-pulse">
                        Optimizing & uploading...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs transition-all">
                      <Upload className="w-4 h-4 text-[#F5A623]" />
                      <span>Choose Images from Device</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste an image URL..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-bold text-gray-700"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Quick Sample Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-gray-500">Quick Presets:</span>
                    {[
                      { name: '✨ Scrubber / Cleaning', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
                      { name: '🍳 Kitchen Appliance', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
                      { name: '🎧 Smart Tech / Gadget', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
                      { name: '🏡 Home & Living', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          if (!images.includes(preset.url)) {
                            setImages((prev) => [...prev, preset.url]);
                            if (!mainImage) setMainImage(preset.url);
                          }
                        }}
                        className="text-[10px] font-bold bg-white hover:bg-amber-50 text-gray-700 hover:text-[#D98200] border border-gray-200 hover:border-[#F5A623] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                      {images.map((imgUrl, idx) => {
                        const isMain = mainImage === imgUrl;
                        return (
                          <div
                            key={idx}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-white shadow-xs ${
                              isMain ? 'border-[#F5A623]' : 'border-gray-200'
                            }`}
                          >
                            <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute top-1 left-1 right-1 flex justify-between items-center opacity-90">
                              <button
                                type="button"
                                onClick={() => setMainImage(imgUrl)}
                                className={`p-1 rounded-md text-xs font-bold shadow-xs ${
                                  isMain
                                    ? 'bg-[#F5A623] text-black'
                                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-[#F5A623]'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isMain ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(imgUrl)}
                                className="p-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {isMain && (
                              <div className="absolute bottom-0 inset-x-0 bg-[#F5A623] text-black text-[9px] font-black text-center py-0.5 uppercase tracking-wider">
                                Main Photo
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SALES STORY & URGENCY (CORE SALES PAGE FEATURES) */}
            {activeTab === 'sales_page' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#D98200] uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#F5A623]" />
                      Urgency & Countdown Timer Controls
                    </span>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableTimer}
                        onChange={(e) => setEnableTimer(e.target.checked)}
                        className="rounded accent-[#F5A623] w-4 h-4"
                      />
                      <span>Enable Live Urgency Timer</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Countdown Timer Headline Hook
                      </label>
                      <input
                        type="text"
                        placeholder="🔥 LIMITED PROMOTIONAL SALE ENDS IN:"
                        value={timerHeadline}
                        onChange={(e) => setTimerHeadline(e.target.value)}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Timer Duration (Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={timerHours}
                        onChange={(e) => setTimerHours(Number(e.target.value) || 24)}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Scarcity / Urgent Warehouse Announcement
                    </label>
                    <input
                      type="text"
                      placeholder="⚡ Flash Promo: 35% Discount today only! Only 8 units left in Lagos warehouse."
                      value={urgencyNotice}
                      onChange={(e) => setUrgencyNotice(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Sales Headline */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Direct-Response Sales Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eliminate Stubborn Bathroom Mold in 1 Application — Without Hard Scrubbing"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                {/* Relatable Story Section */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                  <div>
                    <span className="text-xs font-black text-gray-900 uppercase tracking-wider block">
                      📖 Relatable Real-Life Story Section
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Storytelling sells! A simple story featuring a relatable everyday situation connects emotionally with Nigerian shoppers and breaks buyer skepticism.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Story Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The Story: How Mrs. Funke Saved Her Tiles & Her Sanity in Ikeja"
                      value={storyHeadline}
                      onChange={(e) => setStoryHeadline(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Story Content (2 to 3 paragraphs)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Write a warm, relatable story of someone who struggled with the problem before finding this solution..."
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 leading-relaxed focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                {/* Problem & Solution Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">
                      The Everyday Struggle (Problem)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Explain the frustration, wasted money, or exhausted energy the customer currently endures..."
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full text-xs bg-red-50/50 border border-red-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">
                      The Boricart Solution
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Explain how this product solves it effortlessly, saving time and money..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full text-xs bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">
                    Key Product Advantages & Bullet Benefits
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add benefit e.g. 'Saves 3 Hours Every Saturday: No painful bending or hard scrubbing.'"
                      value={newBenefitInput}
                      onChange={(e) => setNewBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBenefit();
                        }
                      }}
                      className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
                    >
                      Add Benefit
                    </button>
                  </div>

                  <div className="space-y-2">
                    {benefitsList.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                      >
                        <span className="text-gray-800 font-medium">✓ {benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guarantee Text */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Inspection Guarantee & Warranty Text
                  </label>
                  <input
                    type="text"
                    value={guaranteeText}
                    onChange={(e) => setGuaranteeText(e.target.value)}
                    placeholder="100% Cash on Delivery: Inspect your parcel upon arrival before paying."
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOMER REVIEWS & FAQS */}
            {activeTab === 'reviews_faqs' && (
              <div className="space-y-8">
                {/* Reviews Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        Verified Customer Reviews ({reviewsList.length})
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Admin can customize, add, or edit reviews displayed on the product sales page.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddReview}
                      className="px-3 py-1.5 bg-[#F5A623] hover:bg-[#D98200] text-black font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Review</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 mr-3">
                            <input
                              type="text"
                              placeholder="Reviewer Name"
                              value={rev.author}
                              onChange={(e) => handleUpdateReview(rev.id, 'author', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold"
                            />
                            <input
                              type="text"
                              placeholder="City, State e.g. Ikeja, Lagos"
                              value={rev.location || ''}
                              onChange={(e) => handleUpdateReview(rev.id, 'location', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1"
                            />
                            <select
                              value={rev.rating}
                              onChange={(e) => handleUpdateReview(rev.id, 'rating', Number(e.target.value))}
                              className="bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                              <option value="3">⭐⭐⭐ (3 Stars)</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveReview(rev.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Review text..."
                          value={rev.comment}
                          onChange={(e) => handleUpdateReview(rev.id, 'comment', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#F5A623]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-gray-700" />
                        Frequently Asked Questions ({faqsList.length})
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Address objections before customers ask (Cash on delivery, warranty, delivery times).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {faqsList.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Question"
                            value={faq.question}
                            onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-bold text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(faq.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#F5A623]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PRICING & UNIT MARGINS */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="space-y-4 p-5 bg-gray-50/80 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                      Product Type, Pricing & Financial Unit Economics
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Used for daily, weekly, monthly profit calculations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Product Type</label>
                      <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value as any)}
                        className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                      >
                        <option value="physical">Physical Product (Standard Goods)</option>
                        <option value="bundle">Product Bundle / Pack</option>
                        <option value="digital">Digital Download / Guide</option>
                        <option value="service">Service / Warranty Add-on</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={stockQuantity}
                        onChange={(e) => {
                          const q = e.target.value ? Number(e.target.value) : 0;
                          setStockQuantity(q);
                          setStockStatus(q === 0 ? 'out_of_stock' : q <= 5 ? 'low_stock' : 'in_stock');
                        }}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Stock Status</label>
                      <select
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value as any)}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock (Restock soon)</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Regular Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="38000"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623] font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Promo Price (Online)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="29500"
                        value={promotionalPrice}
                        onChange={(e) => setPromotionalPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Cost Price (COGS)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="12000"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs bg-white border border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-blue-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Ads Price / CPA
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="2500"
                        value={adSpend}
                        onChange={(e) => setAdSpend(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs bg-white border border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 text-purple-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Offline Store Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Optional"
                        value={offlinePrice}
                        onChange={(e) => setOfflinePrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>
                  </div>

                  {/* Margin Calculator */}
                  {(() => {
                    const activePrice = Number(promotionalPrice || regularPrice || 0);
                    const cogs = Number(costPrice || 0);
                    const ads = Number(adSpend || 0);
                    const grossProfit = activePrice - cogs;
                    const netProfit = activePrice - cogs - ads;
                    const marginPercent = activePrice > 0 ? Math.round((netProfit / activePrice) * 100) : 0;

                    return (
                      <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Gross Margin</span>
                            <span className="font-extrabold text-gray-900">₦{grossProfit.toLocaleString()}</span>
                          </div>
                          <div className="border-l border-gray-200 pl-4">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Net Profit / Unit</span>
                            <span className={`font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              ₦{netProfit.toLocaleString()}
                            </span>
                          </div>
                          <div className="border-l border-gray-200 pl-4">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Profit Margin %</span>
                            <span className={`font-black ${marginPercent >= 20 ? 'text-emerald-600' : marginPercent > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                              {marginPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Publish & Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Publish Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-semibold"
                    >
                      <option value="published">Published (Visible in Shop)</option>
                      <option value="draft">Draft (Hidden from Public)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded accent-[#F5A623] w-4 h-4"
                      />
                      <span>Show in Featured Section</span>
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                        className="rounded accent-[#F5A623] w-4 h-4"
                      />
                      <span>Mark as Best-Seller</span>
                    </label>
                  </div>
                </div>

                {/* HERO ADS SPOTLIGHT TOGGLE */}
                <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black text-[#D98200]">
                    <input
                      type="checkbox"
                      checked={showInHeroAds}
                      onChange={(e) => setShowInHeroAds(e.target.checked)}
                      className="rounded accent-[#F5A623] w-4 h-4"
                    />
                    <span>Feature in Homepage Hero Ads Section (Auto-Scrolling Spotlight)</span>
                  </label>

                  {showInHeroAds && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Promotional Ad Badge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. HOT DEAL • 25% OFF"
                          value={heroAdBadge}
                          onChange={(e) => setHeroAdBadge(e.target.value)}
                          className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Hero Headline Hook
                        </label>
                        <input
                          type="text"
                          placeholder="Catchy advertising title for the slider"
                          value={heroAdHeadline}
                          onChange={(e) => setHeroAdHeadline(e.target.value)}
                          className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SPECS & INSTRUCTIONS */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Product Specifications (Key: Value | Key: Value)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Battery: 2500mAh | Motor: 300 RPM | Waterproof: IPX7 | Runtime: 90 mins"
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Usage Instructions & Care Steps
                  </label>
                  <textarea
                    rows={4}
                    placeholder="1. Charge fully before first use.\n2. Snap the preferred brush head into position.\n3. Press power button once for low speed, twice for high torque."
                    value={usageInstructions}
                    onChange={(e) => setUsageInstructions(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Extended Details (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed explanation of warranty, packaging contents, and care tips..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Footer Controls */}
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 sticky bottom-0 z-20">
            <div className="text-[11px] text-gray-500 hidden sm:block">
              {activeTab === 'basics' && 'Step 1 of 5: General & Media'}
              {activeTab === 'sales_page' && 'Step 2 of 5: Sales Story & Urgency'}
              {activeTab === 'reviews_faqs' && 'Step 3 of 5: Customer Reviews & FAQs'}
              {activeTab === 'pricing' && 'Step 4 of 5: Pricing & Margins'}
              {activeTab === 'specs' && 'Step 5 of 5: Specs & Care'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="product-form"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-300 text-black text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isSaving ? <span>Saving Sales Page...</span> : <span>Save & Publish Sales Page</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
