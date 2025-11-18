import style from "./JamSpaceDetail.module.scss";
import * as Tone from "tone";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { JamSpaceDetialRoute } from "../../../../routeRegistry";
import { useCallback, useEffect, useRef, useState } from "react";
import { Section, type JamProject } from "../../../../libs/jamspace/modal";
import { db } from "../../../../../firebase";
import TabTitle from "../../../../components/TabTitle/TabTitle";
import Navbar from "../../../../components/Navbar/Navbar";
import Loading from "../../../../components/Loading/Loading";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Pen, Plus } from "lucide-react";
import Button from "../../../../components/Button/Button";
import { useFirebaseHelper } from "../../../../hooks/useFirebaseHelper";
import SectionDialog from "./components/SectionDialog/SectionDialog";
// import notesData from "../../../../db/notes.json";
import chordsData from "../../../../db/chords.json";
// import instruments from "../../../../db/intruments.json";
import octaves from "../../../../db/octaves.json";

type JamspaceProject = JamProject & { id: string };

export default function JamSpaceDetail() {
  const { jamspace } = JamSpaceDetialRoute.useParams();
  const samplerRef = useRef<Tone.Sampler | null>(null);

  const [project, setProject] = useState<JamspaceProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");
  const [tempo, setTempo] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [samplerLoaded, setSamplerLoaded] = useState(false);

  const navigation = useNavigate();
  const { removeItemFromArrayField } = useFirebaseHelper();

  useEffect(() => {
    let isMounted = true;

    const sampler = new Tone.Sampler({
      urls: octaves,
      baseUrl: `/sounds/piano/`,
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchProject() {
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
      const data = await loadProjectItem(jamspace);
      if (data && isMounted) {
        setProject(data);
        setProjectName(data.projectName);
        setTempo(data.tempo);
      }
    }

    fetchProject();
    setLoading(false);

    return () => {
      isMounted = false;
    };
  }, [jamspace, isEdit, isUpdating, isOpen]);

  const navigateBack = () => {
    if (project) {
      navigation({
        to: "/jamjar/jamspace",
        params: { jamspace: project.id },
      });
    }
  };

  const sectionDetailNavigation = (sectionId: string) => {
    navigation({
      to: `/jamjar/jamspace/${project?.id}/section/${sectionId}`,
    });
  };

  const editJamspaceProject = async (
    projectId: string,
    updates: { projectName?: string; tempo?: number }
  ) => {
    const projectRef = doc(db, "jamspace", projectId);

    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const handleEditProject = async () => {
    try {
      await editJamspaceProject(project?.id ?? "", {
        projectName: projectName,
        tempo: tempo,
      });
      setIsEdit(false);
    } catch (err) {
      console.error("❌ Error updating project:", err);
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

  const handlePlaySection = async (selectedSection: Section) => {
    for (let i = 0; i < selectedSection.details.length; i++) {
      const detail = selectedSection.details[i];

      if (selectedSection.type === "Notes") {
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

  return (
    <>
      <TabTitle title={project?.projectName ?? "Project"} />
      <Navbar currentPath="JamJar" />
      <main className={style.PageContainer}>
        {loading ? (
          <Loading />
        ) : (
          <div className={style.Content}>
            <div className={style.Header}>
              <button
                type="button"
                className={style.BackButton}
                onClick={navigateBack}
              >
                <ArrowLeft size={20} className={style.Icon} />
              </button>
              <div className={style.Info}>
                <div className={style.Item}>
                  <div className={style.Heading}>Name:</div>
                  {isEdit ? (
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  ) : (
                    <div className={style.Value}>{project?.projectName}</div>
                  )}
                </div>
                <div className={style.Breaker}></div>
                <div className={style.Item}>
                  <div className={style.Heading}>Tempo:</div>
                  {isEdit ? (
                    <input
                      type="text"
                      value={tempo}
                      onChange={(e) => setTempo(parseInt(e.target.value))}
                    />
                  ) : (
                    <div className={style.Value}>{project?.tempo}</div>
                  )}
                </div>
                <div className={style.Breaker}></div>
                {isEdit ? (
                  <button
                    type="button"
                    className={style.EditButton}
                    onClick={() => handleEditProject()}
                  >
                    <Check className={style.EditIcon} size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={style.EditButton}
                    onClick={() => setIsEdit(true)}
                  >
                    <Pen className={style.EditIcon} size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className={style.Sections}>
              <div className={style.SectionsHeader}>Sections</div>
              <div className={style.SectionList}>
                {project?.sections && project.sections.length > 0 ? (
                  <>
                    {project?.sections.map((section) => {
                      const totalDuration = section.details.reduce(
                        (acc, detail) => acc + detail.duration,
                        0
                      );
                      return (
                        <div key={section.id} className={style.SectionItem}>
                          <div className={style.Item}>
                            <div className={style.ItemTitle}>Name:</div>
                            <div className={style.ItemValue}>
                              {section.name}
                            </div>
                          </div>
                          <div className={style.Item}>
                            <div className={style.ItemTitle}>Type:</div>
                            <div className={style.ItemValue}>
                              {section.type}
                            </div>
                          </div>
                          <div className={style.Item}>
                            <div className={style.ItemTitle}>Set:</div>
                            <div className={style.ItemValue}>
                              {section.details.map((item, index) => (
                                <div key={index}>{item.selectedValue}-</div>
                              ))}
                            </div>
                          </div>
                          <div className={style.Item}>
                            <div className={style.ItemTitle}>Play time:</div>
                            <div className={style.ItemValue}>
                              {totalDuration}s
                            </div>
                          </div>
                          <div className={style.Controllers}>
                            <Button
                              title="Play"
                              isPrimary={true}
                              onClick={() => handlePlaySection(section)}
                            />
                            <Button
                              title="Edit"
                              onClick={() =>
                                sectionDetailNavigation(section.id)
                              }
                            />
                            <Button
                              title="Delete"
                              isDelete={true}
                              onClick={() => {
                                removeItemFromArrayField(
                                  "jamspace",
                                  project.id,
                                  "sections",
                                  "id",
                                  section.id
                                );
                                setIsUpdating(!isUpdating);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
                <button
                  type="button"
                  className={style.AddSectionButton}
                  onClick={() => setIsOpen(true)}
                >
                  <Plus size={15} />
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}
        <SectionDialog
          projectId={project?.id ?? ""}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </main>
    </>
  );
}
