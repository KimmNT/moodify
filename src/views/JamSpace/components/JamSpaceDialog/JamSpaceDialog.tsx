import clsx from "clsx";
import style from "./JamSpaceDialog.module.scss";
import { useEffect, useRef, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { useNavigate } from "@tanstack/react-router";

interface JamSpaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JamSpaceDialog({
  isOpen,
  onClose,
}: JamSpaceDialogProps) {
  const [projectName, setProjectName] = useState("");
  const [tempo, setTempo] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigation = useNavigate();

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

  const handleCreateJamSpace = async () => {
    if (!projectName) return;

    setIsSubmitting(true);
    setSuccess(null);

    try {
      const jamspaceCollection = collection(db, "jamspace");

      const result = await addDoc(jamspaceCollection, {
        projectId: uniqueIdFromString(projectName),
        projectName,
        tempo,
        timestamp: Date.now(),
      });
      setSuccess(true);
      navigation({
        to: `/jamjar/jamspace/${result.id}`,
      });
    } catch (err) {
      console.error("❌ Failed to create jamspace:", err);
      setSuccess(false);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
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
            Project Name:
            <input
              ref={inputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={style.TextInput}
            />
          </label>
          <label className={style.InputLabel}>
            Tempo (BPM):
            <div className={style.TempoInputContainer}>
              <button
                type="button"
                className={style.Button}
                onClick={() => setTempo(tempo - 1)}
              >
                -
              </button>
              <input
                type="number"
                className={style.TempoInput}
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
              />
              <button
                type="button"
                className={style.Button}
                onClick={() => setTempo(tempo + 1)}
              >
                +
              </button>
            </div>
          </label>
        </div>
        <div className={style.DialogActions}>
          <button
            type="button"
            onClick={() => {
              onClose();
              setProjectName("");
              setTempo(120);
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
            onClick={() => handleCreateJamSpace()}
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
