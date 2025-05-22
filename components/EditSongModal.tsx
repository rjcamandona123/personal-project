
import React, { useState, useEffect } from 'react';
import { Song, Album } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { EditIcon } from './icons/EditIcon';

interface EditSongModalProps {
  song: Song;
  albums: Album[];
  onClose: () => void;
  onSave: (updatedSong: Song) => boolean;
}

export const EditSongModal: React.FC<EditSongModalProps> = ({ song, albums, onClose, onSave }) => {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [albumText, setAlbumText] = useState(song.album || ''); // User-entered album text
  const [selectedAlbumId, setSelectedAlbumId] = useState(song.albumId || ''); // Linked Album entity
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(song.title);
    setArtist(song.artist);
    setAlbumText(song.album || '');
    setSelectedAlbumId(song.albumId || '');
    setError(null);
  }, [song]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !artist.trim()) {
      setError("Song title and artist cannot be empty.");
      return;
    }

    const updatedSong: Song = {
      ...song,
      title: title.trim(),
      artist: artist.trim(),
      album: albumText.trim() || undefined,
      albumId: selectedAlbumId || undefined,
    };

    const success = onSave(updatedSong);
    if (success) {
      onClose();
    } else {
      setError("Failed to save song. Please try again.");
    }
  };

  const inputBaseClasses = "px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black";
  const btnPrimaryClasses = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const btnSecondaryClasses = "px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="edit-song-modal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-song-modal-title" className="text-xl font-semibold text-slate-800 flex items-center">
            <EditIcon className="w-5 h-5 mr-2 text-blue-600" />
            Edit Song Details
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close dialog">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="songTitle" className="block text-sm font-medium text-slate-700">Song Title <span className="text-red-500">*</span></label>
            <input id="songTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={`mt-1 block w-full ${inputBaseClasses}`} />
          </div>
          <div>
            <label htmlFor="songArtist" className="block text-sm font-medium text-slate-700">Artist <span className="text-red-500">*</span></label>
            <input id="songArtist" type="text" value={artist} onChange={(e) => setArtist(e.target.value)} required className={`mt-1 block w-full ${inputBaseClasses}`} />
          </div>
          <div>
            <label htmlFor="songAlbumText" className="block text-sm font-medium text-slate-700">Album Title (text)</label>
            <input id="songAlbumText" type="text" value={albumText} onChange={(e) => setAlbumText(e.target.value)} placeholder="Enter album name if not selecting below" className={`mt-1 block w-full ${inputBaseClasses}`} />
          </div>
          <div>
            <label htmlFor="songAlbumEntity" className="block text-sm font-medium text-slate-700">Assign to Album (overrides text above)</label>
            <select
              id="songAlbumEntity"
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              className={`mt-1 block w-full ${inputBaseClasses}`}
              disabled={albums.length === 0}
            >
              <option value="">No Specific Album / Use Text Above</option>
              {albums.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {albums.length === 0 && <p className="text-xs text-slate-500 mt-1">No albums available to assign.</p>}
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md" role="alert">{error}</p>}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className={btnSecondaryClasses}>Cancel</button>
            <button type="submit" className={btnPrimaryClasses}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
