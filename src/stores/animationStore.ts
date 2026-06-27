import { create } from "zustand";

interface AnimationState {
  activeClipId: string | null;
  targetUid: string | null;
  playing: boolean;
  setClip: (clipId: string, targetUid: string | null) => void;
  togglePlay: () => void;
  stop: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  activeClipId: null,
  targetUid: null,
  playing: false,
  setClip: (clipId, targetUid) => set({ activeClipId: clipId, targetUid, playing: true }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  stop: () => set({ activeClipId: null, playing: false }),
}));
