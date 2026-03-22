"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Clock,
  User,
  Gamepad2,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Hash,
  Loader2,
  Calendar,
  Smartphone,
  ChevronDown,
  ShoppingBag,
  Target,
  RotateCcw
} from "lucide-react";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    gameSlug: "",
    from: "",
    to: "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    "1d": { count: 0, revenue: 0, pending: 0 },
    "7d": { count: 0, revenue: 0, pending: 0 },
    "30d": { count: 0, revenue: 0, pending: 0 },
  });

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch order stats failed", err);
    } finally {
      setStatsLoading(false);
    }
  };

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.status && { status: filters.status }),
        ...(filters.gameSlug && { gameSlug: filters.gameSlug }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(
        `/api/admin/orders?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setOrders(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch orders failed", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update order");
        return;
      }

      fetchOrders();
    } finally {
      setUpdating(false);
    }
  };

  const statusMeta = {
    pending: {
      label: "Pending",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock size={12} />
    },
    success: {
      label: "Success",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />
    },
    failed: {
      label: "Failed",
      class: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: <XCircle size={12} />
    },
    refunded: {
      label: "Refunded",
      class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <RotateCcw size={12} />
    },
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Orders</h2>
          <p className="text-xs text-[var(--muted)] font-medium mt-1">
            View and manage customer orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase">
              {pagination.total} Orders
            </span>
          </div>
          <button
            onClick={() => {
              fetchOrders();
              fetchStats();
            }}
            className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all"
          >
            <RefreshCcw size={16} className={(loading || statsLoading) ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="flex flex-col gap-2">
        <OrderStatCard
          period="Volume"
          items={[
            { label: "1D", value: stats["1d"].count },
            { label: "7D", value: stats["7d"].count },
            { label: "30D", value: stats["30d"].count },
          ]}
          icon={<ShoppingBag size={14} />}
          color="text-[var(--accent)]"
          loading={statsLoading}
        />
        <OrderStatCard
          period="Revenue"
          items={[
            { label: "1D", value: `₹${stats["1d"].revenue}` },
            { label: "7D", value: `₹${stats["7d"].revenue}` },
            { label: "30D", value: `₹${stats["30d"].revenue}` },
          ]}
          icon={<IndianRupee size={14} />}
          color="text-emerald-500"
          loading={statsLoading}
        />
      </div>

      {/* ================= FILTERS & SEARCH ================= */}
      <div className="space-y-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/50" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by Order ID, Email, or Game..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]/50" size={12} />
            <select
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, status: e.target.value });
              }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-xs font-bold uppercase focus:border-[var(--accent)]/50 outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[var(--card)]">All Status</option>
              <option value="pending" className="bg-[var(--card)]">Pending</option>
              <option value="success" className="bg-[var(--card)]">Success</option>
              <option value="failed" className="bg-[var(--card)]">Failed</option>
              <option value="refunded" className="bg-[var(--card)]">Refunded</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 pointer-events-none" size={12} />
          </div>

          <input
            placeholder="Game Name"
            value={filters.gameSlug}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, gameSlug: e.target.value });
            }}
            className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-xs font-bold uppercase focus:border-[var(--accent)]/50 outline-none placeholder:text-[var(--muted)]/40"
          />

          <input
            type="date"
            value={filters.from}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, from: e.target.value });
            }}
            className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-xs font-bold uppercase focus:border-[var(--accent)]/50 outline-none"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, to: e.target.value });
            }}
            className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-xs font-bold uppercase focus:border-[var(--accent)]/50 outline-none"
          />

          <button
            onClick={() => {
              setPage(1);
              setFilters({ status: "", gameSlug: "", from: "", to: "" });
            }}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--foreground)]/[0.05] transition-all"
          >
            Reset Filters
          </button>
        </div>
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
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Loading Orders</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                  <tr className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {orders.map((o, idx) => {
                    const meta = statusMeta[o.status] || statusMeta.pending;
                    return (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setSelectedOrder(o)}
                        className="group hover:bg-[var(--foreground)]/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--accent)]">
                              <Gamepad2 size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[var(--foreground)] font-bold uppercase text-xs">{o.gameSlug}</span>
                              <span className="text-[10px] text-[var(--muted)]/60 font-medium lowercase truncate max-w-[150px]">{o.email || "Guest"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-medium">{new Date(o.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-[var(--muted)]">{new Date(o.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <span className="text-[var(--foreground)]/60 font-medium truncate block">{o.itemName}</span>
                          <span className="text-[10px] text-[var(--muted)]/40 font-mono uppercase">{o.orderId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base font-black text-emerald-500 tabular-nums">
                            ₹{o.price}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            value={o.status}
                            disabled={updating}
                            onChange={(v) => updateOrderStatus(o.orderId, v)}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "success", label: "Success" },
                              { value: "failed", label: "Failed" },
                              { value: "refunded", label: "Refunded" },
                            ]}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-3">
              {orders.map((o, idx) => {
                const meta = statusMeta[o.status] || statusMeta.pending;
                return (
                  <motion.div
                    key={o._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedOrder(o)}
                    className="relative p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.04] transition-all group"
                  >
                    <div className="flex justify-between items-center mb-3 relative">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--accent)] transition-transform group-active:scale-90 shadow-sm shrink-0">
                          <Gamepad2 size={18} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-bold text-[var(--foreground)] uppercase text-[11px] tracking-tight truncate">{o.gameSlug}</p>
                          <p className="text-[10px] text-[var(--muted)]/60 font-medium lowercase truncate max-w-[140px]">{o.email || "Guest"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-lg font-black text-emerald-500 tabular-nums leading-none">₹{o.price}</span>
                        <span className="text-[8px] font-bold text-[var(--muted)]/40 uppercase tracking-widest mt-1">{o.paymentMethod || "UPI"}</span>
                      </div>
                    </div>

                    <div className="space-y-3 relative">
                      <div className="px-3 py-2 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold text-[var(--foreground)]/70 truncate italic">"{o.itemName}"</p>
                          <span className="text-[8px] font-mono text-[var(--muted)]/40 uppercase truncate shrink-0">{o.orderId}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[var(--muted)]/60">{new Date(o.createdAt).toLocaleDateString()}</span>
                          <span className="text-[8px] font-medium text-[var(--muted)]/40">{new Date(o.createdAt).toLocaleTimeString()}</span>
                        </div>

                        <StatusDropdown
                          value={o.status}
                          disabled={updating}
                          onChange={(v) => updateOrderStatus(o.orderId, v)}
                          compact
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "success", label: "Success" },
                            { value: "failed", label: "Failed" },
                            { value: "refunded", label: "Refunded" },
                          ]}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!orders.length && (
              <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <ShoppingBag className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">No Orders Found</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase">
                  Page <b className="text-[var(--foreground)]">{pagination.page}</b> / {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 transition-all font-mono"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 transition-all font-mono"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER ================= */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--background)] border-l border-[var(--border)] shadow-2xl z-[1110] flex flex-col"
            >
              <div className="p-8 border-b border-[var(--border)] bg-gradient-to-r from-[var(--foreground)]/[0.02] to-transparent">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Order Details</p>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[var(--foreground)]">Summary</h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--foreground)] hover:bg-red-500/20 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Price</p>
                    <span className="text-3xl font-black text-emerald-500 tabular-nums">₹{selectedOrder.price}</span>
                  </div>
                  <StatusDropdown
                    value={selectedOrder.status}
                    onChange={(v) => {
                      updateOrderStatus(selectedOrder.orderId, v);
                      setSelectedOrder(null);
                    }}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "success", label: "Success" },
                      { value: "failed", label: "Failed" },
                      { value: "refunded", label: "Refunded" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <DrawerSection icon={<Gamepad2 size={16} />} title="Item Details">
                  <DrawerDetail label="Game" value={selectedOrder.gameSlug} emphasize />
                  <DrawerDetail label="Item" value={selectedOrder.itemName} />
                  <DrawerDetail label="Slug" value={selectedOrder.itemSlug} />
                </DrawerSection>

                <DrawerSection icon={<Smartphone size={16} />} title="Account Details">
                  <DrawerDetail label="Player ID" value={selectedOrder.playerId} emphasize />
                  <DrawerDetail label="IP Address" value={selectedOrder.ip} />
                  <DrawerDetail label="Zone ID" value={selectedOrder.zoneId || "GLOBAL"} />
                </DrawerSection>

                <DrawerSection icon={<CreditCard size={16} />} title="Payment Info">
                  <DrawerDetail label="Payment Method" value={selectedOrder.paymentMethod} />
                  <DrawerDetail label="Payment Status" value={selectedOrder.paymentStatus} emphasize />
                  <DrawerDetail label="Topup Status" value={selectedOrder.topupStatus} />
                </DrawerSection>

                <DrawerSection icon={<User size={16} />} title="Customer Info">
                  <DrawerDetail label="Email" value={selectedOrder.email || "GUEST"} />
                  <DrawerDetail label="Phone" value={selectedOrder.phone || "N/A"} />
                  <DrawerDetail label="Date" value={new Date(selectedOrder.createdAt).toLocaleString()} />
                </DrawerSection>

                <div className="pt-6 border-t border-[var(--border)] opacity-20">
                  <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-center text-[var(--foreground)]">Order ID: {selectedOrder.orderId.toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function StatusDropdown({ value, onChange, options, disabled, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = {
    pending: "text-amber-500",
    success: "text-emerald-500",
    failed: "text-rose-500",
    refunded: "text-blue-500",
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2 px-3 
          ${compact ? "h-8 min-w-[100px]" : "h-10 min-w-[120px]"}
          rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          text-[10px] font-black uppercase transition-all
          ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.08]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : ""}
        `}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${styles[value]}`} />
          <span className={styles[value]}>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-[2000] right-0 bottom-full mb-1 w-[150px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left text-[9px] font-black uppercase rounded-lg transition-all
                  ${option.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPERS Interface ================= */

function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[var(--muted)]/40">
        <div className="p-2 rounded-lg bg-[var(--foreground)]/[0.05] text-[var(--accent)]">{icon}</div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="grid grid-cols-1 gap-4 px-1">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value, emphasize }) {
  return (
    <div className="flex justify-between items-baseline gap-4 group">
      <span className="text-[9px] font-black text-[var(--muted)]/40 uppercase tracking-tight group-hover:text-[var(--muted)]/60 transition-colors whitespace-nowrap">{label}</span>
      <span className={`text-xs font-bold text-right truncate ${emphasize ? "text-[var(--accent)] italic uppercase" : "text-[var(--foreground)]"}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}

function OrderStatCard({ period, items, icon, color, loading }) {
  return (
    <div className="p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm flex items-center gap-4 relative overflow-hidden group">
      <div className={`flex items-center gap-2.5 min-w-[90px] md:min-w-[120px] shrink-0 ${color}`}>
        <div className={`w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{period}</span>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <div key={i} className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[8px] font-black text-[var(--muted)]/40 uppercase mb-0.5">{item.label}</span>
            {loading ? (
              <div className="h-4 w-8 bg-[var(--foreground)]/[0.05] animate-pulse rounded" />
            ) : (
              <span className="text-sm font-black text-[var(--foreground)] tracking-tighter tabular-nums">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

