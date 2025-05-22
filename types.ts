export enum NavView {
  Home = 'Home',
  MyNetwork = 'My Network',
  Albums = 'Albums',
  Upload = 'Upload',
  AlbumDetail = 'AlbumDetail', // New view for showing songs within an album
}

export interface Album {
  id: string;
  name: string;
  parentId?: string; // ID of the parent album, if this is a sub-album
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string; // User-entered text for album title, used if not assigned to an Album entity
  duration?: number; // duration in seconds
  coverArtUrl?: string; // URL to album cover
  audioSrc?: string; // URL for the audio file (e.g., object URL)
  albumId?: string; // ID of the Album entity this song belongs to
}

// For controlling modals
export interface ModalState<T> {
  isOpen: boolean;
  data?: T;
}

export interface ItemToShare {
  type: 'song' | 'album';
  id: string;
  name: string;
}

export interface ItemToDelete {
  type: 'song' | 'album';
  id: string;
  name: string;
}