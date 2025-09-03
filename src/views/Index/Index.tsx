import { useState } from "react";
import type { VideoItem } from "../../libs/Videos/VideoModel";
import Navbar from "../../components/Navbar/Navbar";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function Index() {
  const [songName, setSongName] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function testFirestore() {
    const testRef = doc(db, "tests", "connection"); // collection "tests", doc "connection"

    // Write test data
    await setDoc(testRef, {
      connected: true,
      timestamp: Date.now(),
    });

    // Read it back
    const snap = await getDoc(testRef);
    if (snap.exists()) {
      console.log("✅ Firestore connected:", snap.data());
    } else {
      console.log("❌ Test document not found");
    }
  }

  testFirestore();

  const searchYouTube = async (songName: string) => {
    setLoading(true);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${songName}&type=video&maxResults=5&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    setVideos(data.items || []);
    setLoading(false);
  };

  console.log(videos);

  return (
    <>
      <Navbar />
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">🎶 Search for song</h1>
        <input
          type="text"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchYouTube(songName)}
          placeholder="Enter song name..."
        />
        <button type="button" onClick={() => searchYouTube(songName)}>
          search
        </button>

        {loading && <p>Loading songs...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.id.videoId}
              className="rounded-lg overflow-hidden shadow-md"
            >
              <iframe
                width="100%"
                height="250"
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                title={video.snippet.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <p className="p-2 text-sm">{video.snippet.title}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
