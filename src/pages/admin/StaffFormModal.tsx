import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Package, Truck, AlertCircle } from 'lucide-react';
import { AdminRole, AdminUser } from '../../types';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: {
    name: string;
    email: string;
    role: AdminRole;
    phone?: string;
    password?: string;
  }) => Promise<void>;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('store_keeper');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Staff member full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid company email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        phone: phone.trim(),
        password: password.trim() || undefined,
      });
      // Reset form
      setName('');
      setEmail('');
      setRole('store_keeper');
      setPhone('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#333333]">Add Staff & Grant Privileges</h3>
            <p className="text-xs text-gray-500">
              Provision internal administrative access for Boricart team members.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Olumide Bello"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Company Email</label>
            <input
              type="email"
              required
              placeholder="staff@boricart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Staff will log in using this email address.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+234 814..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Initial Password</label>
              <input
                type="text"
                placeholder="Set initial password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Role & Privilege</label>
            <div className="grid grid-cols-1 gap-2.5 mt-2">
              <label
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'overall_admin'
                    ? 'border-[#F5A623] bg-amber-50/60 ring-1 ring-[#F5A623]'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="overall_admin"
                  checked={role === 'overall_admin'}
                  onChange={() => setRole('overall_admin')}
                  className="mt-1 text-[#F5A623] focus:ring-[#F5A623]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-extrabold text-xs text-gray-900">Overall Admin</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Full control over entire store: Products, categories, orders, pages CMS, team staff management, and system settings.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'store_keeper'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="store_keeper"
                  checked={role === 'store_keeper'}
                  onChange={() => setRole('store_keeper')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-xs text-gray-900">Store Keeper</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Inventory & catalog operations: Add new products, update selling prices, upload images, manage stock counts, and create categories.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'order_dispatcher'
                    ? 'border-purple-500 bg-purple-50/60 ring-1 ring-purple-500'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="order_dispatcher"
                  checked={role === 'order_dispatcher'}
                  onChange={() => setRole('order_dispatcher')}
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span className="font-extrabold text-xs text-gray-900">Order Dispatcher</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Fulfillment & logistics: Access order destination addresses, customer contact details, WhatsApp dispatch calls, and delivery status updates.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Adding Staff...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Grant Access Privileges</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
