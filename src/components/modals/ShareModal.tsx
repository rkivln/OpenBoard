import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock, ShieldCheck, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, boardTitle }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Share Board</h3>
              <p className="text-[11px] text-slate-400">Invite collaborators to &ldquo;{boardTitle}&rdquo;</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Link Copy Field */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Board Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 truncate outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Access permissions */}
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-purple-900">Anyone with the link can edit</div>
                <div className="text-[11px] text-purple-700/80">
                  Collaborators can join in real-time with synchronized cursors, notes, and live voting.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>End-to-End WebSocket Sync Active</span>
            </span>
            <span className="text-[11px] font-mono text-purple-600">OpenBoard v1.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
