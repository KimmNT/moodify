import clsx from "clsx";
import Navbar from "../../components/Navbar/Navbar";
import TabTitle from "../../components/TabTitle/TabTitle";
import useFavorites from "../../libs/Videos/hooks/useFavorite";
import style from "./Favorite.module.scss";
import {
  Edit2,
  Eye,
  HeartIcon,
  Pause,
  Play,
  Plus,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Favorite() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);

  const currentIndex = favorites.findIndex((f) => f.id === playingId);

  const playNext = () => {
    if (favorites.length === 0) return;

    if (isShuffle) {
      let randomId: string;
      do {
        const randomIndex = Math.floor(Math.random() * favorites.length);
        randomId = favorites[randomIndex].id;
      } while (randomId === playingId && favorites.length > 1);

      setPlayingId(randomId);
      setProgress(0);
      setIsPlaying(true);
    } else {
      const currentIndex = favorites.findIndex((f) => f.id === playingId);
      const nextIndex = (currentIndex + 1) % favorites.length;
      setPlayingId(favorites[nextIndex].id);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevSong = favorites[currentIndex - 1];
      setPlayingId(prevSong.id);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const playFirst = () => {
    setPlayingId(favorites[0].id);
    setProgress(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (playingId !== null) {
      const el = document.getElementById(`video-${playingId}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [playingId]);

  const findSongTitle = (id: string) => {
    const song = favorites.find((item) => item.id === id);
    return song ? song.title : "No song playing";
  };

  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDurations = async () => {
      const ids = favorites.map((f) => f.id).join(",");
      if (!ids) return;

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      const data = await res.json();

      const durationMap: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.items.forEach((item: any) => {
        const iso = item.contentDetails.duration;
        durationMap[item.id] = parseISODuration(iso);
      });
      setDurations(durationMap);
    };

    fetchDurations();
  }, [favorites]);

  const parseISODuration = (iso: string): number => {
    const match = iso.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = parseInt(match?.[1] ?? "0", 10);
    const seconds = parseInt(match?.[2] ?? "0", 10);
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && playingId) {
      interval = setInterval(() => {
        setProgress((p) => {
          const duration = durations[playingId] ?? 0;

          if (p + 1 >= duration) {
            clearInterval(interval!);

            // ⏸ stop playing and reset progress
            setIsPlaying(false);
            setProgress(duration);

            // ⏱ wait 1s then skip to next
            setTimeout(() => {
              playNext();
            }, 1000);

            return duration; // keep bar at 100% until next starts
          }

          return p + 1;
        });
      }, 1000); // +1 second per tick
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playingId, durations]);

  return (
    <>
      <TabTitle title="Favorite" />
      <Navbar />
      <main className={style.PageContainer}>
        <div className={style.HeaderContainer}>
          <h1 className={style.Header}>All Your Favorites, All in One Place</h1>
          <p className={style.SubHeader}>
            Easily access and manage your favorite songs anytime you want.
          </p>
        </div>

        <div className={style.ListControl}>
          <button type="button" className={style.Button} onClick={playFirst}>
            <Play className={style.Icon} />
            <p className={style.Label}>Play all</p>
          </button>
          <button type="button" className={style.Button}>
            <Edit2 className={style.Icon} />
            <p className={style.Label}>Edit list</p>
          </button>
        </div>

        <div className={style.VideosContainer}>
          {favorites.length === 0 ? (
            <p className={style.NoFavorites}>
              You have no favorite songs yet. Start exploring and add some!
            </p>
          ) : (
            <>
              {favorites.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={style.VideoCard}
                    id={`video-${item.id}`}
                  >
                    <div className={style.VideoWrapper}>
                      <iframe
                        src={`https://www.youtube.com/embed/${item.id}?autoplay=${
                          playingId === item.id ? 1 : 0
                        }`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      ></iframe>
                      <p className={style.Title}>{item.title}</p>
                    </div>
                    <div className={style.Actions}>
                      <button
                        className={style.ActionButton}
                        type="button"
                        onClick={() => {
                          setPlayingId(playingId === item.id ? null : item.id);
                          setProgress(0);
                          setIsPlaying(playingId !== item.id || !isPlaying);
                        }}
                      >
                        {playingId === item.id ? (
                          <Pause className={style.Icon} />
                        ) : (
                          <Play className={style.Icon} />
                        )}
                      </button>
                      <button
                        onClick={() => toggleFavorite(item)}
                        type="button"
                        className={clsx(
                          style.ActionButton,
                          isFavorite(item.id) && style.FavoriteButton
                        )}
                      >
                        <HeartIcon
                          className={clsx(
                            style.Icon,
                            isFavorite(item.id) && style.HeartActive
                          )}
                        />
                      </button>
                      <button type="button" className={style.ActionButton}>
                        <Plus className={style.Icon} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {playingId && (
          <div className={style.NowPlayingBar}>
            <div className={style.NowPlayingInfo}>
              <p className={style.Title}>{findSongTitle(playingId ?? "")}</p>
              {playingId && (
                <button
                  className={style.ViewButton}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`video-${playingId}`);
                    if (el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                  }}
                >
                  <Eye className={style.ViewIcon} />
                </button>
              )}
            </div>
            <div className={style.Controls}>
              <button className={style.Button} onClick={playPrevious}>
                <SkipBack className={style.Icon} />
              </button>
              <button type="button" className={style.Button}>
                {isPlaying ? (
                  <Pause className={style.Icon} />
                ) : (
                  <Play className={style.Icon} />
                )}
              </button>
              <button
                onClick={() => setIsShuffle((prev) => !prev)}
                className={clsx(style.Button, isShuffle && style.ActiveButton)}
              >
                <Shuffle
                  className={clsx(style.Icon, isShuffle && style.ActiveIcon)}
                />
              </button>
              <button className={style.Button} onClick={playNext}>
                <SkipForward className={style.Icon} />
              </button>
            </div>
            <div className={style.ProgressBarContainer}>
              <div
                className={clsx(style.ProgressBar)}
                style={{
                  width: `${(progress / durations[playingId ?? ""]) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
