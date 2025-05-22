import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface ConfirmDeleteModalProps {
  itemType: 'song' | 'album';
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ itemType, itemName, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 id="delete-modal-title" className="text-xl font-semibold text-slate-800 flex items-center">
            <DeleteIcon className="w-6 h-6 mr-2 text-red-500" />
            Confirm Deletion
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close dialog">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete the {itemType} "<strong>{itemName}</strong>"? This action cannot be undone.
          {itemType === 'album' && <span className="block text-sm text-slate-500 mt-1">Songs in this album will not be deleted but will no longer be assigned to this album.</span>}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
