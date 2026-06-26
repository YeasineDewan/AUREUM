import { create } from "zustand";
import type { CatalogModel, FabricTexture } from "@/types/customize-extended";

export interface LoadedSceneModel {
  uid: string;
  model: CatalogModel;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  visible: boolean;
}

interface SceneAssetsState {
  loadedModels: LoadedSceneModel[];
  selectedUid: string | null;
  activeTexture: FabricTexture | null;
  transformMode: "translate" | "rotate" | "scale";

  addModel: (model: CatalogModel) => void;
  addCustomModel: (name: string, url: string) => void;
  removeModel: (uid: string) => void;
  updateModel: (uid: string, patch: Partial<Omit<LoadedSceneModel, "uid" | "model">>) => void;
  selectModel: (uid: string | null) => void;
  setTransformMode: (m: "translate" | "rotate" | "scale") => void;
  setTexture: (t: FabricTexture | null) => void;
  clear: () => void;
}

export const useSceneAssets = create<SceneAssetsState>((set) => ({
  loadedModels: [],
  selectedUid: null,
  activeTexture: null,
  transformMode: "translate",

  addModel: (model) =>
    set((s) => {
      const uid = `${model.id}-${Date.now()}`;
      return {
        loadedModels: [
          ...s.loadedModels,
          {
            uid,
            model,
            position: model.defaultPosition ?? [0, 0, 0],
            rotation: [0, 0, 0],
            scale: model.defaultScale ?? 1,
            visible: true,
          },
        ],
        selectedUid: uid,
      };
    }),

  addCustomModel: (name, url) =>
    set((s) => {
      const model = {
        id: `custom-${Date.now()}`,
        name,
        url,
        category: "decor" as const,
        source: "Custom URL",
        license: "User-provided",
        defaultScale: 1,
      };
      const uid = `${model.id}`;
      return {
        loadedModels: [
          ...s.loadedModels,
          { uid, model, position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, visible: true },
        ],
        selectedUid: uid,
      };
    }),

  removeModel: (uid) =>
    set((s) => ({
      loadedModels: s.loadedModels.filter((m) => m.uid !== uid),
      selectedUid: s.selectedUid === uid ? null : s.selectedUid,
    })),

  updateModel: (uid, patch) =>
    set((s) => ({
      loadedModels: s.loadedModels.map((m) => (m.uid === uid ? { ...m, ...patch } : m)),
    })),

  selectModel: (uid) => set({ selectedUid: uid }),
  setTransformMode: (m) => set({ transformMode: m }),
  setTexture: (t) => set({ activeTexture: t }),
  clear: () => set({ loadedModels: [], selectedUid: null }),
}));
