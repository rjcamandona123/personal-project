
import React, { useState } from 'react';
import { Song, Album, ItemToShare, ItemToDelete } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { AlbumIcon } from './icons/AlbumIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';
import { ShareIcon } from './icons/ShareIcon';
import { formatTime } from '../utils/formatTime';

interface MusicCollectionProps {
  songs: Song[];
  albums: Album[];
  onSelectSong: (song: Song) => void;
  currentPlayingSong: Song | null;
  isPlaying: boolean;
  onEditSong: (song: Song) => void;
  onDeleteSong: (item: ItemToDelete) => void;
  onShareSong: (item: ItemToShare) => void;
  title?: string; // Optional title for the collection (e.g. "Music Collection" or Album Name)
}

export const MusicCollection: React.FC<MusicCollectionProps> = ({ 
  songs, 
  albums, 
  onSelectSong, 
  currentPlayingSong, 
  isPlaying,
  onEditSong,
  onDeleteSong,
  onShareSong,
  title = "Music Collection"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getDisplayAlbumName = (song: Song): string | undefined => {
    if (song.albumId) {
      const albumEntity = albums.find(a => a.id === song.albumId);
      return albumEntity?.name;
    }
    return song.album; // The text field value
  };

  const filteredSongs = songs.filter(song => {
    const displayAlbumName = getDisplayAlbumName(song) || '';
    return (
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayAlbumName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="bg-blue-600 text-white p-4 flex flex-col sm:flex-row justify-between items-center rounded-t-lg gap-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {title === "Music Collection" && ( // Only show search for main collection
            <div className="flex items-center w-full sm:w-auto">
            <input
                type="text"
                placeholder="Search by title, artist, album..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 rounded-l-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black sm:text-sm w-full sm:w-64"
                aria-label="Search music collection"
            />
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md flex items-center justify-center"
                aria-label="Search"
            >
                <SearchIcon className="w-5 h-5" />
            </button>
            </div>
        )}
      </div>
      <div className="p-4 md:p-6 min-h-[200px]">
        {songs.length === 0 ? (
          <p className="text-slate-500 text-lg text-center py-10">
            {title === "Music Collection" ? "No music found. Upload some music to get started!" : "This album is empty."}
          </p>
        ) : filteredSongs.length === 0 && searchTerm.length > 0 && title === "Music Collection" ? (
           <p className="text-slate-500 text-lg text-center py-10">No music found matching "{searchTerm}".</p>
        ) : (
          <ul className="space-y-1">
            {filteredSongs.map((song) => {
              const isCurrentlyPlayingSong = currentPlayingSong?.id === song.id;
              const showPauseIcon = isCurrentlyPlayingSong && isPlaying;
              const displayAlbumName = getDisplayAlbumName(song);

              return (
                <li 
                  key={song.id} 
                  className={`p-3 rounded-md shadow-sm border border-slate-200 flex items-center space-x-3 transition-all duration-150 ease-in-out group
                              ${isCurrentlyPlayingSong ? 'bg-blue-100 border-blue-300' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded flex items-center justify-center overflow-hidden">
                    {song.coverArtUrl ? (
                      <img src={song.coverArtUrl} alt={displayAlbumName || song.title} className="w-full h-full object-cover" />
                    ) : (
                      <AlbumIcon className="w-6 h-6 text-slate-400" /> 
                    )}
                  </div>
                  <button
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full 
                               hover:bg-slate-200 group-hover:bg-slate-200 
                               transition-colors duration-150
                               ${song.audioSrc ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                    onClick={() => song.audioSrc && onSelectSong(song)}
                    title={showPauseIcon ? `Pause ${song.title}`: `Play ${song.title}`}
                    disabled={!song.audioSrc}
                    aria-label={showPauseIcon ? `Pause ${song.title}`: `Play ${song.title}`}
                   >
                    {showPauseIcon ? <PauseIcon className="w-5 h-5 text-blue-600" /> : <PlayIcon className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />}
                  </button>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-slate-800 text-md truncate" title={song.title}>{song.title}</h3>
                    <p className="text-sm text-slate-600 truncate" title={song.artist}>{song.artist}</p>
                    {displayAlbumName && <p className="text-xs text-slate-500 italic truncate" title={displayAlbumName}>{displayAlbumName}</p>}
                  </div>
                  <p className="text-sm text-slate-500 flex-shrink-0">
                    {typeof song.duration === 'number' ? formatTime(song.duration) : 'N/A'}
                  </p>
                  <div className="flex space-x-1 ml-2 flex-shrink-0">
                    <button onClick={() => onEditSong(song)} title="Edit song" className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors">
                      <EditIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onShareSong({type: 'song', id: song.id, name: song.title})} title="Share song" className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-green-600 transition-colors">
                      <ShareIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onDeleteSong({type: 'song', id: song.id, name: song.title})} title="Delete song" className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-red-600 transition-colors">
                      <DeleteIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
