import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
            {variant === 'danger' && '⚠️ '}
            {variant === 'warning' && '🚧 '}
            {variant === 'primary' && '📝 '}
            {title}
          </h3>
          <div className="text-sm text-slate-600 font-medium leading-relaxed">{message}</div>
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs ${
              variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 border-rose-700 text-white' :
              variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-900' :
              'bg-blue-600 hover:bg-blue-700 border-blue-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
