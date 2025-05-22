
import React from 'react';

export const NotificationBar: React.FC = () => {
  return (
    <div className="bg-slate-100 p-4 rounded-md shadow border border-slate-200">
      <p className="text-sm text-slate-700">
        <span className="font-bold">Note:</span> This platform uses direct IP-based peer-to-peer connections instead of traditional login authentication.
      </p>
    </div>
  );
};
