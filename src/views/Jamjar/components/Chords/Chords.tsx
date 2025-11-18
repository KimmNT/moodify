import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import octaves from "../../../../db/octaves.json";
import chords from "../../../../db/chords.json";
import instruments from "../../../../db/intruments.json";
import TabTitle from "../../../../components/TabTitle/TabTitle";
import Navbar from "../../../../components/Navbar/Navbar";
import style from "./Chords.module.scss";
import clsx from "clsx";

export default function Chords() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(instruments[0]);

  useEffect(() => {
    let isMounted = true;

    const sampler = new Tone.Sampler({
      urls: octaves,
      baseUrl: `/sounds/${selectedInstrument?.folder}/`,
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
  }, [selectedInstrument?.folder]);

  const handlePlayChord = async (notes: string[], bass: string) => {
    await Tone.start();
    const sampler = samplerRef.current;
    if (!sampler || !samplerLoaded) return;

    const fullChord = [bass, ...notes];

    sampler.triggerAttackRelease(fullChord, 8);
  };

  const scrollToChord = (name: string) => {
    const element = document.getElementById(name);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <>
      <TabTitle title="Chords" />
      <Navbar currentPath="JamJar" />
      <main className={style.PageContainer}>
        <div className={style.HeaderContainer}>
          <h1 className={style.Header}>Jamjar - Chords</h1>
        </div>
        <div className={style.ChordsContainer}>
          <div className={style.ChordSidebar}>
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
            <div className={style.ChordListPreview}>
              {chords.map((chord) => (
                <div
                  key={chord.chordName}
                  onClick={() => scrollToChord(chord.chordName)}
                  className={style.ChordPreviewItem}
                >
                  {chord.chordName}
                </div>
              ))}
            </div>
          </div>
          <div className={clsx(style.ChordSidebar, style.Hidden)}></div>
          <div className={style.ChordGroups}>
            {chords.map((chord) => (
              <div
                key={chord.chordName}
                className={style.ChordGroupItem}
                id={chord.chordName}
              >
                <div className={style.ChordName}>{chord.chordName}</div>
                <div className={style.ChordList}>
                  {chord.chordList.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onMouseDown={() => handlePlayChord(item.notes, item.bass)}
                      className={style.ChordItem}
                    >
                      <strong className={style.Name}>{item.symbol}</strong>
                      <div className={style.Set}>
                        <span className={style.BassNote}>{item.bass}</span>
                        {item.notes.join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
