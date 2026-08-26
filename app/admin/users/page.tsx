"use client";

import * as React from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Award,
  ShoppingBag,
  Calendar,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useUIStore } from "@/stores/uiStore";

export default function AdminUsersPage() {
  const { addToast } = useUIStore();

  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | "ADMIN" | "STAFF" | "CUSTOMER">("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any | null>(null);

  // Create Form
  const [createForm, setCreateForm] = React.useState({
    name: "",
    email: "",
    role: "STAFF",
    password: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = React.useState(false);

  // Edit Form
  const [editForm, setEditForm] = React.useState({
    name: "",
    role: "STAFF",
    password: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = React.useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      addToast("Name and email are required", "error");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      addToast(`Account created for ${createForm.name}!`, "success");
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", email: "", role: "STAFF", password: "" });
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || "Failed to create user", "error");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmittingEdit(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editForm.name,
          role: editForm.role,
          ...(editForm.password.trim() && { password: editForm.password }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update account");

      addToast(`User ${editingUser.email} updated!`, "success");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || "Failed to update user", "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.email.includes("admin@himalayancuisineco.com")) {
      addToast("Primary Master Admin cannot be deleted.", "error");
      return;
    }

    if (!confirm(`Are you sure you want to remove user ${user.name || user.email}?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("User account deleted", "success");
        fetchUsers();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      addToast("Error deleting user", "error");
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      role: user.role || "STAFF",
      password: "",
    });
  };

  // Metrics
  const totalCustomers = users.filter((u) => u.role === "CUSTOMER").length;
  const totalStaff = users.filter((u) => u.role === "STAFF" || u.role === "ADMIN").length;
  const totalLoyaltyMembers = users.filter((u) => (u.rewardAccount?.points || 0) > 0).length;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || "").toLowerCase().includes(q);
      const matchEmail = (u.email || "").toLowerCase().includes(q);
      const matchRole = (u.role || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchRole;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414]">
            Users &amp; Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
            Manage admin permissions, staff access roles, and registered customer diner accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="bg-white border-neutral-200 text-xs font-semibold shadow-2xs h-8.5"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs font-bold shadow-xs h-8.5"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 font-sans block">
              Registered Diners
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414] mt-1">
              {totalCustomers}
            </h3>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Online customer accounts</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 font-sans block">
              Admins &amp; Staff
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414] mt-1">
              {totalStaff}
            </h3>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Kitchen &amp; Manager roles</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 text-[#B51C20] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 font-sans block">
              Loyalty Members
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#141414] mt-1">
              {totalLoyaltyMembers}
            </h3>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">Earned Himalayan points</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. TABLE FILTER & SEARCH WORKBENCH */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100/80 rounded-xl">
            {(["ALL", "ADMIN", "STAFF", "CUSTOMER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-white text-[#141414] shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {r === "ALL" ? "All Accounts" : r === "CUSTOMER" ? "Diners" : r}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full pl-8 pr-3.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] transition-all font-sans"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="pb-3 px-3 font-semibold">USER</th>
                <th className="pb-3 px-3 font-semibold text-center">ROLE</th>
                <th className="pb-3 px-3 font-semibold text-center">ORDERS</th>
                <th className="pb-3 px-3 font-semibold text-center">RESERVATIONS</th>
                <th className="pb-3 px-3 font-semibold text-center">POINTS</th>
                <th className="pb-3 px-3 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#B51C20] mb-2" />
                    Loading user accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initial = (u.name || u.email || "U").charAt(0).toUpperCase();
                  const isAdmin = u.role === "ADMIN";
                  const isStaff = u.role === "STAFF";

                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? "bg-red-100 text-[#B51C20]"
                                : isStaff
                                ? "bg-blue-100 text-blue-700"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 truncate">
                              {u.name || "Diner Account"}
                            </p>
                            <p className="text-[11px] text-neutral-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-red-50 text-[#B51C20] border border-red-200"
                              : isStaff
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-semibold text-neutral-800">
                        {u._count?.orders || 0}
                      </td>

                      <td className="py-3 px-3 text-center font-semibold text-neutral-800">
                        {u._count?.reservations || 0}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">
                        {u.rewardAccount?.points || 0} pts
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit Role / User Details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#B51C20] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CREATE / INVITE STAFF MODAL */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Staff Member or Admin"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-1 font-sans text-xs">
          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. Dawa Sherpa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="dawa@himalayancuisineco.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Access Role
              </label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] cursor-pointer"
              >
                <option value="STAFF">Staff (Kitchen &amp; Host)</option>
                <option value="ADMIN">Admin (Full Control)</option>
                <option value="CUSTOMER">Customer (Diner)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Initial Password
              </label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Temporary login password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-white text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingCreate}
              className="text-xs font-bold h-9"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 5. EDIT USER MODAL */}
      <Dialog
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Account"
      >
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4 pt-1 font-sans text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Account Email</span>
              <p className="font-bold text-neutral-900">{editingUser.email}</p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Role &amp; Permissions
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20] cursor-pointer"
              >
                <option value="STAFF">Staff (Orders &amp; Kitchen)</option>
                <option value="ADMIN">Admin (Full System Access)</option>
                <option value="CUSTOMER">Customer (Diner)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                Reset Password (Optional)
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Leave blank to keep existing password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B51C20]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                className="bg-white text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingEdit}
                className="text-xs font-bold h-9"
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
