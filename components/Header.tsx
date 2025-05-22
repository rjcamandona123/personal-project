
import React from 'react';
import { NavView } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { AlbumIcon } from './icons/AlbumIcon';
import { UploadIcon } from './icons/UploadIcon';

interface HeaderProps {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
}

interface NavItemProps {
  view: NavView;
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  icon: React.ReactNode;
  label: string;
  isActiveOverride?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ view, currentView, setCurrentView, icon, label, isActiveOverride }) => {
  const isActive = isActiveOverride !== undefined ? isActiveOverride : currentView === view;
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center px-6 py-3 text-white transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-blue-500' : 'hover:bg-blue-700'}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span className="mt-1 text-sm">{label}</span>
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div>
          <h1 className="text-3xl font-bold">MusicShare</h1>
          <p className="text-xs text-blue-200">(https://musicshare.great-site.net/)</p>
        </div>
        <nav className="flex items-center space-x-1">
          <NavItem
            view={NavView.Home}
            currentView={currentView}
            setCurrentView={setCurrentView}
            icon={<HomeIcon className="w-6 h-6" />}
            label="Home"
          />
          <NavItem
            view={NavView.MyNetwork}
            currentView={currentView}
            setCurrentView={setCurrentView}
            icon={<NetworkIcon className="w-6 h-6" />}
            label="My Network"
          />
          <NavItem
            view={NavView.Albums}
            currentView={currentView}
            setCurrentView={setCurrentView}
            icon={<AlbumIcon className="w-6 h-6" />}
            label="Albums"
            isActiveOverride={currentView === NavView.Albums || currentView === NavView.AlbumDetail}
          />
          <NavItem
            view={NavView.Upload}
            currentView={currentView}
            setCurrentView={setCurrentView}
            icon={<UploadIcon className="w-6 h-6" />}
            label="Upload"
          />
        </nav>
        <div className="bg-slate-800 px-3 py-2 rounded text-sm font-mono">
          192.168.89.226
        </div>
      </div>
    </header>
  );
};
