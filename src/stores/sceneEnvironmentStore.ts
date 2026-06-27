import { create } from "zustand";
import type { DreiPreset } from "@/types/customize-environments";

interface SceneEnvironmentState {
  hdriUrl: string | null;
  dreiPreset: DreiPreset;
  lightingId: string;
  setHdri: (url: string | null) => void;
  setDreiPreset: (p: DreiPreset) => void;
  setLighting: (id: string) => void;
}

export const useSceneEnvironment = create<SceneEnvironmentState>((set) => ({
  hdriUrl: null,
  dreiPreset: "studio",
  lightingId: "studio",
  setHdri: (hdriUrl) => set({ hdriUrl }),
  setDreiPreset: (dreiPreset) => set({ dreiPreset, hdriUrl: null }),
  setLighting: (lightingId) => set({ lightingId }),
}));
