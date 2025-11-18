import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import Navbar from "../../../../../../components/Navbar/Navbar";
import TabTitle from "../../../../../../components/TabTitle/TabTitle";
import { useFirebaseHelper } from "../../../../../../hooks/useFirebaseHelper";
import { SectionRoute } from "../../../../../../routeRegistry";
import style from "./Section.module.scss";
import {
  JamProject,
  Section as SectionType,
} from "../../../../../../libs/jamspace/modal";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase";
import notesData from "../../../../../../db/notes.json";
import chordsData from "../../../../../../db/chords.json";
import instruments from "../../../../../../db/intruments.json";
import octaves from "../../../../../../db/octaves.json";
import {
  Plus,
  Minus,
  PlusCircle,
  ArrowLeft,
  Play,
  X,
  // ArrowUp,
  // ArrowDown,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";

type JamspaceProject = JamProject & { id: string };

interface SectionDetailProps {
  duration: number;
  selectedValue: string;
}

// 🎵 Notes Dropdown
const NotesSelection = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={style.Select}
    >
      <option value="" className={style.Option}>
        Select a note
      </option>
      {notesData.map((item, index) => (
        <option key={index} value={item} className={style.Option}>
          {item}
        </option>
      ))}
    </select>
  );
};

// 🎸 Chords Dropdown
const ChordsSelection = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const getAllChordSymbols = () => {
    return chordsData.flatMap((group) =>
      group.chordList.map((chord) => chord.symbol)
    );
  };

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select a chord</option>
      {getAllChordSymbols().map((symbol, index) => (
        <option key={index} value={symbol}>
          {symbol}
        </option>
      ))}
    </select>
  );
};

const DURATION_STEPS = 0.05;

export default function Section() {
  const navigation = useNavigate();
  const { section, jamspace } = SectionRoute.useParams();
  const { getDocument } = useFirebaseHelper();
  const [sectionList, setSectionList] = useState<SectionType[]>([]);
  const [sectionData, setSectionData] = useState<SectionType | null>(null);
  const [sectionDetails, setSectionDetails] = useState<SectionDetailProps[]>(
    []
  );
  const [selectedSection, setSelectedSection] = useState("");
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(instruments[0]);
  const [quantityToAdd, setQuantityToAdd] = useState("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [addSpecificDuration, setAddSpecificDuration] = useState("1");
  const [addSpecificName, setAddSpecificName] = useState("");
  const [isRepeating, setIsRepeating] = useState(false);
  const repeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldRepeatRef = useRef(false);

  const handleNavigateBack = () => {
    navigation({
      to: `/jamjar/jamspace/${jamspace}`,
    });
  };

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

  const loadProjectItem = async (
    projectID: string
  ): Promise<JamspaceProject | null> => {
    try {
      const projectRef = doc(db, "jamspace", projectID);
      const snap = await getDoc(projectRef);

      if (snap.exists()) {
        const snapshotData = snap.data() as JamProject;
        const projectData: JamspaceProject = {
          ...snapshotData,
          id: snapshotData.id ?? snap.id,
        };
        return projectData;
      } else {
        console.warn("⚠️ Project not found:", projectID);
        return null;
      }
    } catch (err) {
      console.error("❌ Error loading project:", err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchProject() {
      const data = await loadProjectItem(jamspace);
      if (data && isMounted) {
        setSectionList(data.sections);
        const foundSection = data.sections.find((sec) => sec.id === section);
        if (foundSection) {
          setSectionData(foundSection);
          setSectionDetails(foundSection.details);
        } else console.warn("⚠️ Section not found:", section);
      }
    }
    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [getDocument, jamspace, section]);

  const handleCreateNewSectionDetail = (quantity: number) => {
    setSectionDetails((prev) => [
      ...prev,
      ...Array.from({ length: quantity }, () => ({
        duration: 1,
        selectedValue: "",
      })),
    ]);
  };

  const handleCreateSpecificSectionDetail = () => {
    setSectionDetails((prev) => [
      ...prev,
      {
        duration: Number(addSpecificDuration),
        selectedValue: addSpecificName,
      },
    ]);
  };

  const handleInsertBefore = (index: number) => {
    setSectionDetails((prev) => [
      ...prev.slice(0, index),
      { duration: 1, selectedValue: "" },
      ...prev.slice(index),
    ]);
  };

  const handleInsertAfter = (index: number) => {
    setSectionDetails((prev) => [
      ...prev.slice(0, index + 1),
      { duration: 1, selectedValue: "" },
      ...prev.slice(index + 1),
    ]);
  };

  const handleUpdateDetail = (index: number, newValue: string) => {
    setSectionDetails((prev) =>
      prev.map((detail, i) =>
        i === index ? { ...detail, selectedValue: newValue } : detail
      )
    );
  };

  const handleSaveSectionDetails = async () => {
    if (!sectionData) return;
    setIsSaving(true);

    try {
      const projectRef = doc(db, "jamspace", jamspace);
      const snap = await getDoc(projectRef);

      if (!snap.exists()) {
        console.warn("⚠️ Project not found in Firestore.");
        return;
      }

      const projectData = snap.data();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedSections = projectData.sections.map((sec: any) =>
        sec.id === sectionData.id
          ? { ...sec, details: sectionDetails } // 🔥 Replace details array
          : sec
      );

      await updateDoc(projectRef, { sections: updatedSections });
      console.log("✅ Details successfully saved to Firestore!");
      setIsSaving(false);
    } catch (error) {
      console.error("❌ Error saving details:", error);
    }
  };

  const handlePlayChord = useCallback(
    async (notes: string[], bass: string, duration: number) => {
      await Tone.start();
      const sampler = samplerRef.current;
      if (!sampler || !samplerLoaded) return;

      const fullChord = [bass, ...notes];
      sampler.triggerAttackRelease(fullChord, duration);

      // Wait until chord finishes playing before moving on
      const durationMs =
        typeof duration === "number"
          ? duration * 1000 // if Tone duration is in seconds
          : Tone.Time(duration).toMilliseconds();

      await new Promise((r) => setTimeout(r, durationMs));
    },
    [samplerLoaded]
  );

  const handlePlayNote = useCallback(
    async (key: string, duration: number) => {
      await Tone.start();
      const sampler = samplerRef.current;
      if (!sampler || !samplerLoaded) return;

      sampler.triggerAttackRelease(key, duration);

      // Wait until note finishes playing before continuing
      const durationMs =
        typeof duration === "number"
          ? duration * 1000
          : Tone.Time(duration).toMilliseconds();

      await new Promise((r) => setTimeout(r, durationMs));
    },
    [samplerLoaded]
  );

  const handlePlayAll = useCallback(async () => {
    setIsPlaying(true);
    setIsPaused(false);
    for (let i = 0; i < sectionDetails.length; i++) {
      const detail = sectionDetails[i];
      setCurrentIndex(i);
      if (isPaused) break;

      if (sectionData?.type === "Notes") {
        await handlePlayNote(detail.selectedValue, detail.duration);
      } else {
        const chordInfo = chordsData
          .flatMap((group) => group.chordList)
          .find((chord) => chord.symbol === detail.selectedValue);
        if (chordInfo) {
          await handlePlayChord(
            chordInfo.notes,
            chordInfo.bass,
            detail.duration
          );
        }
      }
    }
    setIsPlaying(false);
    setCurrentIndex(0);
  }, [sectionDetails, sectionData, handlePlayChord, handlePlayNote, isPaused]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    setIsPlaying(false);
    setIsRepeating(false);
    shouldRepeatRef.current = false;
    if (repeatIntervalRef.current) {
      clearTimeout(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  const handlePlayWithRepeat = useCallback(async () => {
    setIsRepeating(true);
    setIsPlaying(true);
    setIsPaused(false);
    shouldRepeatRef.current = true;

    const playLoop = async () => {
      for (let i = 0; i < sectionDetails.length; i++) {
        if (!shouldRepeatRef.current) break;

        const detail = sectionDetails[i];
        setCurrentIndex(i);

        if (sectionData?.type === "Notes") {
          await handlePlayNote(detail.selectedValue, detail.duration);
        } else {
          const chordInfo = chordsData
            .flatMap((group) => group.chordList)
            .find((chord) => chord.symbol === detail.selectedValue);
          if (chordInfo) {
            await handlePlayChord(
              chordInfo.notes,
              chordInfo.bass,
              detail.duration
            );
          }
        }
      }

      if (shouldRepeatRef.current) {
        repeatIntervalRef.current = setTimeout(playLoop, 50);
      } else {
        setIsPlaying(false);
        setIsRepeating(false);
        setCurrentIndex(0);
      }
    };

    await playLoop();
  }, [sectionDetails, sectionData, handlePlayChord, handlePlayNote]);

  const round = (value: number, precision = 2) =>
    Number(value.toFixed(precision));

  const handleChangeDurationForAll = (delta: number) => {
    setSectionDetails((prev) =>
      prev.map((detail) => ({
        ...detail,
        duration: Math.max(DURATION_STEPS, round(detail.duration + delta)),
      }))
    );
  };

  const handleResetDurationForAll = () => {
    setSectionDetails((prev) =>
      prev.map((detail) => ({
        ...detail,
        duration: 4,
      }))
    );
  };

  const handleSliderChange = (index: number, newDuration: number) => {
    const roundedDuration = round(
      Math.round(newDuration / DURATION_STEPS) * DURATION_STEPS
    );
    setSectionDetails((prev) =>
      prev.map((detail, i) =>
        i === index ? { ...detail, duration: roundedDuration } : detail
      )
    );
  };

  const handleCalculateTotalDuration = () => {
    const result = sectionDetails.reduce(
      (acc, detail) => acc + detail.duration,
      0
    );

    return round(result);
  };

  const handleCalculateTotalSelectedSectionDuration = (sec: SectionType) => {
    return sec.details.reduce((acc, detail) => acc + detail.duration, 0);
  };

  const handlePlaySelectedSection = async () => {
    const selectedSec = sectionList.find((sec) => sec.name === selectedSection);
    if (!selectedSec) return;
    handlePlayAll();
    for (let i = 0; i < selectedSec.details.length; i++) {
      const detail = selectedSec.details[i];
      if (!detail) continue;

      if (selectedSec.type === "Notes") {
        await handlePlayNote(detail.selectedValue, detail.duration);
      } else {
        const chordInfo = chordsData
          .flatMap((group) => group.chordList)
          .find((chord) => chord.symbol === detail.selectedValue);
        if (chordInfo) {
          await handlePlayChord(
            chordInfo.notes,
            chordInfo.bass,
            detail.duration
          );
        }
      }
    }
  };

  // const handleChangeTranspoteForAll = (value: number) => {
  //   const allChordsSymbols = chordsData.flatMap((group) =>
  //     group.chordList.map((chord) => chord.symbol)
  //   );
  //   setSectionDetails((prev) =>
  //     prev.map((detail) => {
  //       const noteIndex = notesData.findIndex(
  //         (note) => note === detail.selectedValue
  //       );
  //       if (noteIndex === -1) return detail;

  //       let newIndex = noteIndex + value;
  //       if (newIndex < 0) newIndex = 0;
  //       if (newIndex >= notesData.length) newIndex = notesData.length - 1;

  //       return {
  //         ...detail,
  //         selectedValue: notesData[newIndex],
  //       };
  //     })
  //   );
  // };

  return (
    <>
      <TabTitle title="Section" />
      <Navbar currentPath="JamJar" />
      <main className={style.PageContainer}>
        {/* HEADER */}
        <div className={style.Header}>
          <div className={style.Heading}>
            <button
              type="button"
              className={style.BackButton}
              onClick={handleNavigateBack}
            >
              <ArrowLeft className={style.Icon} />
            </button>
            <div className={style.Title}>Section name:</div>
            <div className={style.Value}>{sectionData?.name}</div> -
            <div className={style.Value}>{handleCalculateTotalDuration()}s</div>{" "}
            -<div className={style.Value}>{sectionDetails.length} sections</div>
          </div>
        </div>
        {/* CONTENT */}
        <div className={style.Content}>
          {/* CONTROLLER */}
          <div className={style.Controller}>
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
                <option
                  key={inst.name}
                  value={inst.name}
                  className={style.Option}
                >
                  {inst.name}
                </option>
              ))}
            </select>

            <div className={style.Item}>
              <div className={style.Title}>Duration: </div>
              <button
                type="button"
                className={style.DurationAdjustButton}
                onClick={() => handleChangeDurationForAll(-DURATION_STEPS)}
              >
                <Minus size={16} /> {DURATION_STEPS}
              </button>
              <button
                type="button"
                className={style.DurationAdjustButton}
                onClick={() => handleChangeDurationForAll(+DURATION_STEPS)}
              >
                <Plus size={16} /> {DURATION_STEPS}
              </button>
              <button
                type="button"
                className={style.DurationAdjustButton}
                onClick={handleResetDurationForAll}
              >
                Reset
              </button>
            </div>

            {/* <div className={style.Item}>
              <div className={style.Title}>Transpose:</div>
              <button
                type="button"
                className={style.DurationAdjustButton}
                // onClick={() => handleChangeTranspoteForAll(1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className={style.DurationAdjustButton}
                // onClick={() => handleChangeTranspoteForAll(-1)}
              >
                <ArrowDown size={16} />
              </button>
            </div> */}
          </div>
          {/* SECTION LIST */}
          <div className={style.SectionDetailsContainer}>
            {sectionDetails.map((item, index) => (
              // SECTION ITEM
              <div key={index} className={clsx(style.SectionDetailItem)}>
                <button
                  type="button"
                  className={clsx(style.InsertButton, style.Left)}
                  onClick={() => handleInsertBefore(index)}
                  title="Insert before"
                >
                  <PlusCircle size={16} className={style.InsertButtonIcon} />
                </button>
                {sectionData?.type === "Notes" ? (
                  <NotesSelection
                    value={item.selectedValue}
                    onChange={(v) => handleUpdateDetail(index, v)}
                  />
                ) : (
                  <ChordsSelection
                    value={item.selectedValue}
                    onChange={(v) => handleUpdateDetail(index, v)}
                  />
                )}
                <div className={style.DurationControl}>
                  <div className={style.DurationValue}>{item.duration}</div>
                  <input
                    type="range"
                    min={DURATION_STEPS}
                    max={10}
                    step={DURATION_STEPS}
                    value={item.duration}
                    onChange={(e) =>
                      handleSliderChange(index, Number(e.target.value))
                    }
                  />
                </div>

                <div className={style.DetailActions}>
                  <button
                    className={clsx(style.Play, style.Button)}
                    type="button"
                    onClick={() => {
                      if (sectionData?.type === "Notes") {
                        handlePlayNote(item.selectedValue, item.duration);
                        setCurrentIndex(index);
                      } else {
                        const chordInfo = chordsData
                          .flatMap((group) => group.chordList)
                          .find((chord) => chord.symbol === item.selectedValue);
                        if (chordInfo) {
                          handlePlayChord(
                            chordInfo.notes,
                            chordInfo.bass,
                            item.duration
                          );
                        }
                        setCurrentIndex(index);
                      }
                    }}
                  >
                    <Play size={16} className={style.PlayIcon} />
                  </button>
                  <button
                    type="button"
                    className={clsx(style.Remove, style.Button)}
                    onClick={() => {
                      setSectionDetails((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <X size={16} className={style.DeleteIcon} />
                  </button>
                </div>

                <button
                  type="button"
                  className={clsx(style.InsertButton, style.Right)}
                  onClick={() => handleInsertAfter(index)}
                  title="Insert before"
                >
                  <PlusCircle size={16} className={style.InsertButtonIcon} />
                </button>

                <div
                  className={clsx(
                    style.PlayingIndicator,
                    currentIndex === index && isPlaying && style.PlayingItem
                  )}
                ></div>
              </div>
            ))}

            {/* ADD NEW BUTTONS */}
            <div className={style.AddNewButton}>
              <button
                type="button"
                className={style.Button}
                onClick={() =>
                  handleCreateNewSectionDetail(Number(quantityToAdd))
                }
              >
                <PlusCircle /> Add New
              </button>
              <input
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
              />
            </div>
            <div className={style.AddNewButton}>
              <button
                type="button"
                className={style.Button}
                onClick={() => handleCreateSpecificSectionDetail()}
              >
                <PlusCircle /> Add Specific
              </button>
              <input
                value={addSpecificName}
                onChange={(e) => setAddSpecificName(e.target.value)}
              />
              <input
                value={addSpecificDuration}
                onChange={(e) => setAddSpecificDuration(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MAIN ACTIONS */}
        <div className={style.Actions}>
          <button
            type="button"
            className={clsx(style.Button, style.Play)}
            onClick={isPlaying ? handlePause : handlePlayAll}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className={clsx(style.Button, style.Play)}
            onClick={isRepeating ? handlePause : handlePlayWithRepeat}
          >
            {isRepeating ? "Stop Repeat" : "Play Repeat"}
          </button>
          <div className={style.PlaySections}>
            <button
              type="button"
              className={clsx(style.Button, style.Play)}
              onClick={handlePlaySelectedSection}
            >
              Play sections
            </button>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={style.Select}
            >
              <option value="" className={style.Option}>
                Select a section
              </option>
              {sectionList.map((sec) => (
                <option value={sec.name} className={style.Option}>
                  {sec.name} -{" "}
                  {handleCalculateTotalSelectedSectionDuration(sec)}s
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={clsx(style.Button)}
            onClick={handleSaveSectionDetails}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </main>
    </>
  );
}
