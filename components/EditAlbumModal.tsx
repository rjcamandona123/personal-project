
import React, { useState, useEffect } from 'react';
import { Album } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { EditIcon } from './icons/EditIcon';

interface EditAlbumModalProps {
  album: Album;
  existingAlbums: Album[];
  onClose: () => void;
  onSave: (albumId: string, newName: string) => boolean;
}

export const EditAlbumModal: React.FC<EditAlbumModalProps> = ({ album, existingAlbums, onClose, onSave }) => {
  const [name, setName] = useState(album.name);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(album.name); // Reset name if album prop changes
    setError(null);
  }, [album]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Album name cannot be empty.");
      return;
    }
    if (existingAlbums.some(a => a.id !== album.id && a.name.toLowerCase() === name.trim().toLowerCase())) {
      setError(`An album named "${name.trim()}" already exists. Please choose a different name.`);
      return;
    }
    const success = onSave(album.id, name.trim());
    if (success) {
      onClose();
    } else {
      // This case should ideally be caught by the check above, but as a fallback:
      setError("Failed to save album. The name might already exist or another error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="edit-album-modal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-album-modal-title" className="text-xl font-semibold text-slate-800 flex items-center">
            <EditIcon className="w-5 h-5 mr-2 text-blue-600" />
            Edit Album
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close dialog">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="albumName" className="block text-sm font-medium text-slate-700">
              Album Name
            </label>
            <input
              id="albumName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              required
              aria-required="true"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md" role="alert">{error}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
