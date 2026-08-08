import React, { useEffect, useState } from 'react';
import { Bus, MapPin, Clock, Phone, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const TransportManagement: React.FC = () => {
  const [transportData, setTransportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransport();
  }, []);

  const fetchTransport = async () => {
    try {
      const res = await api.get('/transport');
      setTransportData(res.data);
    } catch (err) {
      console.error('Transport load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { allocation, routes } = transportData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bus className="w-6 h-6 text-blue-600" /> University Transport & Bus Service
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Route allocations, pickup points, bus numbers, driver details, and timing schedules.
          </p>
        </div>
      </div>

      {/* Transport Allocation */}
      {allocation ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Your Active Transport Allocation</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full font-bold text-xs">
              Route {allocation.route?.routeNo}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Route Name</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">{allocation.route?.routeName}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Pickup Location</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-0.5 block">{allocation.pickupPoint}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Pickup Time</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block font-mono">⏰ {allocation.pickupTime}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Drop Time</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block font-mono">⏰ {allocation.dropTime}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-xs text-slate-500">
          No transport route allocated.
        </div>
      )}

      {/* Available University Routes List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">University Transport Routes Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Route No</th>
                <th className="p-3.5">Route Name</th>
                <th className="p-3.5">Key Pickup Stoppages</th>
                <th className="p-3.5">Annual Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {routes?.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{r.routeNo}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{r.routeName}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{r.pickupPoints}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-600">₹{r.feeAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
