import clsx from "clsx";
import Navbar from "../../components/Navbar/Navbar";
import TabTitle from "../../components/TabTitle/TabTitle";
import useFavorites from "../../libs/Videos/hooks/useFavorite";
import style from "./Favorite.module.scss";
import {
  ArrowLeft,
  Copy,
  HeartIcon,
  Import,
  Pause,
  Play,
  Plus,
  Shuffle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerStore } from "../../libs/youtubePlayer/store";
import pako from "pako";
import type { Favorite as FavoriteList } from "../../libs/Videos/VideoModel";

export default function Favorite() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { setQueue, play, playingId } = usePlayerStore();
  const [compressed, setCompressed] = useState("");
  const [decompressed, setDecompressed] = useState<FavoriteList[] | null>(null);
  const [input, setInput] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const stored = localStorage.getItem("favorites") ?? "";

  const compress = (str: string) => {
    const binary = pako.gzip(str);
    // setCompressed(btoa(String.fromCharCode(...binary)));
    return btoa(String.fromCharCode(...binary)); // base64
  };

  const decompress = (base64: string) => {
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decompressResult = pako.ungzip(binary, { to: "string" });
    setDecompressed(JSON.parse(decompressResult));
  };

  const handleCompress = () => {
    const compressResult = compress(stored);
    setCompressed(compressResult);
    navigator.clipboard.writeText(compressResult);
  };

  useEffect(() => {
    setQueue(favorites);
  }, [favorites]);

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

  function shuffleDifferent<T>(array: T[]): T[] {
    if (array.length < 2) return [...array];

    let result: T[];
    do {
      result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    } while (result.every((val, idx) => val === array[idx]));

    return result;
  }

  const handleShuffle = () => {
    const shuffled = shuffleDifferent(favorites);
    console.log(shuffled);
    setQueue(shuffled);
    if (shuffled.length > 0) {
      play(shuffled[0].id);
    }
  };

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
          <button
            type="button"
            className={style.Button}
            onClick={() => handleShuffle()}
          >
            <Shuffle className={style.Icon} />
            <p className={style.Label}>Shuffle</p>
          </button>

          <button
            type="button"
            className={style.Button}
            onClick={() => {
              play(favorites[0]?.id);
            }}
          >
            <Play className={style.Icon} />
            <p className={style.Label}>Play all</p>
          </button>
          <button
            type="button"
            className={style.Button}
            onClick={() => handleCompress()}
          >
            <Copy className={style.Icon} />
            <p className={style.Label}>
              {compressed !== "" ? "Copied" : "Copy list ID"}
            </p>
          </button>
          <button
            type="button"
            className={style.Button}
            onClick={() => setIsImportOpen(true)}
          >
            <Import className={style.Icon} />
            <p className={style.Label}>Import</p>
          </button>
          {/* <button type="button" className={style.Button}>
            <Edit2 className={style.Icon} />
            <p className={style.Label}>Edit list</p>
          </button> */}
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
                    className={clsx(
                      style.VideoCard,
                      playingId === item.id && style.Playing
                    )}
                    id={`video-${item.id}`}
                  >
                    <div className={style.VideoWrapper}>
                      <img
                        src={item.thumbnail}
                        alt=""
                        className={style.VideoImage}
                      />
                      <p className={style.Title}>{item.title}</p>
                    </div>
                    <div className={style.Actions}>
                      <button
                        className={style.ActionButton}
                        type="button"
                        onClick={() => {
                          play(item.id);
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
                      {/* <button type="button" className={style.ActionButton}>
                        <Plus className={style.Icon} />
                      </button> */}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {isImportOpen && (
          <div className={style.ImportListingContainer}>
            <div className={style.ImportListingBox}>
              {decompressed === null ? (
                <>
                  <button
                    type="button"
                    className={style.CloseButton}
                    onClick={() => setIsImportOpen(false)}
                  >
                    <X className={style.Icon} />
                  </button>
                  <div className={style.HeaderContainer}>
                    <h2 className={style.Header}>Import Favorites</h2>
                    <p className={style.SubHeader}>
                      Have a list ID? Import it here to get your favorite songs
                      back.
                    </p>
                  </div>
                  <div className={style.InputContainer}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                      onClick={() => decompress(input)}
                      className={style.SubmitButton}
                    >
                      Import now!
                    </button>
                  </div>
                </>
              ) : (
                <div className={style.DecompressedContainer}>
                  <button
                    onClick={() => setDecompressed(null)}
                    className={style.Navigation}
                  >
                    <ArrowLeft /> Go back to import
                  </button>
                  <div className={style.InfoContainer}>
                    <p className={style.Total}>
                      Total: {decompress.length} songs
                    </p>
                    <button
                      type="button"
                      className={style.AddAllButton}
                      onClick={() => {
                        localStorage.setItem(
                          "favorites",
                          JSON.stringify(decompressed)
                        );
                        window.location.reload();
                        setIsImportOpen(false);
                      }}
                    >
                      <Plus /> Replace
                    </button>
                    <button
                      type="button"
                      className={style.AddAllButton}
                      onClick={() => {
                        decompressed.forEach((item) => {
                          if (!isFavorite(item.id)) {
                            toggleFavorite(item);
                          }
                        });
                        setIsImportOpen(false);
                      }}
                    >
                      <Plus /> Combine
                    </button>
                  </div>
                  <div className={style.DecompressedList}>
                    {decompressed.map((item) => (
                      <div className={style.Item} key={item.id}>
                        <img src={item.thumbnail} alt="" />
                        <div className={style.Heading}>
                          {item.title.substring(0, 50)}
                        </div>
                        <div className={style.Controls}>
                          <button
                            type="button"
                            className={style.Button}
                            onClick={() => play(item.id)}
                          >
                            <Play className={style.Icon} /> Play
                          </button>
                          <button
                            type="button"
                            className={style.Button}
                            onClick={() => toggleFavorite(item)}
                          >
                            <HeartIcon className={style.Icon} /> Add to
                            favorites
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
