
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { NotificationBar } from './components/NotificationBar';
import { HomePage } from './components/HomePage';
import { NetworkPage } from './components/NetworkPage';
import { AlbumsPage } from './components/AlbumsPage';
import { UploadPage } from './components/UploadPage';
import { PlayerControls } from './components/PlayerControls';
import { AlbumDetailPage } from './components/AlbumDetailPage';
import { EditAlbumModal } from './components/EditAlbumModal';
import { EditSongModal } from './components/EditSongModal';
import { ShareModal } from './components/ShareModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { NavView, Song, Album, ItemToShare, ItemToDelete } from './types';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>(NavView.Home);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [songMediaDuration, setSongMediaDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const songsRef = useRef(songs);

  // Refs for temporary event listeners in handleSelectSong
  const playWhenReadyHandlerRef = useRef<(() => void) | null>(null);
  const playErrorHandlerRef = useRef<((e: Event) => void) | null>(null);

  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  const [activeAlbumDetailId, setActiveAlbumDetailId] = useState<string | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [itemToShare, setItemToShare] = useState<ItemToShare | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [initialUrlParams, setInitialUrlParams] = useState<{type: 'album' | 'song', id: string} | null>(null);
  const HARDCODED_BASE_URL = 'https://musicshare.great-site.net';

  const addSong = (newSongData: Omit<Song, 'id'>) => {
    const newSong: Song = { ...newSongData, id: uuidv4() };
    setSongs(prevSongs => [...prevSongs, newSong]);
  };

  const updateSong = (updatedSong: Song): boolean => {
    setSongs(prevSongs =>
      prevSongs.map(song => song.id === updatedSong.id ? updatedSong : song)
    );
    if (currentSong?.id === updatedSong.id) {
        setCurrentSong(updatedSong);
    }
    return true;
  };

  const deleteSong = (songId: string) => {
    const songToDelete = songs.find(s => s.id === songId);
    if (songToDelete?.audioSrc && songToDelete.audioSrc.startsWith('blob:')) {
      URL.revokeObjectURL(songToDelete.audioSrc);
    }
    setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
    if (currentSong?.id === songId) {
        if(audioRef.current) audioRef.current.src = '';
        setCurrentSong(null);
        setIsPlaying(false);
        setSongMediaDuration(0);
        setCurrentTime(0);
    }
  };

  const addAlbum = (name: string): boolean => {
    if (albums.some(album => album.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }
    const newAlbum: Album = { id: uuidv4(), name };
    setAlbums(prevAlbums => [...prevAlbums, newAlbum]);
    return true;
  };

  const updateAlbum = (albumId: string, newName: string): boolean => {
    if (albums.some(album => album.id !== albumId && album.name.toLowerCase() === newName.toLowerCase())) {
      return false;
    }
    setAlbums(prevAlbums =>
      prevAlbums.map(album => album.id === albumId ? { ...album, name: newName } : album)
    );
    return true;
  };

  const deleteAlbum = (albumId: string) => {
    setAlbums(prevAlbums =>
      prevAlbums
        .filter(album => album.id !== albumId) // Remove the deleted album
        .map(album => // Orphan its children
          album.parentId === albumId ? { ...album, parentId: undefined } : album
        )
    );
    setSongs(prevSongs => // Songs directly in the deleted album lose their albumId
      prevSongs.map(song => song.albumId === albumId ? { ...song, albumId: undefined } : song)
    );
    if (activeAlbumDetailId === albumId) {
        setCurrentView(NavView.Albums);
        setActiveAlbumDetailId(null);
    }
  };
  
  const isDescendant = (potentialDescendantId: string, potentialAncestorId: string, allAlbums: Album[]): boolean => {
    let currentId: string | undefined = potentialDescendantId;
    const visited = new Set<string>(); 

    while (currentId) {
      if (currentId === potentialAncestorId) return false; // An album cannot be its own ancestor in this check
                                                        // (A is not a descendant of A for this specific merge check)
                                                        // This check is more about: is B (target) a child of A (source)?
                                                        // If A is source, and B is target. If B's parent chain leads to A, then B is a descendant of A.
                                                        // We cannot make A a child of B in that case.

      if (visited.has(currentId)) return true; // Cycle detected in parent chain before even assigning
      visited.add(currentId);

      const currentAlbum = allAlbums.find(a => a.id === currentId);
      if (!currentAlbum) return false; // Should not happen in consistent data, means child doesn't exist.

      if (currentAlbum.parentId === potentialAncestorId) { // Found the potential ancestor in the parent chain of potentialDescendant
        return true;
      }
      currentId = currentAlbum.parentId;
    }
    return false;
  };


  const mergeAlbums = (sourceAlbumIds: string[], targetAlbumId: string): boolean => {
    const targetAlbum = albums.find(album => album.id === targetAlbumId);
    if (!targetAlbum) {
      console.error("Target album for merge not found.");
      return false;
    }
    if (sourceAlbumIds.includes(targetAlbumId)) {
        console.error("Cannot set an album as its own parent.");
        return false;
    }

    // Check for cyclical dependencies: targetAlbumId cannot be a descendant of any sourceAlbumId.
    // If it is, then making a sourceAlbumId a parent of targetAlbumId would create a cycle.
    // No, the check should be: a sourceAlbum cannot be made a child of one of its own descendants.
    // So, targetAlbumId (the new parent) cannot be a descendant of any sourceAlbumId.
    for (const sourceId of sourceAlbumIds) {
        if (isDescendant(targetAlbumId, sourceId, albums)) {
            const sourceName = albums.find(a=>a.id===sourceId)?.name || 'Source Album';
            const targetName = targetAlbum.name;
            console.error(`Cyclical dependency: Cannot make "${sourceName}" a child of "${targetName}", because "${targetName}" is already a descendant of "${sourceName}".`);
            alert(`Error: Cannot make "${sourceName}" a sub-album of "${targetName}" as it would create a circular reference (e.g., making an album a sub-album of its own child or grandchild).`);
            return false;
        }
    }
    
    setAlbums(prevAlbums =>
      prevAlbums.map(album =>
        sourceAlbumIds.includes(album.id)
          ? { ...album, parentId: targetAlbumId } // Set parentId for source albums
          : album
      )
    );
    // Songs remain in their original albums. Original albums are now children.
    return true;
  };


  const cleanupPendingPlayListeners = useCallback(() => {
    if (audioRef.current) {
      if (playWhenReadyHandlerRef.current) {
        audioRef.current.removeEventListener('canplay', playWhenReadyHandlerRef.current);
        playWhenReadyHandlerRef.current = null;
      }
      if (playErrorHandlerRef.current) {
        audioRef.current.removeEventListener('error', playErrorHandlerRef.current);
        playErrorHandlerRef.current = null;
      }
    }
  }, []);


  const handleSelectSong = useCallback((song: Song, playImmediately = true) => {
    if (!audioRef.current) {
      console.warn("handleSelectSong: audioRef.current is null. Cannot proceed.");
      return;
    }
    const audio = audioRef.current;
    
    cleanupPendingPlayListeners(); // Clean up any old listeners first

    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audio.pause();
      } else if (playImmediately) {
        if (audio.src !== song.audioSrc && song.audioSrc) {
            audio.src = song.audioSrc;
            audio.load();
        }
        if (audio.src) {
            audio.play().catch(e => console.error("Error playing same song:", song.title, e));
        } else if (!song.audioSrc) {
            console.warn("handleSelectSong (same song, play): Attempted to play current song which has no audio source:", song.title);
        }
      }
    } else {
      setCurrentSong(song);
      if (song.audioSrc) {
        audio.src = song.audioSrc;
        audio.load();
        if (playImmediately) {
          playWhenReadyHandlerRef.current = () => {
            console.log(`handleSelectSong (new song): "${song.title}" is ready (canplay). Attempting play.`);
            audio.play().catch(e => console.error(`Error playing new song "${song.title}" (when ready):`, e));
            cleanupPendingPlayListeners(); // Clean up after execution
          };
          playErrorHandlerRef.current = (e: Event) => {
            console.error(`handleSelectSong (new song): Media error for "${song.title}", cannot play. Error event:`, e, audio.error);
            cleanupPendingPlayListeners(); // Clean up after execution
          };
          audio.addEventListener('canplay', playWhenReadyHandlerRef.current);
          audio.addEventListener('error', playErrorHandlerRef.current);
        }
      } else {
        console.warn("handleSelectSong (new song): Selected new song has no audio source:", song.title);
        audio.src = '';
        setIsPlaying(false);
        setSongMediaDuration(0);
        setCurrentTime(0);
      }
    }
  }, [currentSong, isPlaying, cleanupPendingPlayListeners]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') as 'album' | 'song' | null;
    const id = params.get('id');
    if (type && id) {
        setInitialUrlParams({ type, id });
    }
  }, []);

  useEffect(() => {
    if (!initialUrlParams) return;
    const { type, id } = initialUrlParams;
    let itemFound = false;

    if (type === 'album') {
      const album = albums.find(a => a.id === id);
      if (album) {
        setActiveAlbumDetailId(album.id);
        setCurrentView(NavView.AlbumDetail);
        itemFound = true;
      }
    } else if (type === 'song') {
      const song = songs.find(s => s.id === id);
      if (song) {
        handleSelectSong(song, true);
        if (song.albumId) {
          const albumOfSong = albums.find(a => a.id === song.albumId);
          if (albumOfSong) {
            setActiveAlbumDetailId(song.albumId);
            setCurrentView(NavView.AlbumDetail);
          } else {
            // Song's albumId points to a non-existent album, go to Home
            setCurrentView(NavView.Home);
          }
        } else {
          setCurrentView(NavView.Home);
        }
        itemFound = true;
      }
    }

    if (!itemFound && id) {
      console.warn(`Initial URL item ${type} with ID ${id} not found. Clearing URL params.`);
      const basePath = window.location.pathname;
      window.history.replaceState({}, document.title, basePath);
    }
    setInitialUrlParams(null); // Process only once
  }, [initialUrlParams, albums, songs, setCurrentView, setActiveAlbumDetailId, handleSelectSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn("Audio event useEffect: audioRef.current is null. Global audio event listeners NOT attached.");
      return;
    }
    console.log("Audio event useEffect: audioRef.current is available. Attaching global audio event listeners.");
    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleLoadedMetadataEvent = () => setSongMediaDuration(audio.duration);
    const handleTimeUpdateEvent = () => setCurrentTime(audio.currentTime);
    const handleEndedEvent = () => setIsPlaying(false);
    const handleErrorEvent = (e: Event) => { console.error("Audio event: error", e, audio.error); setIsPlaying(false);};
    const handleStalledEvent = () => console.warn("Audio event: stalled.");
    const handleWaitingEvent = () => console.warn("Audio event: waiting.");

    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);
    audio.addEventListener('timeupdate', handleTimeUpdateEvent);
    audio.addEventListener('ended', handleEndedEvent);
    audio.addEventListener('error', handleErrorEvent);
    audio.addEventListener('stalled', handleStalledEvent);
    audio.addEventListener('waiting', handleWaitingEvent);

    return () => {
      console.log("Audio event useEffect: Cleaning up global audio event listeners.");
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
      audio.removeEventListener('timeupdate', handleTimeUpdateEvent);
      audio.removeEventListener('ended', handleEndedEvent);
      audio.removeEventListener('error', handleErrorEvent);
      audio.removeEventListener('stalled', handleStalledEvent);
      audio.removeEventListener('waiting', handleWaitingEvent);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentSong) {
      console.warn("TogglePlayPause: No audio element or current song.");
      return;
    }
    const audio = audioRef.current;
    if (currentSong.audioSrc && audio.src !== currentSong.audioSrc) {
        // If src is different, handleSelectSong will load and potentially play
        handleSelectSong(currentSong, !isPlaying);
    } else if (!currentSong.audioSrc && audio.src) {
        // Current song has no source, but player has one (from previous song). Clear player.
        audio.src = '';
    } else if (isPlaying) {
      audio.pause();
    } else {
      // Song is loaded (or src matches) and paused, so play.
      if (audio.src) { // Ensure there is a source to play
        audio.play().catch(e => console.error("Error resuming/playing in togglePlayPause:", e));
      } else {
         console.warn("TogglePlayPause: Attempted to play, but no src is set for the player, and current song also has no src.");
      }
    }
  }, [isPlaying, currentSong, handleSelectSong]);

  const handleSeek = useCallback((newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  useEffect(() => {
    // Main app unmount cleanup
    return () => {
      console.log("App unmounting, revoking Object URLs for songs in songsRef and cleaning pending play listeners.");
      cleanupPendingPlayListeners();
      songsRef.current.forEach(song => {
        if (song.audioSrc && song.audioSrc.startsWith('blob:')) {
          URL.revokeObjectURL(song.audioSrc);
        }
      });
    };
  }, [cleanupPendingPlayListeners]); 

  const handleOpenEditAlbumModal = (album: Album) => setEditingAlbum(album);
  const handleOpenEditSongModal = (song: Song) => setSongToEdit(song);
  const handleOpenShareModal = (item: ItemToShare) => {
    setItemToShare(item);
    const shareUrl = `${HARDCODED_BASE_URL}/?type=${item.type}&id=${item.id}`;
    window.history.pushState({}, '', shareUrl);
  };
  const handleOpenDeleteModal = (item: ItemToDelete) => setItemToDelete(item);
  const handleNavigateToAlbumDetail = (albumId: string) => {
    setActiveAlbumDetailId(albumId);
    setCurrentView(NavView.AlbumDetail);
    const albumDetailUrl = `${HARDCODED_BASE_URL}/?type=album&id=${albumId}`;
    window.history.pushState({}, '', albumDetailUrl);
  };

  const renderView = () => {
    switch (currentView) {
      case NavView.Home:
        return <HomePage songs={songs} albums={albums} onSelectSong={handleSelectSong} currentPlayingSong={currentSong} isPlaying={isPlaying} onEditSong={handleOpenEditSongModal} onDeleteSong={handleOpenDeleteModal} onShareSong={handleOpenShareModal} />;
      case NavView.MyNetwork:
        return <NetworkPage />;
      case NavView.Albums:
        return <AlbumsPage albums={albums} songs={songs} onAddAlbum={addAlbum} onMergeAlbums={mergeAlbums} onEditAlbum={handleOpenEditAlbumModal} onDeleteAlbum={handleOpenDeleteModal} onShareAlbum={handleOpenShareModal} onOpenAlbum={handleNavigateToAlbumDetail}/>;
      case NavView.Upload:
        return <UploadPage albums={albums} onSongAdd={addSong} />;
      case NavView.AlbumDetail:
        if (!activeAlbumDetailId) {
            setCurrentView(NavView.Albums); // Fallback if no active ID
            return <AlbumsPage albums={albums} songs={songs} onAddAlbum={addAlbum} onMergeAlbums={mergeAlbums} onEditAlbum={handleOpenEditAlbumModal} onDeleteAlbum={handleOpenDeleteModal} onShareAlbum={handleOpenShareModal} onOpenAlbum={handleNavigateToAlbumDetail}/>;
        }
        const albumForDetail = albums.find(a => a.id === activeAlbumDetailId);
        // Get child albums for the detail page
        const childAlbumsForDetail = albums.filter(a => a.parentId === activeAlbumDetailId);
        return albumForDetail ? <AlbumDetailPage album={albumForDetail} songs={songs.filter(s => s.albumId === activeAlbumDetailId)} childAlbums={childAlbumsForDetail} allAlbums={albums} onSelectSong={handleSelectSong} currentPlayingSong={currentSong} isPlaying={isPlaying} onEditSong={handleOpenEditSongModal} onDeleteSong={handleOpenDeleteModal} onShareSong={handleOpenShareModal} onOpenAlbum={handleNavigateToAlbumDetail} /> : <p className="text-center text-slate-500">Album (ID: {activeAlbumDetailId}) not found.</p>;
      default:
        return <HomePage songs={songs} albums={albums} onSelectSong={handleSelectSong} currentPlayingSong={currentSong} isPlaying={isPlaying} onEditSong={handleOpenEditSongModal} onDeleteSong={handleOpenDeleteModal} onShareSong={handleOpenShareModal}/>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <Header currentView={currentView} setCurrentView={(view) => {
        if(view !== NavView.AlbumDetail) setActiveAlbumDetailId(null);
        setCurrentView(view);
        if (view === NavView.Home || view === NavView.Albums || view === NavView.MyNetwork || view === NavView.Upload) {
             window.history.pushState({}, '', window.location.pathname); // Clear query params for main views
        }
      }} />
      <main className="p-4 md:p-8 flex-grow">
        <NotificationBar />
        <div className="mt-4">
          {renderView()}
        </div>
      </main>
      <audio ref={audioRef} />
      {currentSong && (
        <PlayerControls song={currentSong} albums={albums} isPlaying={isPlaying} currentTime={currentTime} duration={songMediaDuration} onPlayPause={togglePlayPause} onSeek={handleSeek} />
      )}

      {editingAlbum && <EditAlbumModal album={editingAlbum} onClose={() => setEditingAlbum(null)} onSave={updateAlbum} existingAlbums={albums} />}
      {songToEdit && <EditSongModal song={songToEdit} albums={albums} onClose={() => setSongToEdit(null)} onSave={updateSong} />}
      {itemToShare && <ShareModal item={itemToShare} onClose={() => setItemToShare(null)} baseUrl={HARDCODED_BASE_URL} />}
      {itemToDelete && <ConfirmDeleteModal itemType={itemToDelete.type} itemName={itemToDelete.name} onConfirm={() => {
        if (itemToDelete.type === 'album') deleteAlbum(itemToDelete.id);
        else if (itemToDelete.type === 'song') deleteSong(itemToDelete.id);
        setItemToDelete(null);
      }} onClose={() => setItemToDelete(null)} />}
    </div>
  );
};

export default App;