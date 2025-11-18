import clsx from "clsx";
import style from "./SectionDialog.module.scss";
import { useEffect, useRef, useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
// import { useNavigate } from "@tanstack/react-router";
import { db } from "../../../../../../../firebase";
import type { Section } from "../../../../../../libs/jamspace/modal";

interface SectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function SectionDialog({
  isOpen,
  onClose,
  projectId,
}: SectionDialogProps) {
  const [sectionName, setSectionName] = useState("");
  const [sectionType, setSectionType] = useState("Notes");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  //   const navigation = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const uniqueIdFromString = (str: string) => {
    const prefix = str.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 10);
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`;
  };

  const addSectionToJamspaceProject = async (
    projectId: string,
    section: Section
  ) => {
    if (sectionName.trim() === "" || sectionType.trim() === "") return;
    const projectRef = doc(db, "jamspace", projectId);

    await updateDoc(projectRef, {
      sections: arrayUnion(section),
      updatedAt: Date.now(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={clsx(style.DialogContainer, { [style.Open]: isOpen })}
      onClick={handleClickOutside}
    >
      <div className={style.DialogContent}>
        <div className={style.DialogHeader}>Create New Project</div>
        <div className={style.DialogBody}>
          <label className={style.InputLabel}>
            Section Name:
            <input
              ref={inputRef}
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className={style.TextInput}
            />
          </label>

          <div className={style.InputLabel}>
            Section Type:
            <div className={style.ButtonGroup}>
              <button
                type="button"
                className={clsx(
                  style.Button,
                  sectionType === "Chords" && style.Selected
                )}
                onClick={() => setSectionType("Chords")}
              >
                Chords
              </button>
              <button
                type="button"
                className={clsx(
                  style.Button,
                  sectionType === "Notes" && style.Selected
                )}
                onClick={() => setSectionType("Notes")}
              >
                Notes
              </button>
            </div>
          </div>
        </div>
        <div className={style.DialogActions}>
          <button
            type="button"
            onClick={() => {
              onClose();
              setSectionName("");
              setSectionType("Notes");
              setIsSubmitting(false);
              setSuccess(null);
            }}
            className={clsx(style.ActionButton, style.Cancel)}
          >
            Close
          </button>
          <button
            type="button"
            className={clsx(style.ActionButton, style.Confirm)}
            onClick={() =>
              addSectionToJamspaceProject(projectId ?? "", {
                id: uniqueIdFromString(sectionName),
                name: sectionName,
                type: sectionType,
                details: [],
              })
            }
          >
            {isSubmitting
              ? "Creating..."
              : success === true
                ? "Created!"
                : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
