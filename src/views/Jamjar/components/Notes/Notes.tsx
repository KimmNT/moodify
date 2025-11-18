import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import octaves from "../../../../db/octaves.json";
import notes from "../../../../db/notes.json";
import style from "./Notes.module.scss";
import clsx from "clsx";
import instruments from "../../../../db/intruments.json";
import TabTitle from "../../../../components/TabTitle/TabTitle";
import Navbar from "../../../../components/Navbar/Navbar";

export default function Notes() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState(instruments[0]);

  const handlePlay = useCallback(
    async (key: string) => {
      await Tone.start();
      const sampler = samplerRef.current;
      if (!sampler || !samplerLoaded) {
        return;
      }
      setActiveKey(key);
      sampler.triggerAttackRelease(key, 10);
      setTimeout(() => setActiveKey(null), 150);
    },
    [samplerLoaded]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        z: "C3",
        ",": "C#3",
        x: "D3",
        ".": "D#3",
        c: "E3",
        v: "F3",
        "/": "F#3",
        b: "G3",
        k: "G#3",
        n: "A3",
        l: "A#3",
        m: "B3",
        a: "C4",
        ";": "C#4",
        s: "D4",
        "'": "D#4",
        d: "E4",
        f: "F4",
        i: "F#4",
        g: "G4",
        o: "G#4",
        h: "A4",
        p: "A#4",
        j: "B4",
        q: "C5",
        "[": "C#5",
        w: "D5",
        "]": "D#5",
        e: "E5",
        r: "F5",
        "8": "F#5",
        t: "G5",
        "9": "G#5",
        y: "A5",
        "0": "A#5",
        u: "B5",
      };

      const note = keyMap[e.key.toLowerCase()];
      if (note) handlePlay(note);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [samplerLoaded, handlePlay]);

  useEffect(() => {
    let isMounted = true;

    const sampler = new Tone.Sampler({
      urls: octaves,
      // baseUrl: "/sounds/piano/",
      baseUrl: `/sounds/${selectedInstrument.folder}/`,
      onload: () => {
        if (isMounted) {
          setSamplerLoaded(true);
        }
      },
    }).toDestination();

    samplerRef.current = sampler;

    return () => {
      isMounted = false;
      sampler.dispose();
      samplerRef.current = null;
    };
  }, [selectedInstrument.folder]);

  return (
    <>
      <TabTitle title="Notes" />
      <Navbar currentPath="JamJar" />
      <main className={style.PageContainer}>
        <div className={style.HeaderContainer}>
          <h1 className={style.Header}>Jamjar - Notes</h1>
        </div>
        <div className={style.PianoContainer}>
          <select
            className={style.InstrumentSelect}
            value={selectedInstrument.name}
            onChange={(e) => {
              const selected = instruments.find(
                (i) => i.name === e.target.value
              )!;
              setSelectedInstrument(selected);
            }}
          >
            {instruments.map((inst) => (
              <option key={inst.name} value={inst.name}>
                {inst.name}
              </option>
            ))}
          </select>
          <div className={style.KeyList}>
            {notes
              .filter((n) => n.includes("#"))
              .map((note) => (
                <div
                  key={note}
                  className={clsx(
                    style.Key,
                    style.Black,
                    activeKey === note && style.Active
                  )}
                  onMouseDown={() => handlePlay(note)}
                >
                  <span className={style.Label}>{note}</span>
                </div>
              ))}
          </div>

          <div className={style.KeyList}>
            {notes
              .filter((n) => !n.includes("#"))
              .map((note) => (
                <div
                  key={note}
                  className={clsx(
                    style.Key,
                    style.White,
                    activeKey === note && style.Active
                  )}
                  onMouseDown={() => handlePlay(note)}
                >
                  <span className={style.Label}>{note}</span>
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
