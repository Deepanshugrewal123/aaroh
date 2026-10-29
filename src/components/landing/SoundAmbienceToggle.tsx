"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundEngine } from "@/lib/sound-engine";

export { soundEngine };

export function SoundAmbienceToggle() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (soundEngine) {
      setIsPlaying(soundEngine.getIsActive());
    }
  }, []);

  const toggleSound = () => {
    if (!soundEngine) return;
    if (isPlaying) {
      soundEngine.pause();
      setIsPlaying(false);
    } else {
      soundEngine.play();
      soundEngine.playChime(2);
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleSound}
      type="button"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-secondary/80 hover:bg-surface-interactive text-text-muted hover:text-text-primary border border-border-subtle transition-all text-xs font-medium cursor-pointer shadow-sm select-none"
      title={isPlaying ? "Mute ambient soundscape" : "Enable atmospheric ambient sound"}
      aria-label={isPlaying ? "Mute atmospheric sound" : "Enable atmospheric sound"}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
          <span className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-brand-primary animate-[pulse_0.8s_ease-in-out_infinite]" />
            <span className="w-0.5 h-3 bg-brand-primary animate-[pulse_0.6s_ease-in-out_infinite_0.1s]" />
            <span className="w-0.5 h-1.5 bg-brand-primary animate-[pulse_0.9s_ease-in-out_infinite_0.2s]" />
          </span>
          <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">Audio On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-[11px] uppercase tracking-wider text-text-muted">Sound</span>
        </>
      )}
    </button>
  );
}
