import { type } from "arktype";

export const ChordList = type({
  name: "string",
  symbol: "string",
  notes: "string[]",
  bass: "string",
});
export type ChordList = typeof ChordList.infer;

export const Chord = type({
  chordName: "string",
  chordList: ChordList.array(),
});

export type Chord = typeof Chord.infer;
