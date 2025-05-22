
import React from 'react';
import { Album, Song, ItemToShare, ItemToDelete, Album as AlbumType } from '../types';
import { MusicCollection } from './MusicCollection';
import { AlbumIcon } from './icons/AlbumIcon';
import { ViewIcon } from './icons/ViewIcon'; // For sub-album navigation

interface AlbumDetailPageProps {
  album: AlbumType;
  songs: Song[]; // Songs directly in this album
  childAlbums: AlbumType[]; // Direct children of this album
  allAlbums: Album[]; // All albums, for MusicCollection consistency and sub-album display
  onSelectSong: (song: Song) => void;
  currentPlayingSong: Song | null;
  isPlaying: boolean;
  onEditSong: (song: Song) => void;
  onDeleteSong: (item: ItemToDelete) => void;
  onShareSong: (item: ItemToShare) => void;
  onOpenAlbum: (albumId: string) => void; // For navigating to sub-albums
}

export const AlbumDetailPage: React.FC<AlbumDetailPageProps> = ({
  album,
  songs,
  childAlbums,
  allAlbums,
  onSelectSong,
  currentPlayingSong,
  isPlaying,
  onEditSong,
  onDeleteSong,
  onShareSong,
  onOpenAlbum,
}) => {
  const getSongCountForAlbum = (albumId: string): number => {
    // Count songs directly in a given album ID (used for sub-album display)
    return allAlbums.reduce((count, currentAlbum) => {
        if (currentAlbum.id === albumId) {
            // This is not ideal, we need the global songs list here or pass song counts.
            // For now, assume this function is mainly for the current album.
            // Let's refine if sub-album song counts are needed directly here.
            // This detail page primarily focuses on songs for *this* album.
        }
        return count;
    }, songs.filter(s => s.albumId === albumId).length); // Simple count for THIS album
  };


  return (
    <div className="space-y-6">
      <header className="bg-white shadow rounded-lg p-4 md:p-6 flex items-center space-x-4">
        <AlbumIcon className="w-12 h-12 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm text-slate-500">Album</p>
          <h1 className="text-3xl font-bold text-slate-800">{album.name}</h1>
          {album.parentId && (
            <p className="text-xs text-slate-500">
              Sub-album of: {allAlbums.find(a => a.id === album.parentId)?.name || 'Unknown Parent'}
            </p>
          )}
        </div>
      </header>

      {childAlbums.length > 0 && (
        <section className="bg-white shadow-lg rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-3">Sub-Albums ({childAlbums.length})</h2>
          <ul className="space-y-2">
            {childAlbums.map(subAlbum => (
              <li key={subAlbum.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3 flex-grow min-w-0">
                  <AlbumIcon className="w-7 h-7 text-slate-400 flex-shrink-0" />
                  <div 
                    className="flex-grow min-w-0 cursor-pointer group"
                    onClick={() => onOpenAlbum(subAlbum.id)}
                    title={`Open sub-album: ${subAlbum.name}`}
                    role="link"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onOpenAlbum(subAlbum.id)}
                  >
                    <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate block">{subAlbum.name}</span>
                     <p className="text-xs text-slate-500">
                      {allAlbums.filter(s => s.parentId === subAlbum.id).length > 0 ? `${allAlbums.filter(s => s.parentId === subAlbum.id).length} sub-album(s)` : `${songs.filter(s => s.albumId === subAlbum.id).length} song(s)`}
                    </p>
                  </div>
                </div>
                <button onClick={() => onOpenAlbum(subAlbum.id)} title={`Open sub-album ${subAlbum.name}`} className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition-colors">
                  <ViewIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MusicCollection
        title={`Songs in "${album.name}"`}
        songs={songs} // songs directly in this album
        albums={allAlbums} 
        onSelectSong={onSelectSong}
        currentPlayingSong={currentPlayingSong}
        isPlaying={isPlaying}
        onEditSong={onEditSong}
        onDeleteSong={onDeleteSong}
        onShareSong={onShareSong}
      />
    </div>
  );
};