'use client'

import { useState, useEffect } from 'react';

interface NavbarProps {
  onReset: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

const Navbar = ({ onReset, onBack, showBack }: NavbarProps) => {
  const [avatarSeed, setAvatarSeed] = useState<number | null>(null);

  useEffect(() => {
    setAvatarSeed(Math.floor(Math.random() * 1000));
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800/50 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all group"
            title="Home"
          >
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all group"
              title="Back"
            >
              <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-zinc-400">Hello,</div>
            <div className="font-medium">User</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {avatarSeed !== null && (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt="User avatar"
                className="w-full h-full rounded-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 