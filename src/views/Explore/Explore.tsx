import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import style from "./Explore.module.scss";
import { Search, XIcon, HeartIcon, Plus } from "lucide-react";
import { useVideoListing } from "../../libs/Videos/hooks/useVideoListing";
import clsx from "clsx";
import TabTitle from "../../components/TabTitle/TabTitle";
import useFavorites from "../../libs/Videos/hooks/useFavorite";

export default function Explore() {
  const [inputValue, setInputValue] = useState("");
  const [songName, setSongName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: videosData, isLoading: isLoadingVideo } =
    useVideoListing(songName);

  const onSearch = () => {
    setSongName(inputValue);
  };

  return (
    <>
      <TabTitle title="Explore" />
      <Navbar />
      <main className={style.PageContainer}>
        <div className={style.HeaderContainer}>
          <h1 className={style.Header}>Find the Tune That Fits You</h1>
          <p className={style.SubHeader}>
            Discover songs that match your mood and style.
          </p>
        </div>

        <div className={style.SearchContainer}>
          <div className={style.InputWrapper}>
            <Search className={style.SearchIcon} />
            <div className={style.InputInnerWrapper}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for songs..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    onSearch();
                  }
                }}
                className={style.SearchInput}
              />
              {inputValue && (
                <button
                  className={style.SearchClear}
                  onClick={() => {
                    setInputValue("");
                    inputRef.current?.focus();
                  }}
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onSearch}
            className={style.SearchButton}
            disabled={!inputValue.trim()}
          >
            Search
          </button>
        </div>

        <div className={style.VideosContainer}>
          {isLoadingVideo && <p>Loading...</p>}
          {videosData?.items.map((video) => (
            <div key={video.id.videoId} className={style.VideoCard}>
              <iframe
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                title={video.snippet.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <p className={style.Title}>{video.snippet.title}</p>
              <div className={style.CardBreaker}></div>
              <div className={style.Actions}>
                <button
                  onClick={() =>
                    toggleFavorite({
                      id: video.id.videoId,
                      title: video.snippet.title,
                      thumbnail: video.snippet.thumbnails.high.url,
                    })
                  }
                  type="button"
                  className={clsx(
                    style.ActionButton,
                    isFavorite(video.id.videoId) && style.FavoriteButton
                  )}
                >
                  <HeartIcon
                    className={clsx(
                      style.Icon,
                      isFavorite(video.id.videoId) && style.HeartActive
                    )}
                  />
                  {isFavorite(video.id.videoId) ? (
                    <></>
                  ) : (
                    <p className={style.Label}>Favorite</p>
                  )}
                </button>
                <button type="button" className={style.ActionButton}>
                  <Plus className={style.Icon} />
                  <p className={style.Label}>Contribute</p>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
