import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, FileText } from 'lucide-react';
import api from '../services/api';

export const DocumentVerification: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await api.get(`/verify/${documentId}`);
        setData(res.data);
      } catch (err: any) {
        setData({ valid: false, message: err.response?.data?.message || 'Unverified or Invalid Document Code.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) fetchVerification();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-white space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black tracking-tight">OFFICIAL DOCUMENT VERIFICATION</h1>
          <p className="text-xs text-slate-400 mt-0.5">University Digital Authentication Gateway</p>
        </div>

        {data?.valid ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-700/60 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>AUTHENTICATED & VERIFIED DOCUMENT</span>
            </div>

            <div className="space-y-1.5 text-slate-300 pt-2 border-t border-emerald-800/60">
              <p><strong className="text-slate-400">Document Type:</strong> {data.documentType}</p>
              <p><strong className="text-slate-400">Reference ID:</strong> <span className="font-mono text-emerald-400">{data.documentId}</span></p>
              <p><strong className="text-slate-400">Student Name:</strong> {data.studentName}</p>
              <p><strong className="text-slate-400">Register Number:</strong> <span className="font-mono">{data.registerNo}</span></p>
              {data.program && <p><strong className="text-slate-400">Program:</strong> {data.program}</p>}
              <p><strong className="text-slate-400">Details:</strong> {data.details}</p>
              <p><strong className="text-slate-400">Status:</strong> <span className="text-emerald-400 font-bold">{data.status}</span></p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-950/60 border border-rose-700/60 rounded-xl text-xs space-y-2 text-rose-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>VERIFICATION FAILED</span>
            </div>
            <p>{data?.message || 'The specified document code is not recognized by our registry.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
