import { useEffect, useState } from "react";
import style from "./LyricGenerating.module.scss";
import { X } from "lucide-react";

interface LyricGeneratingProps {
  song: string;
  onClose?: () => void;
}

export default function LyricGenerating({
  song,
  onClose,
}: LyricGeneratingProps) {
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!song) return;

    const fetchLyrics = async () => {
      setLoading(true);
      setLyrics("");

      try {
        const res = await fetch(
          `https://moodify-lyrics-scraper.onrender.com/lyrics?title=${encodeURIComponent(song)}`
        );
        const data = await res.json();
        setLyrics(data.lyrics || "❌ Lyrics not found");
      } catch (err) {
        console.error(err);
        setLyrics("⚠️ Error fetching lyrics");
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [song]); // 👈 refetch whenever song changes
  return (
    <div className={style.LyricContainer}>
      {loading && <p>Loading...</p>}

      {lyrics && (
        <div className={style.LyricContent}>
          <button type="button" className={style.CloseButton}>
            <X onClick={onClose} className={style.CloseIcon} />
          </button>
          <h2 className={style.Title}>{song}</h2>
          <pre className={style.Lyrics}>{lyrics}</pre>
        </div>
      )}
    </div>
  );
}
