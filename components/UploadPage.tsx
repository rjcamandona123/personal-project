
import React, { useState, useRef, useEffect } from 'react';
import { Song, Album } from '../types';

interface UploadPageProps {
  albums: Album[];
  onSongAdd: (song: Omit<Song, 'id'>) => void;
}

// Helper to get audio duration
const getAudioFileDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error("Could not read file for duration: FileReader event target result is null."));
        return;
      }
      const audioElement = new Audio();
      audioElement.onloadedmetadata = () => {
        resolve(audioElement.duration);
      };
      audioElement.onerror = (errEvent) => {
        const error = audioElement.error;
        console.error("Error getting duration from audio element:", error);
        let message = "Could not load audio metadata to get duration.";
        if (error) {
          message += ` Code: ${error.code}, Message: ${error.message || 'Unknown media error'}`;
        }
        reject(new Error(message));
      };
      audioElement.src = e.target.result as string; 
    };
    reader.onerror = (err) => {
      console.error("FileReader error for duration:", err);
      reject(new Error("Could not read file using FileReader."));
    };
    reader.readAsDataURL(file);
  });
};


export const UploadPage: React.FC<UploadPageProps> = ({ albums, onSongAdd }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [albumTitle, setAlbumTitle] = useState(''); // For the text input "Album (Optional)"
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(''); // For dropdown selection
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const statusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        setUploadStatus(`Selected: ${file.name}`);
        setError(null);
      } else {
        setSelectedFile(null);
        setError('Invalid file type. Please select an audio file.');
        setUploadStatus(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select an audio file to upload.');
      return;
    }
    if (!title.trim() || !artist.trim()) {
      setError('Please provide a title and artist for the song.');
      return;
    }

    setIsProcessing(true);
    setUploadStatus(`Processing "${title}"...`);
    setError(null);

    let songDuration: number | undefined;
    let objectUrl: string | undefined;

    try {
      // Create object URL first, so it's available even if duration fails.
      objectUrl = URL.createObjectURL(selectedFile); 
      songDuration = await getAudioFileDuration(selectedFile);
    } catch (e: any) {
      console.warn("Could not determine audio duration:", e.message || e);
      if (isMountedRef.current) {
        setError(e.message || "Could not read audio file properties. Uploading without duration.");
      }
      songDuration = 0; // Default duration if reading fails
      // Ensure objectUrl is created if it wasn't and selectedFile exists (it should if we got here)
      if (!objectUrl && selectedFile) { 
         objectUrl = URL.createObjectURL(selectedFile); 
      }
    }
    
    if (!isMountedRef.current) {
        if (objectUrl && objectUrl.startsWith('blob:')) {
            URL.revokeObjectURL(objectUrl);
        }
        return;
    }

    const newSong: Omit<Song, 'id'> = {
      title: title.trim(),
      artist: artist.trim(),
      album: albumTitle.trim() || undefined, 
      albumId: selectedAlbumId || undefined, 
      duration: songDuration,
      coverArtUrl: undefined, 
      audioSrc: objectUrl,
    };

    onSongAdd(newSong);

    setUploadStatus(`Successfully uploaded "${title}" by ${artist}!`);
    setSelectedFile(null);
    setTitle('');
    setArtist('');
    setAlbumTitle('');
    setSelectedAlbumId('');
    if(fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
    setIsProcessing(false);

    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
            setUploadStatus(null);
        }
    }, 4000); 
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center">Upload Music</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="audioFile" className="block text-sm font-medium text-slate-700 mb-1">
            Audio File
          </label>
          <input
            type="file"
            id="audioFile"
            ref={fileInputRef}
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            aria-describedby="file_input_help"
            aria-required="true"
            disabled={isProcessing}
          />
          <p className="mt-1 text-xs text-slate-500" id="file_input_help">Supported formats: MP3, WAV, OGG, M4A, etc.</p>
        </div>

        {selectedFile && (
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-sm" role="status">
            <p><strong>File:</strong> {selectedFile.name}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
            <p><strong>Size:</strong> {formatBytes(selectedFile.size)}</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Song Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-required="true"
            disabled={isProcessing}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-slate-700">
            Artist <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            aria-required="true"
            disabled={isProcessing}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="albumTitle" className="block text-sm font-medium text-slate-700">
            Album Title (Optional text)
          </label>
          <input
            type="text"
            id="albumTitle"
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
            disabled={isProcessing}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black disabled:bg-slate-50"
          />
        </div>
        
        <div>
          <label htmlFor="albumEntity" className="block text-sm font-medium text-slate-700">
            Assign to Album (Optional)
          </label>
          <select
            id="albumEntity"
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            disabled={isProcessing || albums.length === 0}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="">No Album</option>
            {albums.map(album => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
           {albums.length === 0 && <p className="mt-1 text-xs text-slate-500">No albums created yet. Go to the 'Albums' page to create one.</p>}
        </div>


        {error && <p role="alert" className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {uploadStatus && !error && <p role="status" className={`text-sm p-3 rounded-md ${isProcessing ? 'text-yellow-700 bg-yellow-100' : 'text-blue-600 bg-blue-100'}`}>{uploadStatus}</p>}
        
        <button
          type="submit"
          disabled={!selectedFile || !title.trim() || !artist.trim() || isProcessing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
};
