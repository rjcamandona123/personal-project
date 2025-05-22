import React, { useState } from 'react';
import { ItemToShare } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CopyIcon } from './icons/CopyIcon';

interface ShareModalProps {
  item: ItemToShare;
  baseUrl: string; // e.g. window.location.origin
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, baseUrl, onClose }) => {
  const shareUrl = `${baseUrl}/?type=${item.type}&id=${item.id}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      alert('Failed to copy URL. Please copy it manually.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 id="share-modal-title" className="text-xl font-semibold text-slate-800 flex items-center">
            <ShareIcon className="w-5 h-5 mr-2 text-green-600" />
            Share {item.type === 'song' ? 'Song' : 'Album'}: {item.name}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close dialog">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-slate-600 mb-2">Share this link:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-grow px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm"
            aria-label="Shareable URL"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                        ${copied ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                </span>
            ) : (
                <CopyIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
