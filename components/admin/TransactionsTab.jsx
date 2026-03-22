"use client";

import { useState, useEffect } from "react";
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
  RotateCcw
} from "lucide-react";

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    fetchTransactions();
  }, [page, limit, search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/transactions?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setTransactions(data?.data || []);
      setPagination(
        data?.pagination || {
          total: 0,
          page: 1,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Transaction fetch failed", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = {
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
    pending: {
      label: "Pending",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock size={12} />
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
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Transactions</h2>
          <p className="text-xs text-[var(--muted)] font-medium mt-1">
            Monitor and audit all customer payments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase">
              {pagination.total} Transactions
            </span>
          </div>
          <button
            onClick={fetchTransactions}
            className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search Order ID, Email, Player ID..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
          />
        </div>
        <button className="h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] flex items-center justify-center gap-2 hover:bg-[var(--foreground)]/[0.05] transition-all sm:w-max">
          <Filter size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase">Filter</span>
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
            <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">Loading Transactions</p>
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
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {transactions.map((t, idx) => {
                    const meta = statusMeta[t.status] || statusMeta.pending;
                    return (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setSelectedTx(t)}
                        className="group hover:bg-[var(--foreground)]/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-medium">{new Date(t.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-[var(--muted)]/40">{new Date(t.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] text-[var(--accent)] uppercase">{t.orderId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-[150px]">
                            <span className="truncate text-[var(--foreground)] font-medium">{t.email || "Guest User"}</span>
                            <span className="text-[10px] text-[var(--muted)]/40 truncate">{t.playerId || "No ID"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--muted)]/60">
                            <Gamepad2 size={12} className="text-[var(--accent)]" />
                            {t.gameSlug}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${meta.class}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-black text-emerald-500 tracking-tighter tabular-nums">
                            ₹{t.price}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-3">
              {transactions.map((t, idx) => {
                const meta = statusMeta[t.status] || statusMeta.pending;
                return (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedTx(t)}
                    className="p-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.05] transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-widest ${meta.class}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                        <p className="text-[10px] font-mono text-[var(--muted)]/40 uppercase mt-1">{t.orderId}</p>
                      </div>
                      <span className="text-lg font-black text-emerald-500 tracking-tighter">₹{t.price}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center shrink-0">
                          <Gamepad2 size={14} className="text-[var(--accent)]" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-[var(--foreground)] uppercase">{t.gameSlug}</p>
                          <p className="text-[var(--muted)]/60 truncate">{t.email || "No Email"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-[var(--muted)]/40">{new Date(t.createdAt).toLocaleDateString()}</p>
                        <ChevronRight size={14} className="ml-auto text-[var(--muted)]/20 mt-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!transactions.length && (
              <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <Hash className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">No Transactions Found</p>
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
        {selectedTx && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 z-[1001] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--background)] border-l border-[var(--border)] shadow-2xl z-[1002] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--foreground)]/[0.02] to-transparent">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest leading-none">Order ID</p>
                    <h3 className="text-base font-black uppercase italic tracking-tight text-[var(--foreground)] truncate max-w-[320px]">{selectedTx.orderId}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-9 h-9 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--foreground)] hover:bg-red-500/20 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Total Amount</p>
                    <span className="text-3xl font-black text-emerald-500 tabular-nums">₹{selectedTx.price}</span>
                  </div>
                  {(() => {
                    const meta = statusMeta[selectedTx.status] || statusMeta.pending;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${meta.class}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                <DrawerSection icon={<Gamepad2 size={16} />} title="Item Details">
                  <DrawerDetail label="Game" value={selectedTx.gameSlug} emphasize />
                  <DrawerDetail label="Item Name" value={selectedTx.itemName} />
                  <DrawerDetail label="Item ID" value={selectedTx.itemSlug} />
                </DrawerSection>

                <DrawerSection icon={<Smartphone size={16} />} title="Account Details">
                  <DrawerDetail label="Player ID" value={selectedTx.playerId} emphasize />
                  <DrawerDetail label="Zone ID" value={selectedTx.zoneId || "GLOBAL"} />
                </DrawerSection>

                <DrawerSection icon={<CreditCard size={16} />} title="Payment Info">
                  <DrawerDetail label="Payment Method" value={selectedTx.paymentMethod} />
                  <DrawerDetail label="Payment Status" value={selectedTx.paymentStatus} emphasize />
                  <DrawerDetail label="Topup Status" value={selectedTx.topupStatus} />
                </DrawerSection>

                <DrawerSection icon={<User size={16} />} title="Customer Details">
                  <DrawerDetail label="Customer Email" value={selectedTx.email || "GUEST"} />
                  <DrawerDetail label="Phone" value={selectedTx.phone || "UNLINKED"} />
                  <DrawerDetail label="Date" value={new Date(selectedTx.createdAt).toLocaleString()} />
                </DrawerSection>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPERS ================= */

function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[var(--muted)]/40 truncate">
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
      <span className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-tight group-hover:text-[var(--muted)]/60 transition-colors whitespace-nowrap">{label}</span>
      <span className={`text-sm font-bold text-right truncate ${emphasize ? "text-[var(--accent)] italic uppercase" : "text-[var(--foreground)]"}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}
