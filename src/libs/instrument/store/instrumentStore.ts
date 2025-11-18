import { create } from "zustand";
import * as Tone from "tone";

interface InstrumentInfo {
  name: string;
  folder: string;
  ext: string;
}

interface InstrumentState {
  instrument: InstrumentInfo | null;
  sampler: Tone.Sampler | null;
  setInstrument: (instrument: InstrumentInfo) => void;
  setSampler: (sampler: Tone.Sampler) => void;
  resetSampler: () => void;
}

export const useInstrumentStore = create<InstrumentState>((set) => ({
  instrument: null,
  sampler: null,
  setInstrument: (instrument) => set({ instrument }),
  setSampler: (sampler) => set({ sampler }),
  resetSampler: () => set({ sampler: null }),
}));
