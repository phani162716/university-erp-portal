import React, { useEffect, useState } from 'react';
import { CreditCard, Download, CheckCircle2, AlertCircle, ShieldCheck, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export const FinancePage: React.FC = () => {
  const [financeData, setFinanceData] = useState<any>(null);
  const [selectedFee, setSelectedFee] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      const res = await api.get('/fees');
      setFinanceData(res.data);
    } catch (err) {
      console.error('Finance load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayClick = (fee: any) => {
    setSelectedFee(fee);
    const due = fee.totalAmount - fee.paidAmount;
    setPayAmount(due.toString());
    setShowPaymentModal(true);
  };

  const handleMockPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !payAmount) return;

    try {
      const res = await api.post('/finance/pay', {
        feeRecordId: selectedFee.id,
        amount: Number(payAmount),
        paymentMethod,
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMessage({ type: 'success', text: `Payment of ₹${payAmount} successful! Transaction ID: ${res.data.transaction.transactionId}` });
      setShowPaymentModal(false);
      fetchFinance();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Payment failed.' });
    }
  };

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const response = await api.get(`/finance/receipt/${transactionId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download payment receipt PDF.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { summary, feeRecords, transactions } = financeData || {};

  return (
    <div className="space-y-6">
      {/* Header & Financial Summary Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" /> Student Fee & Financial Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fee breakdown, online payment gateway, transaction history, and downloadable receipts.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs font-semibold text-slate-400 block">Total Fee</span>
            <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
              ₹{(summary?.totalFee || 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">Paid Amount</span>
            <span className="text-lg font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
              ₹{(summary?.paidAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">Pending Due</span>
            <span className="text-lg font-mono font-extrabold text-amber-700 dark:text-amber-300">
              ₹{(summary?.pendingAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Fee Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fee Statement & Dues</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Paid Amount</th>
                <th className="p-3.5">Pending Due</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {feeRecords?.map((fee: any) => {
                const pending = fee.totalAmount - fee.paidAmount;
                return (
                  <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{fee.category}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{fee.description}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">₹{fee.totalAmount.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400">₹{fee.paidAmount.toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">₹{pending.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-500">{fee.dueDate}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fee.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : fee.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {pending > 0 && (
                        <button
                          onClick={() => handlePayClick(fee)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Transactions History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Transaction Receipts</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Fee Category</th>
                <th className="p-3.5">Amount Paid</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Receipt PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {transactions?.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{t.transactionId}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{t.feeRecord?.category}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-600">₹{t.amount.toLocaleString()}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{t.paymentMethod}</td>
                  <td className="p-3.5 font-mono text-slate-500">{new Date(t.paidAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDownloadReceipt(t.transactionId)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                University Online Payment Portal
              </h3>
            </div>

            <form onSubmit={handleMockPaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{selectedFee.category}</p>
                <p className="text-slate-500">{selectedFee.description}</p>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Enter Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Select Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="UPI / QR Code">UPI / Instant QR Code</option>
                  <option value="NetBanking">Internet Banking</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow"
                >
                  Confirm & Pay ₹{payAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
