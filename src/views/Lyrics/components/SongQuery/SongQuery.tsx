import { useEffect, useRef, useState } from "react";
import style from "./SongQuery.module.scss";
import { useVideoListing } from "../../../../libs/Videos/hooks/useVideoListing";
import { Book, Search, XIcon } from "lucide-react";

export default function SongQuery() {
  const [inputValue, setInputValue] = useState("");
  const [songName, setSongName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: videosData, isLoading: isLoadingVideo } =
    useVideoListing(songName);

  const onSearch = () => {
    setSongName(inputValue);
  };
  return (
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
                type="button"
                className={style.ActionButton}
                onClick={() => console.log(video)}
              >
                <Book className={style.Icon} />
                <p className={style.Label}>Lyrics</p>
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
