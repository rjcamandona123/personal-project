import React from 'react';
import { NetworkIcon } from './icons/NetworkIcon'; // Assuming NetworkIcon is appropriate

export const NetworkPage: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 text-center">
      <h2 className="text-2xl font-semibold text-slate-700 mb-4">My Network</h2>
      <div className="flex justify-center items-center text-slate-400 my-8">
        <NetworkIcon className="w-24 h-24 " />
      </div>
      <p className="mt-4 text-slate-500">Network peers and connections will be displayed here.</p>
      <p className="mt-2 text-sm text-slate-400">This feature is currently under development.</p>
    </div>
  );
};
