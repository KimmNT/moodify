import { useState } from "react";

export default function LyricsFetcher() {
  const [artist, setArtist] = useState("You Belong With Me");
  const [song, setSong] = useState("Taylor Swift");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLyrics = async () => {
    setLoading(true);
    setLyrics("");

    try {
      const res = await fetch(
        `http://localhost:3001/lyrics?artist=${artist}&song=${song}`
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎤 Moodify Karaoke</h1>

      <input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
        style={{ marginRight: "1rem" }}
      />
      <input
        value={song}
        onChange={(e) => setSong(e.target.value)}
        placeholder="Song"
        style={{ marginRight: "1rem" }}
      />
      <button onClick={fetchLyrics}>Get Lyrics</button>

      {loading && <p>Loading...</p>}

      {lyrics && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: "2rem" }}>
          {lyrics}
        </pre>
      )}
    </div>
  );
}
