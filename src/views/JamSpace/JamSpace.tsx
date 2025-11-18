import { Music, Plus } from "lucide-react";
import TabTitle from "../../components/TabTitle/TabTitle";
import Navbar from "../../components/Navbar/Navbar";
import style from "./JamSpace.module.scss";
import JamSpaceDialog from "./components/JamSpaceDialog/JamSpaceDialog";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../firebase";
import type { JamProject } from "../../libs/jamspace/modal";
import Loading from "../../components/Loading/Loading";
import Button from "../../components/Button/Button";
import { useNavigate } from "@tanstack/react-router";

export default function JamSpace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigation = useNavigate();

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  const [projects, setProjects] = useState<JamProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference to the 'jamspace' collection
    const jamspaceCollection = collection(db, "jamspace");

    // Optional: sort by timestamp
    const q = query(jamspaceCollection, orderBy("timestamp", "desc"));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jamspaces = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<JamProject, "id">),
      }));
      setProjects(jamspaces);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, "jamspace", projectId));
      console.log("✅ Jamspace deleted:", projectId);
    } catch (err) {
      console.error("❌ Failed to delete jamspace:", err);
    }
  };

  const handleJamProject = (projectId: string) => {
    navigation({
      to: `/jamjar/jamspace/${projectId}`,
    });
  };

  return (
    <>
      <TabTitle title="JamSpace" />
      <Navbar currentPath="JamJar" />
      <main className={style.PageContainer}>
        <div className={style.PageContent}>
          <div className={style.ProjectsHeader}>
            <div className={style.Heading}>Projects</div>
            <button
              type="button"
              className={style.NewProjectButton}
              onClick={handleOpenDialog}
            >
              <Plus className={style.Icon} />
              <div className={style.Text}>New Project</div>
            </button>
          </div>

          <div className={style.ProjectsList}>
            {loading ? (
              <Loading />
            ) : projects.length === 0 ? (
              <div>No projects found.</div>
            ) : (
              <div className={style.ProjectList}>
                {projects.map((project) => (
                  <div key={project.id} className={style.ProjectItem}>
                    <div className={style.ProjectIconContainer}>
                      <Music size={30} className={style.ProjectIcon} />
                    </div>
                    <div className={style.ProjectInfo}>
                      <div className={style.Item}>
                        Name: {project.projectName}
                      </div>
                      <div className={style.Item}>Tempo: {project.tempo}</div>
                      <div className={style.Item}>Sections: 0</div>
                      <div className={style.Item}>
                        Created at:{" "}
                        {new Date(project.timestamp).toLocaleString()}
                      </div>
                      <div className={style.Contoller}>
                        <Button
                          title="Delete"
                          onClick={() => handleDeleteProject(project.id)}
                        />
                        <Button
                          title="Resume"
                          isPrimary={true}
                          onClick={() => handleJamProject(project.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <JamSpaceDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </main>
    </>
  );
}
