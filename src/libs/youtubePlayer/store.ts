// store/playerStore.ts
import { create } from "zustand";

interface PlayerState {
  queue: { id: string; title: string }[];
  playingId: string | null;
  isPlaying: boolean;
  shuffle: boolean;
  setQueue: (songs: { id: string; title: string }[]) => void;
  play: (id: string) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  playingId: null,
  isPlaying: false,
  shuffle: false,

  setQueue: (songs) => set({ queue: songs }),

  play: (id) => set({ playingId: id, isPlaying: true }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  playNext: () => {
    const { queue, playingId, shuffle } = get();
    if (queue.length === 0) return;

    if (shuffle) {
      let nextId: string;
      do {
        const randomIndex = Math.floor(Math.random() * queue.length);
        nextId = queue[randomIndex].id;
      } while (nextId === playingId && queue.length > 1);
      set({ playingId: nextId, isPlaying: true });
    } else {
      const currentIndex = queue.findIndex((f) => f.id === playingId);
      const nextIndex = (currentIndex + 1) % queue.length;
      set({ playingId: queue[nextIndex].id, isPlaying: true });
    }
  },

  playPrevious: () => {
    const { queue, playingId } = get();
    const currentIndex = queue.findIndex((f) => f.id === playingId);
    if (currentIndex > 0) {
      set({ playingId: queue[currentIndex - 1].id, isPlaying: true });
    }
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  stop: () => set({ playingId: null, isPlaying: false }),
}));
