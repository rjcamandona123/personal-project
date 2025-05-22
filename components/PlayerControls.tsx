import React from 'react';
import { Song, Album } from '../types'; // Import Album
import { PlayFilledIcon } from './icons/PlayFilledIcon';
import { PauseFilledIcon } from './icons/PauseFilledIcon';
import { AlbumIcon } from './icons/AlbumIcon'; 
import { formatTime } from '../utils/formatTime';


interface PlayerControlsProps {
  song: Song | null;
  albums: Album[]; // Add albums to props
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  song,
  albums, // Destructure albums
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
}) => {
  if (!song) return null;

  const handleSeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(event.target.value));
  };
  
  const getDisplayAlbumNameForPlayer = (): string | undefined => {
    if (song.albumId) {
      const albumEntity = albums.find(a => a.id === song.albumId);
      return albumEntity?.name;
    }
    return song.album; // The text field value from song object
  };

  const displayAlbumName = getDisplayAlbumNameForPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-3 shadow-2xl_top z-50 flex items-center space-x-4">
      <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded flex items-center justify-center overflow-hidden">
        {song.coverArtUrl ? (
          <img src={song.coverArtUrl} alt={displayAlbumName || song.title} className="w-full h-full object-cover" />
        ) : (
          <AlbumIcon className="w-6 h-6 text-slate-400" />
        )}
      </div>

      <div className="flex-grow min-w-0">
        <p className="text-sm font-semibold truncate" title={song.title}>{song.title}</p>
        <p className="text-xs text-slate-400 truncate" title={song.artist}>
          {song.artist}
          {displayAlbumName && <span className="italic"> - {displayAlbumName}</span>}
        </p>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        <button 
            onClick={onPlayPause} 
            className="p-2 rounded-full hover:bg-slate-700 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseFilledIcon className="w-6 h-6" /> : <PlayFilledIcon className="w-6 h-6" />}
        </button>
      </div>
      
      <div className="flex items-center space-x-2 flex-grow max-w-xs sm:max-w-md md:max-w-lg">
        <span className="text-xs text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeekChange}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          aria-label="Seek slider"
        />
        <span className="text-xs text-slate-400 w-10 text-left">{formatTime(duration || 0)}</span>
      </div>
    </div>
  );
};
