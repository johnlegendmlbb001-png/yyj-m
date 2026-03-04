"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Loader2,
  Users,
  IdCard,
  Crown,
} from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    userType: "",
    from: "",
    to: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    active: { "1d": 0, "7d": 0, "30d": 0 },
    new: { "1d": 0, "7d": 0, "30d": 0 },
  });

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch stats failed", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch users failed", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userId, newUserType) => {
    try {
      setUpdatingUserId(userId);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/users/change-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newUserType }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update role");
        return;
      }

      fetchUsers();
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner": return <ShieldAlert size={14} className="text-rose-500" />;
      case "admin": return <ShieldCheck size={14} className="text-[var(--accent)]" />;
      case "member": return <Crown size={14} className="text-amber-500" />;
      default: return <User size={14} className="text-[var(--muted)]/60" />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "owner": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "admin": return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
      case "member": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]";
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Users</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage all registered users and their roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
            <Users size={14} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--muted)]">
              {pagination.total} Users Total
            </span>
          </div>
          <button
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none"
          >
            <RefreshCcw size={16} className={(loading || statsLoading) ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Users Stats */}
        <div className="p-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
              <Users size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatItem label="1D" value={stats.active["1d"]} loading={statsLoading} />
            <StatItem label="7D" value={stats.active["7d"]} loading={statsLoading} />
            <StatItem label="30D" value={stats.active["30d"]} loading={statsLoading} />
          </div>
        </div>

        {/* New Users Stats */}
        <div className="p-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-indigo-500">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">New Users</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatItem label="1D" value={stats.new["1d"]} loading={statsLoading} />
            <StatItem label="7D" value={stats.new["7d"]} loading={statsLoading} />
            <StatItem label="30D" value={stats.new["30d"]} loading={statsLoading} />
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTERS ================= */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by name, email, or user ID..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="h-11 px-5 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] flex items-center justify-center gap-2.5 hover:bg-[var(--foreground)]/[0.05] transition-all outline-none"
        >
          <Filter size={14} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold">Filters</span>
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-sm text-[var(--muted)] font-medium">Fetching users...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-[1.5rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[var(--muted)]">
                  <tr className="text-xs font-semibold">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Last Active</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedUser(u)}
                      className="group hover:bg-[var(--foreground)]/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} />
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-semibold text-sm">{u.name}</span>
                            <span className="text-[11px] text-[var(--muted)]/60 font-mono truncate max-w-[120px]">{u.userId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-[var(--muted)]">
                          <span className="text-[var(--foreground)] font-medium text-xs">{u.email}</span>
                          <span className="text-[11px] mt-0.5">{u.phone || "No phone linked"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide capitalize ${getRoleClass(u.userType)}`}>
                          {getRoleIcon(u.userType)}
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[var(--foreground)]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[var(--muted)]">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <RoleDropdown
                          value={u.userType}
                          disabled={updatingUserId === u.userId || u.userType === "owner"}
                          onChange={(v) => changeUserRole(u.userId, v)}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-3">
              {users.map((u, idx) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedUser(u)}
                  className="p-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.04] transition-all relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} />
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] text-sm truncate">{u.name}</p>
                        <p className="text-[11px] text-[var(--muted)]/60 font-mono truncate">{u.userId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[10px] font-semibold capitalize ${getRoleClass(u.userType)}`}>
                      {getRoleIcon(u.userType)}
                      {u.userType}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <Mail size={12} className="shrink-0" />
                        <span className="text-xs truncate">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Phone size={12} className="shrink-0" />
                          <span className="text-xs">{u.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 text-[var(--muted)]/60">
                        <Calendar size={12} />
                        <span className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--accent)]/60">
                        <RefreshCcw size={10} />
                        <span className="text-[10px] font-medium">Active: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}</span>
                      </div>
                    </div>

                    <RoleDropdown
                      value={u.userType}
                      compact
                      disabled={updatingUserId === u.userId || u.userType === "owner"}
                      onChange={(v) => changeUserRole(u.userId, v)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {!users.length && (
              <div className="py-24 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <Users className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-sm font-medium text-[var(--muted)]">No users found matching your search.</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER (User Info) ================= */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--background)] border-l border-[var(--border)] shadow-2xl z-[1110] flex flex-col"
            >
              <div className="p-8 border-b border-[var(--border)]">
                <div className="flex items-start justify-between mb-8">
                  <h3 className="text-xl font-bold text-[var(--foreground)]">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-red-500/10 transition-all outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar user={selectedUser} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-[var(--foreground)] truncate">{selectedUser.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold capitalize ${getRoleClass(selectedUser.userType)}`}>
                        {selectedUser.userType}
                      </span>
                      <span className="text-[11px] text-[var(--muted)] font-mono">{selectedUser.userId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <DrawerSection icon={<IdCard size={18} />} title="User Information">
                  <DrawerDetail label="Full Name" value={selectedUser.name} />
                  <DrawerDetail label="User ID" value={selectedUser.userId} />
                  <DrawerDetail label="Member Since" value={new Date(selectedUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                </DrawerSection>

                <DrawerSection icon={<Mail size={18} />} title="Contact Info">
                  <DrawerDetail label="Email Address" value={selectedUser.email} />
                  <DrawerDetail label="Phone Number" value={selectedUser.phone || "Not provided"} />
                </DrawerSection>

                <DrawerSection icon={<RefreshCcw size={18} />} title="Activity">
                  <DrawerDetail label="Last Active" value={selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : "Never"} />
                  <DrawerDetail label="Last Known IP" value={selectedUser.lastLoginIp} />
                  <DrawerDetail label="Account Created" value={new Date(selectedUser.createdAt).toLocaleString()} />
                </DrawerSection>

                <DrawerSection icon={<Shield size={18} />} title="Manage Role">
                  <div className="space-y-4 pt-2">
                    <p className="text-xs font-semibold text-[var(--muted)] px-1">Change User Role</p>
                    <RoleDropdown
                      value={selectedUser.userType}
                      disabled={updatingUserId === selectedUser.userId || selectedUser.userType === "owner"}
                      onChange={(v) => {
                        changeUserRole(selectedUser.userId, v);
                        setSelectedUser(null);
                      }}
                    />
                    {selectedUser.userType === "owner" && (
                      <p className="text-[11px] text-rose-500 font-medium px-1 italic">Role is restricted and cannot be modified.</p>
                    )}
                  </div>
                </DrawerSection>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= FILTER MODAL ================= */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-[var(--background)] border-l border-[var(--border)] p-8 space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[var(--muted)] ml-1">Role Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["user", "member", "admin", "owner"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilters({ ...filters, userType: filters.userType === type ? "" : type })}
                        className={`
                           px-4 py-2 rounded-xl border text-xs font-semibold capitalize transition-all outline-none
                           ${filters.userType === type
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                            : "border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--muted)] hover:text-[var(--foreground)]"}
                         `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[var(--muted)] ml-1">Joined From</label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40 [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[var(--muted)] ml-1">Joined To</label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setFilters({ userType: "", from: "", to: "" });
                    setPage(1);
                  }}
                  className="flex-1 h-11 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] transition-all outline-none"
                >
                  Clear All
                </button>

                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 h-11 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all outline-none"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function RoleDropdown({ value, onChange, disabled, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const roles = [
    { value: "user", label: "User", icon: <User size={12} /> },
    { value: "member", label: "Member", icon: <Crown size={12} /> },
    { value: "admin", label: "Admin", icon: <ShieldCheck size={12} /> },
  ];

  if (value === "owner") {
    roles.push({ value: "owner", label: "Owner", icon: <ShieldAlert size={12} /> });
  }

  const selectedRole = roles.find((r) => r.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-3 px-5
          ${compact ? "h-9 min-w-[110px]" : "h-11 min-w-[130px] w-full"}
          rounded-full border border-[var(--border)] bg-[var(--foreground)]/[0.03]
          text-xs font-semibold transition-all outline-none
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.06]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : "text-[var(--foreground)]"}
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)]">{selectedRole?.icon}</span>
          <span className="capitalize">{selectedRole?.label}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 5 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-[1200] right-0 mt-1 w-full min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1.5 overflow-hidden backdrop-blur-xl"
          >
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => {
                  onChange(role.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold rounded-lg transition-all outline-none
                  ${role.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}
                `}
              >
                <span className={role.value === value ? "text-white" : "text-[var(--accent)]"}>{role.icon}</span>
                <span className="capitalize">{role.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= AVATAR ================= */
function Avatar({ user, size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
  };

  const initials = user.userId
    ?.replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase() || "U";

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-2xl object-cover border-2 border-[var(--border)] shadow-inner`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[var(--accent)] via-indigo-500 to-purple-600 shadow-lg shadow-[var(--accent)]/10`}>
      {size === 'lg' ? <User size={32} /> : initials}
    </div>
  );
}

/* ================= HELPERS ================= */
function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[var(--muted)]/40">
        <div className="text-[var(--accent)]">{icon}</div>
        <h4 className="text-xs font-bold uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 px-1">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--border)] pb-3">
      <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-[var(--foreground)]">
        {value || "Not available"}
      </span>
    </div>
  );
}

function StatItem({ label, value, loading }) {
  return (
    <div className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
      <span className="text-[10px] font-bold text-[var(--muted)] opacity-60 uppercase">{label}</span>
      {loading ? (
        <div className="h-6 w-10 bg-[var(--foreground)]/[0.05] animate-pulse rounded mt-0.5" />
      ) : (
        <span className="text-lg font-black text-[var(--foreground)] tracking-tight">{value}</span>
      )}
    </div>
  );
}
