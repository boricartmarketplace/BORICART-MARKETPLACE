import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Package,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';
import { AdminRole, AdminUser } from '../../types';
import {
  getStaffMembers,
  saveStaffMember,
  deleteStaffMember,
  updateStaffStatus,
} from '../../firebase/services';
import { StaffFormModal } from './StaffFormModal';

interface StaffManagementTabProps {
  currentAdminEmail?: string;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({ currentAdminEmail }) => {
  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const members = await getStaffMembers();
      setStaffList(members);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleAddStaff = async (staffData: {
    name: string;
    email: string;
    role: AdminRole;
    phone?: string;
    password?: string;
  }) => {
    try {
      await saveStaffMember(staffData);
      await loadStaff();
      showNotification('success', `Access privilege granted to ${staffData.name} as ${staffData.role.replace('_', ' ')}!`);
    } catch (err: any) {
      console.error('Error adding staff:', err);
      showNotification('error', err?.message || 'Failed to add staff member.');
    }
  };

  const handleRoleChange = async (member: AdminUser, newRole: AdminRole) => {
    if (member.email === 'boricartmarketplace@gmail.com') {
      showNotification('error', 'Primary Master Super Admin role cannot be modified.');
      return;
    }
    try {
      await saveStaffMember({
        ...member,
        role: newRole,
      });
      await loadStaff();
      showNotification('success', `Updated privilege for ${member.name} to ${newRole.replace('_', ' ')}.`);
    } catch (err: any) {
      showNotification('error', 'Failed to update staff role.');
    }
  };

  const handleToggleStatus = async (member: AdminUser) => {
    if (member.email === 'boricartmarketplace@gmail.com') {
      showNotification('error', 'Master Super Admin cannot be suspended.');
      return;
    }
    try {
      const newStatus = member.status === 'active' ? 'suspended' : 'active';
      await updateStaffStatus(member.id, newStatus);
      await loadStaff();
      showNotification(
        'success',
        `${member.name} status updated to ${newStatus.toUpperCase()}`
      );
    } catch (err: any) {
      showNotification('error', 'Failed to toggle staff status.');
    }
  };

  const handleDeleteStaff = async (member: AdminUser) => {
    if (member.email === 'boricartmarketplace@gmail.com') {
      showNotification('error', 'Master Super Admin cannot be removed.');
      return;
    }
    if (window.confirm(`Are you sure you want to revoke access and delete staff profile for "${member.name}"?`)) {
      try {
        await deleteStaffMember(member.id);
        await loadStaff();
        showNotification('success', `Staff member ${member.name} removed successfully.`);
      } catch (err: any) {
        showNotification('error', 'Failed to remove staff member.');
      }
    }
  };

  const filteredStaff = staffList.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const overallAdminsCount = staffList.filter((s) => s.role === 'overall_admin').length;
  const storeKeepersCount = staffList.filter((s) => s.role === 'store_keeper').length;
  const dispatchersCount = staffList.filter((s) => s.role === 'order_dispatcher').length;

  return (
    <div className="space-y-8">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-2xl text-[#333333]">Staff Access & Privileges</h3>
          <p className="text-xs text-gray-500 mt-1">
            Assign staff roles, authorize inventory keepers, manage order dispatchers, and govern store access.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Role Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Overall Admins
            </span>
            <div className="text-2xl font-black text-[#333333] mt-1">{overallAdminsCount}</div>
            <span className="text-[11px] text-amber-700 font-medium">
              Full system & CMS privileges
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Store Keepers
            </span>
            <div className="text-2xl font-black text-[#333333] mt-1">{storeKeepersCount}</div>
            <span className="text-[11px] text-blue-700 font-medium">
              Products, prices & stock control
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Order Dispatchers
            </span>
            <div className="text-2xl font-black text-[#333333] mt-1">{dispatchersCount}</div>
            <span className="text-[11px] text-purple-700 font-medium">
              Fulfillment, calls & tracking
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Staff Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623] font-semibold"
          >
            <option value="all">All Roles ({staffList.length})</option>
            <option value="overall_admin">Overall Admins</option>
            <option value="store_keeper">Store Keepers</option>
            <option value="order_dispatcher">Order Dispatchers</option>
          </select>

          <button
            onClick={loadStaff}
            className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh staff list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">Staff Member</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Assigned Role</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Granted Privileges</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No staff members found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const isPrimaryAdmin = member.email === 'boricartmarketplace@gmail.com';
                  const isCurrent = currentAdminEmail && member.email.toLowerCase() === currentAdminEmail.toLowerCase();

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                              {isPrimaryAdmin && (
                                <span className="bg-amber-100 text-[#D98200] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                  Primary Root
                                </span>
                              )}
                              {isCurrent && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-gray-600 block text-xs">
                          {member.phone || 'No phone set'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={member.role}
                          disabled={isPrimaryAdmin}
                          onChange={(e) => handleRoleChange(member, e.target.value as AdminRole)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none transition-colors ${
                            member.role === 'overall_admin'
                              ? 'bg-amber-50 text-[#D98200] border-amber-200'
                              : member.role === 'store_keeper'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          } ${isPrimaryAdmin ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                        >
                          <option value="overall_admin">Overall Admin</option>
                          <option value="store_keeper">Store Keeper</option>
                          <option value="order_dispatcher">Order Dispatcher</option>
                        </select>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          type="button"
                          disabled={isPrimaryAdmin}
                          onClick={() => handleToggleStatus(member)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                            member.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } ${isPrimaryAdmin ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isPrimaryAdmin ? 'Root Admin cannot be suspended' : 'Click to toggle status'}
                        >
                          {member.status}
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {member.role === 'overall_admin' && 'Full Store & CMS Governance'}
                          {member.role === 'store_keeper' && 'Catalog, Pricing & Stock Count'}
                          {member.role === 'order_dispatcher' && 'Orders & Delivery Dispatch'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {!isPrimaryAdmin && (
                          <button
                            onClick={() => handleDeleteStaff(member)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Revoke and Delete Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddStaff}
      />
    </div>
  );
};
