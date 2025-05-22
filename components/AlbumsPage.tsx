
import React, { useState } from 'react';
import { Album, Song, ItemToShare, ItemToDelete } from '../types';
import { AlbumIcon } from './icons/AlbumIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ViewIcon } from './icons/ViewIcon';


interface AlbumsPageProps {
  albums: Album[];
  songs: Song[];
  onAddAlbum: (name: string) => boolean;
  onMergeAlbums: (sourceAlbumIds: string[], targetAlbumId: string) => boolean;
  onEditAlbum: (album: Album) => void;
  onDeleteAlbum: (item: ItemToDelete) => void;
  onShareAlbum: (item: ItemToShare) => void;
  onOpenAlbum: (albumId: string) => void;
}

interface AlbumListItemProps {
  album: Album;
  allAlbums: Album[];
  allSongs: Song[];
  level: number;
  selectedAlbumIds: string[];
  onToggleAlbumSelection: (albumId: string) => void;
  onOpenAlbum: (albumId: string) => void;
  onEditAlbum: (album: Album) => void;
  onShareAlbum: (item: ItemToShare) => void;
  onDeleteAlbum: (item: ItemToDelete) => void;
  getSongCountForAlbum: (albumId: string) => number;
}

const AlbumListItem: React.FC<AlbumListItemProps> = ({
  album,
  allAlbums,
  allSongs,
  level,
  selectedAlbumIds,
  onToggleAlbumSelection,
  onOpenAlbum,
  onEditAlbum,
  onShareAlbum,
  onDeleteAlbum,
  getSongCountForAlbum
}) => {
  const childAlbums = allAlbums.filter(a => a.parentId === album.id);

  return (
    <>
      <li 
        className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors"
        style={{ marginLeft: `${level * 20}px` }} // Indentation for hierarchy
      >
        <div className="flex items-center space-x-3 flex-grow min-w-0">
          <input
            type="checkbox"
            id={`album-checkbox-${album.id}`}
            checked={selectedAlbumIds.includes(album.id)}
            onChange={() => onToggleAlbumSelection(album.id)}
            className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 flex-shrink-0"
            aria-label={`Select album ${album.name} for action`}
          />
          <AlbumIcon className="w-8 h-8 text-slate-400 flex-shrink-0" />
          <div 
            className="flex-grow min-w-0 cursor-pointer group"
            onClick={() => onOpenAlbum(album.id)}
            title={`Open album ${album.name}`}
            role="link"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onOpenAlbum(album.id)}
          >
            <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate block">{album.name}</span>
            <p className="text-xs text-slate-500">
              {getSongCountForAlbum(album.id)} song(s)
              {childAlbums.length > 0 && `, ${childAlbums.length} sub-album(s)`}
            </p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0 ml-2">
           <button onClick={() => onOpenAlbum(album.id)} title={`Open album ${album.name}`} className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition-colors">
            <ViewIcon className="w-5 h-5"/>
          </button>
          <button onClick={() => onEditAlbum(album)} title="Edit album" className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors">
            <EditIcon className="w-5 h-5"/>
          </button>
          <button onClick={() => onShareAlbum({type: 'album', id: album.id, name: album.name})} title="Share album" className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-green-600 transition-colors">
            <ShareIcon className="w-5 h-5"/>
          </button>
          <button onClick={() => onDeleteAlbum({type: 'album', id: album.id, name: album.name})} title="Delete album" className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-red-600 transition-colors">
            <DeleteIcon className="w-5 h-5"/>
          </button>
        </div>
      </li>
      {childAlbums.length > 0 && (
        <ul className="space-y-1 pl-0"> {/* No extra padding for ul, handled by li's margin */}
          {childAlbums.map(child => (
            <AlbumListItem
              key={child.id}
              album={child}
              allAlbums={allAlbums}
              allSongs={allSongs}
              level={level + 1}
              selectedAlbumIds={selectedAlbumIds}
              onToggleAlbumSelection={onToggleAlbumSelection}
              onOpenAlbum={onOpenAlbum}
              onEditAlbum={onEditAlbum}
              onShareAlbum={onShareAlbum}
              onDeleteAlbum={onDeleteAlbum}
              getSongCountForAlbum={getSongCountForAlbum}
            />
          ))}
        </ul>
      )}
    </>
  );
};


export const AlbumsPage: React.FC<AlbumsPageProps> = ({ albums, songs, onAddAlbum, onMergeAlbums, onEditAlbum, onDeleteAlbum, onShareAlbum, onOpenAlbum }) => {
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [mergeTargetAlbumId, setMergeTargetAlbumId] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) {
      setFeedbackMessage({ type: 'error', message: 'Album name cannot be empty.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }
    const success = onAddAlbum(newAlbumName.trim());
    if (success) {
      setFeedbackMessage({ type: 'success', message: `Album "${newAlbumName.trim()}" created.` });
      setNewAlbumName('');
    } else {
      setFeedbackMessage({ type: 'error', message: `Failed to create album "${newAlbumName.trim()}". It might already exist.` });
    }
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleToggleAlbumSelection = (albumId: string) => {
    setSelectedAlbumIds(prevSelected =>
      prevSelected.includes(albumId)
        ? prevSelected.filter(id => id !== albumId)
        : [...prevSelected, albumId]
    );
  };

  const handleMergeAlbums = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAlbumIds.length < 1) {
      setFeedbackMessage({ type: 'error', message: 'Please select at least one album to become a sub-album.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }
    if (!mergeTargetAlbumId) {
      setFeedbackMessage({ type: 'error', message: 'Please select a target (parent) album.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }
    if (selectedAlbumIds.includes(mergeTargetAlbumId)) {
      setFeedbackMessage({ type: 'error', message: 'Cannot make an album a sub-album of itself. Please choose a different target album.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    const targetAlbum = albums.find(a => a.id === mergeTargetAlbumId);
    if (!targetAlbum) {
       setFeedbackMessage({ type: 'error', message: 'Selected target album not found.' });
       setTimeout(() => setFeedbackMessage(null), 3000);
       return;
    }

    const success = onMergeAlbums(selectedAlbumIds, mergeTargetAlbumId);
     if (success) {
      const selectedAlbumNames = selectedAlbumIds.map(id => albums.find(a=>a.id===id)?.name || id).join(', ');
      setFeedbackMessage({ type: 'success', message: `Albums "${selectedAlbumNames}" are now sub-albums of "${targetAlbum.name}".` });
      setSelectedAlbumIds([]);
      setMergeTargetAlbumId('');
    } else {
      // Error message for failed merge (e.g. cycle) is handled by alert in App.tsx for now,
      // but we can also set a generic one here.
      setFeedbackMessage({ type: 'error', message: `Failed to set sub-albums. This might be due to a circular reference or an unexpected error.` });
    }
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const getSongCountForAlbum = (albumId: string): number => {
    return songs.filter(song => song.albumId === albumId).length;
  };
  
  const availableTargetAlbums = albums.filter(album => !selectedAlbumIds.includes(album.id));
  const topLevelAlbums = albums.filter(a => !a.parentId);


  return (
    <div className="space-y-8">
      <section className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Create New Album</h2>
        <form onSubmit={handleCreateAlbum} className="flex items-center space-x-3">
          <input
            type="text"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            placeholder="Enter new album name"
            className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
            aria-label="New album name"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Album
          </button>
        </form>
      </section>

      {selectedAlbumIds.length >= 1 && availableTargetAlbums.length > 0 && (
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Set Selected Album(s) as Sub-Albums</h2>
          <form onSubmit={handleMergeAlbums} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-grow">
              <label htmlFor="targetAlbumSelect" className="sr-only">Select target parent album</label>
              <select
                id="targetAlbumSelect"
                value={mergeTargetAlbumId}
                onChange={(e) => setMergeTargetAlbumId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                aria-label="Select target parent album"
              >
                <option value="">-- Select Target Parent Album --</option>
                {availableTargetAlbums.map(album => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!mergeTargetAlbumId || selectedAlbumIds.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              Set as Sub-Album(s)
            </button>
          </form>
           {selectedAlbumIds.length > 0 && <p className="text-xs text-slate-500 mt-2">Selected album(s) ({selectedAlbumIds.length}) will become children of the chosen target parent album.</p>}
        </section>
      )}
      
      {feedbackMessage && (
        <div className={`p-3 my-4 rounded-md text-sm ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
          {feedbackMessage.message}
        </div>
      )}

      <section className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Your Albums ({albums.length})</h2>
        {albums.length === 0 ? (
          <p className="text-slate-500">No albums created yet. Create one above!</p>
        ) : (
          <ul className="space-y-1"> {/* Reduced space-y for tighter hierarchy */}
            {topLevelAlbums.map(album => (
               <AlbumListItem
                key={album.id}
                album={album}
                allAlbums={albums}
                allSongs={songs}
                level={0}
                selectedAlbumIds={selectedAlbumIds}
                onToggleAlbumSelection={handleToggleAlbumSelection}
                onOpenAlbum={onOpenAlbum}
                onEditAlbum={onEditAlbum}
                onShareAlbum={onShareAlbum}
                onDeleteAlbum={onDeleteAlbum}
                getSongCountForAlbum={getSongCountForAlbum}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};