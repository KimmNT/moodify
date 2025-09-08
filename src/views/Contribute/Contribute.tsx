import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import style from "./Contribute.module.scss";
import { Search, XIcon, HeartIcon, Plus, ArrowRight } from "lucide-react";
import { useVideoListing } from "../../libs/Videos/hooks/useVideoListing";
import clsx from "clsx";
import TabTitle from "../../components/TabTitle/TabTitle";
import useFavorites from "../../libs/Videos/hooks/useFavorite";
import { Link } from "@tanstack/react-router";
import { ContributeDetailRoute } from "../../routeRegistry";

export default function Contribute() {
  const [inputValue, setInputValue] = useState("");
  const [songName, setSongName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: videosData, isLoading: isLoadingVideo } =
    useVideoListing(songName);

  const onSearch = () => {
    setSongName(inputValue);
  };

  const handleSelectVideoId = (videoId: string) => {
    if (videoId === selectedVideoId) {
      setSelectedVideoId(null);
    } else {
      setSelectedVideoId(videoId);
    }
  };

  return (
    <>
      <TabTitle title="Contribute" />
      <Navbar />
      <main className={style.PageContainer}>
        <div className={style.HeaderContainer}>
          <h1 className={style.Header}>Contribute and Grow the Collection</h1>
          <p className={style.Subheader}>
            Help us expand our music library by contributing your favorite
            tracks. Share the songs that move you and be a part of our musical
            journey.
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
                <button
                  type="button"
                  className={clsx(
                    style.ActionButton,
                    selectedVideoId === video.id.videoId &&
                      style.ContributeButton
                  )}
                  onClick={() => {
                    handleSelectVideoId(video.id.videoId);
                  }}
                >
                  <Plus
                    className={clsx(
                      style.Icon,
                      selectedVideoId === video.id.videoId &&
                        style.ContributeActive
                    )}
                  />
                  <p className={style.Label}>
                    {selectedVideoId === video.id.videoId
                      ? "Selected"
                      : "Contribute"}
                  </p>
                </button>
              </div>
            </div>
          ))}
        </div>
        {selectedVideoId && (
          <div className={style.ContributeContainer}>
            <Link
              to={ContributeDetailRoute.fullPath}
              params={{
                videoId: selectedVideoId || "",
              }}
              className={style.ContributeButton}
            >
              <p>Start customize this song</p>
              <ArrowRight className={style.ArrowIcon} />
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
