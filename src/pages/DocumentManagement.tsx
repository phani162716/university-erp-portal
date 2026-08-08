import React, { useEffect, useState } from 'react';
import { ShieldCheck, Download, QrCode, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const DocumentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRequestNew = async (docName: string) => {
    try {
      const res = await api.post('/documents/request', {
        docType: docName,
        reason: 'Student portal request',
      });
      setMessage(res.data.message);
      await load();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Request failed');
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      let path = '';
      if (doc.source === 'hall_ticket') {
        // Find registration via exams API
        const examsRes = await api.get('/exams');
        const exam = (examsRes.data.exams || []).find((e: any) => e.hallTicketNo === doc.id);
        if (exam?.registrationId) {
          const response = await api.get(`/exams/hall-ticket/${exam.registrationId}`, {
            responseType: 'blob',
          });
          triggerBlobDownload(response.data, `HallTicket_${doc.id}.pdf`);
          return;
        }
      } else if (doc.source === 'receipt') {
        const response = await api.get(`/finance/receipt/${doc.id}`, { responseType: 'blob' });
        triggerBlobDownload(response.data, `Receipt_${doc.id}.pdf`);
        return;
      }

      path = `/documents/download/${encodeURIComponent(doc.name.includes('Result') ? 'result' : 'bonafide')}`;
      const response = await api.get(path, { responseType: 'blob' });
      triggerBlobDownload(response.data, `${doc.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      setMessage('Download failed. Please try again.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> Digital Certificate & Document Vault
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Download official university documents with QR verification.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.length === 0 && (
          <p className="text-xs text-slate-400 col-span-2">No issued documents yet. Request one below.</p>
        )}
        {documents.map((doc) => (
          <div
            key={doc.id + doc.name}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 dark:bg-slate-700/50 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {doc.id}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-extrabold text-[10px]">
                {doc.status}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 text-xs">
              <button
                onClick={() => navigate(`/verify/${doc.id}`)}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <QrCode className="w-3.5 h-3.5" /> Verify QR Link
              </button>
              <button
                onClick={() => handleDownload(doc)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold inline-flex items-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Request Additional Certificates</h3>
        <p className="text-xs text-slate-500">Bonafide, Transfer Certificate, Course Completion, and more.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {['Bonafide Certificate', 'Transfer Certificate', 'Course Completion Certificate', 'ID Card'].map(
            (name) => (
              <button
                key={name}
                onClick={() => handleRequestNew(name)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                + {name}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
