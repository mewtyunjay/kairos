'use client'

import { useEffect, useState } from 'react'

interface NavbarProps {
  onReset?: () => void;
}

export default function Navbar({ onReset }: NavbarProps) {
  const [seed, setSeed] = useState<number>(0);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1000));
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 h-16 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800/50 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all group"
            title="Go to home"
          >
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <span className="text-zinc-400">the-planner</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Profile</span>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
            alt="User avatar"
            className="w-8 h-8 rounded-full bg-zinc-800"
          />
        </div>
      </div>
    </div>
  )
} 