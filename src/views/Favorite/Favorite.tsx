import clsx from "clsx";
import Navbar from "../../components/Navbar/Navbar";
import TabTitle from "../../components/TabTitle/TabTitle";
import useFavorites from "../../libs/Videos/hooks/useFavorite";
import style from "./Favorite.module.scss";
import { HeartIcon, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { usePlayerStore } from "../../libs/youtubePlayer/store";

export default function Favorite() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { setQueue, play, playingId } = usePlayerStore();

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
            onClick={() => play(favorites[0]?.id)}
          >
            <Play className={style.Icon} />
            <p className={style.Label}>Play all</p>
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
                    className={style.VideoCard}
                    id={`video-${item.id}`}
                    onClick={() => play(item.id)}
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
      </main>
    </>
  );
}
