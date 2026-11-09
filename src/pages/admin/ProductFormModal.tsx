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
  HelpCircle,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { slugify, uploadProductImage } from '../../firebase/services';

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
      setShortDescription(product.shortDescription);
      setDescription(product.description);
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
    }
    setErrorMessage(null);
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

  // Handle local file selection from computer or phone
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
    if (images.length === 0) {
      setErrorMessage('Please upload at least one product image.');
      return;
    }

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
        mainImage: mainImage || images[0],
        images,
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-black text-[#333333]">
                {product ? 'Edit Product' : 'Add New Boricart Product'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Save directly to Cloud Firestore & Cloud Storage.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
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

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boricart Cordless Electric Spin Scrubber Pro"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Unique Slug</label>
                <input
                  type="text"
                  placeholder="boricart-electric-spin-scrubber"
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

            {/* Pricing, Cost, Ad Spend & Stock */}
            <div className="space-y-4 p-5 bg-gray-50/80 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Product Type, Pricing & Financial Unit Economics
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  Used for daily, weekly, monthly profit calculations
                </span>
              </div>

              {/* Row 1: Product Type & Stock */}
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

              {/* Row 2: Prices, Cost & Ads Spend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Selling Price (Reg) <span className="text-red-500">*</span>
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
                  <span className="text-[9px] text-gray-400 block mt-0.5">Manufacturing / Buy</span>
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
                  <span className="text-[9px] text-gray-400 block mt-0.5">Marketing cost/unit</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Offline Store Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for reg"
                    value={offlinePrice}
                    onChange={(e) => setOfflinePrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                  />
                  <span className="text-[9px] text-gray-400 block mt-0.5">Walk-in counter price</span>
                </div>
              </div>

              {/* Unit Economics Live Margin Calculator Card */}
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
                    <span className="text-[10px] bg-amber-50 text-amber-900 px-2 py-1 rounded-md font-medium">
                      Formula: Selling Price (₦{activePrice.toLocaleString()}) - COGS (₦{cogs.toLocaleString()}) - Ads (₦{ads.toLocaleString()})
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Category & Tags */}
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

            {/* Image Management Section */}
            <div className="space-y-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Product Images <span className="text-red-500">*</span>
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

              {/* Upload Controls */}
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

              {/* Image Previews */}
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

                        {/* Top bar controls */}
                        <div className="absolute top-1 left-1 right-1 flex justify-between items-center opacity-90">
                          <button
                            type="button"
                            onClick={() => setMainImage(imgUrl)}
                            title={isMain ? 'Featured Image' : 'Set as Featured'}
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
                            title="Delete image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isMain && (
                          <div className="absolute bottom-0 inset-x-0 bg-[#F5A623] text-black text-[9px] font-black text-center py-0.5 uppercase tracking-wider">
                            Main Image
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Short Description (Catchy 1-2 sentences for card and header)
              </label>
              <textarea
                rows={2}
                placeholder="High-torque dual-speed motor designed for quick bathroom and kitchen tile scrubbing."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Detailed Description
              </label>
              <textarea
                rows={5}
                placeholder="Comprehensive explanation of product features, benefits, and durability..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            {/* Specifications & Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Specifications (Key: Value | Key: Value)
                </label>
                <textarea
                  rows={3}
                  placeholder="Battery: 2500mAh | Motor: 300 RPM | Waterproof: IPX7 | Runtime: 90 mins"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Usage Instructions & Care
                </label>
                <textarea
                  rows={3}
                  placeholder="1. Charge fully before first use.\n2. Click preferred head securely."
                  value={usageInstructions}
                  onChange={(e) => setUsageInstructions(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>

            {/* Visibility & Badges */}
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
                      Promotional Ad Badge (e.g. HOT DEAL • 20% OFF)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HOT DEAL • 20% OFF or BEST SELLER"
                      value={heroAdBadge}
                      onChange={(e) => setHeroAdBadge(e.target.value)}
                      className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Hero Headline Hook (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Catchy advertising title for the slider"
                      value={heroAdHeadline}
                      onChange={(e) => setHeroAdHeadline(e.target.value)}
                      className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer Controls */}
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="product-form"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-300 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              {isSaving ? <span>Saving Product...</span> : <span>Save & Publish Product</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
