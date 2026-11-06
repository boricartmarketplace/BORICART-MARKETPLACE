import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { Category } from '../../types';
import { slugify, uploadProductImage } from '../../firebase/services';

interface CategoryFormModalProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: Partial<Category> & { name: string }) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setImage(category.image || '');
      setSortOrder(category.sortOrder || 1);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80');
      setSortOrder(1);
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(slugify(val));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setImage(uploadedUrl);
    } catch (err: any) {
      console.error(err);
      setError('Could not upload image. You can also paste an image URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: category?.id,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        image: image.trim(),
        sortOrder: Number(sortOrder) || 1,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#333333]">
              {category ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Smart Kitchen"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                placeholder="smart-kitchen"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Smart, convenient kitchen appliances..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category Banner Image
              </label>
              <div className="flex gap-2 mb-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  placeholder="Or enter image URL..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                />
              </div>

              {image && (
                <div className="aspect-2/1 rounded-xl overflow-hidden border border-gray-200">
                  <img src={image} alt="Category preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Display Sort Order</label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-5 py-2 bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
