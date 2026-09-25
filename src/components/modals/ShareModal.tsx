import React, { useState } from 'react';
import { X, Copy, Check, Globe, ShieldCheck, Share2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-black/[0.08] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0071e3]">
              <Share2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Share Workspace</h3>
              <p className="text-[11px] text-zinc-500">Collaborate live on &ldquo;{boardTitle}&rdquo;</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Link Copy Field */}
          <div>
            <label className="text-xs font-medium text-zinc-700 block mb-1.5">
              Workspace Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs font-mono text-zinc-600 truncate outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Access permissions */}
          <div className="p-3 bg-zinc-50 border border-black/[0.06] rounded-xl space-y-1.5">
            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-[#0071e3] mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-zinc-900">Real-time collaborative access</div>
                <div className="text-[11px] text-zinc-500">
                  Anyone with the link can join instantly with live cursor tracking, instant updates, and synchronized presentations.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time stats */}
          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-black/[0.06]">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time WebSocket Sync Active</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">OpenBoard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
