import React, { useState } from 'react';
import { Plus, Printer, Trash2, X } from 'lucide-react';
import {
  NoticeCategory,
  SCHOOL_CLASSES,
  SchoolClass,
  SchoolNotice,
  SchoolSettings,
} from '../types/school';
import { TODAY_ISO } from '../data/seedData';
import { SchoolLogo } from './SchoolLogo';

interface NoticesViewProps {
  settings: SchoolSettings;
  notices: SchoolNotice[];
  autoOpenNewModal?: boolean;
  onAutoOpenConsumed?: () => void;
  onAddNotice: (notice: SchoolNotice) => void;
  onDeleteNotice: (noticeId: string) => void;
}

const CATEGORIES: NoticeCategory[] = ['General', 'Exam', 'Holiday', 'Fee Reminder', 'PTM'];

export const NoticesView: React.FC<NoticesViewProps> = ({
  settings,
  notices,
  autoOpenNewModal = false,
  onAutoOpenConsumed,
  onAddNotice,
  onDeleteNotice,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('General');
  const [audience, setAudience] = useState<'All Students & Parents' | 'Teaching Staff' | SchoolClass>(
    'All Students & Parents'
  );
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [printNotice, setPrintNotice] = useState<SchoolNotice | null>(null);

  React.useEffect(() => {
    if (autoOpenNewModal) {
      setError('');
      setShowModal(true);
      onAutoOpenConsumed?.();
    }
  }, [autoOpenNewModal, onAutoOpenConsumed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Enter both notice title and circular message.');
      return;
    }
    onAddNotice({
      id: `ntc-${Date.now()}`,
      title: title.trim(),
      category,
      audience,
      date: TODAY_ISO,
      content: content.trim(),
      issuedBy: `${settings.principalName}, Principal`,
    });
    setTitle('');
    setContent('');
    setError('');
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Notices &amp; Circulars
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Issue printable school announcements for parents, classes, and teaching staff
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {notices.map((notice) => (
          <article
            key={notice.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {notice.category} · {notice.audience} · {notice.date}
              </p>
              <h2 className="mt-1.5 text-base font-bold text-slate-900 dark:text-slate-100">
                {notice.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {notice.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Issued by {notice.issuedBy}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintNotice(notice)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Print Circular</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteNotice(notice.id)}
                  aria-label={`Delete notice ${notice.title}`}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Create Notice Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-modal-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 id="notice-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Publish Official Notice
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close notice modal"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="ntc-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notice Subject / Headline *
                </label>
                <input
                  id="ntc-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Eid Holiday Announcement"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ntc-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="ntc-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ntc-aud" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    id="ntc-aud"
                    value={audience}
                    onChange={(e) =>
                      setAudience(
                        e.target.value as 'All Students & Parents' | 'Teaching Staff' | SchoolClass
                      )
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="All Students & Parents">All Students &amp; Parents</option>
                    <option value="Teaching Staff">Teaching Staff</option>
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} Only
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ntc-body" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Circular Message *
                </label>
                <textarea
                  id="ntc-body"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the official school circular details..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Official Circular Letterhead */}
      {printNotice && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Printable School Circular"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="no-print px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Official Notice Letterhead
              </h2>
              <button
                type="button"
                onClick={() => setPrintNotice(null)}
                aria-label="Close circular preview"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="print-only-sheet border border-slate-300 rounded-lg p-8 bg-white text-slate-900">
                <div className="flex items-center gap-4 border-b-2 border-[#0F5132] pb-4">
                  <SchoolLogo
                    customLogoDataUrl={settings.customLogoDataUrl}
                    schoolName={settings.schoolName}
                    size="md"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-[#0F5132]">{settings.schoolName}</h3>
                    <p className="text-xs text-slate-600">{settings.board}</p>
                    <p className="text-xs text-slate-600">{settings.address}</p>
                  </div>
                </div>

                <div className="mt-5 flex justify-between text-xs text-slate-600">
                  <span>To: {printNotice.audience}</span>
                  <span className="font-mono">Date: {printNotice.date}</span>
                </div>

                <h4 className="mt-6 text-lg font-bold text-slate-900 underline underline-offset-4">
                  NOTICE: {printNotice.title}
                </h4>
                <p className="mt-4 text-sm text-slate-800 leading-7 whitespace-pre-line">
                  {printNotice.content}
                </p>

                <div className="mt-12 text-right text-sm">
                  <p className="font-bold text-slate-900">{settings.principalName}</p>
                  <p className="text-xs text-slate-600">Principal, {settings.schoolName}</p>
                </div>
              </div>
            </div>
            <div className="no-print px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPrintNotice(null)}
                className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print Circular</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};