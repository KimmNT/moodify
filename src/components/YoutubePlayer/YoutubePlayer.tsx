import { usePlayerStore } from "../../libs/youtubePlayer/store";
import YouTube from "react-youtube";
import type { YouTubeEvent, YouTubePlayer } from "react-youtube";
import style from "./YoutubePlayer.module.scss";
import { Shuffle, SkipBack, SkipForward } from "lucide-react";
import clsx from "clsx";

export default function YouTubePlayer() {
  const {
    playingId,
    isPlaying,
    playNext,
    playPrevious,
    // togglePlay,
    shuffle,
    toggleShuffle,
    queue,
  } = usePlayerStore();

  if (!playingId) return null;

  const opts = {
    width: "100%",
    height: "225",
    playerVars: {
      autoplay: isPlaying ? 1 : 0,
      // controls: 1,
      // mute: 1,
    },
  };

  const handleStateChange = (event: YouTubeEvent<YouTubePlayer>) => {
    // 0 = ENDED
    if (event.data === 0) {
      playNext();
    }
  };

  const handleGetSongNameById = (id: string) => {
    const song = queue.find((s) => s.id === id);
    return song ? song.title : "Unknown Title";
  };

  return (
    <div className={style.PlayerContainer}>
      {/* Heading */}
      <div className={style.VideoHeading}>
        <span>{handleGetSongNameById(playingId)}</span>
      </div>

      {/* Video */}
      <div className={style.PlaySpace}>
        <YouTube
          videoId={playingId ?? ""}
          opts={opts}
          onStateChange={handleStateChange}
        />
      </div>

      {/* Controls */}
      <div className={style.ControlsContainer}>
        <div className={style.Controls}>
          <button onClick={playPrevious} className={style.Button}>
            <SkipBack className={style.Icon} />
          </button>
          <button
            onClick={toggleShuffle}
            className={clsx(style.Button, shuffle && style.ActiveButton)}
          >
            <Shuffle
              className={clsx(style.Icon, shuffle && style.ActiveIcon)}
            />
          </button>
          <button onClick={playNext} className={style.Button}>
            <SkipForward className={style.Icon} />
          </button>
        </div>
      </div>
    </div>
  );
}
