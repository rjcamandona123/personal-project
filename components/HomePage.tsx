import React from 'react';
import { MusicCollection } from './MusicCollection';
import { Song, Album, ItemToShare, ItemToDelete } from '../types';

interface HomePageProps {
  songs: Song[];
  albums: Album[];
  onSelectSong: (song: Song) => void;
  currentPlayingSong: Song | null;
  isPlaying: boolean;
  onEditSong: (song: Song) => void;
  onDeleteSong: (item: ItemToDelete) => void;
  onShareSong: (item: ItemToShare) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ songs, albums, onSelectSong, currentPlayingSong, isPlaying, onEditSong, onDeleteSong, onShareSong }) => {
  return (
    <div>
      <MusicCollection 
        songs={songs} 
        albums={albums}
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
