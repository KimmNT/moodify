import Navbar from "../../../components/Navbar/Navbar";
import TabTitle from "../../../components/TabTitle/TabTitle";
import style from "../Contribute.module.scss";
import { ContributeDetailRoute } from "../../../routeRegistry";
import { useVideoDetail } from "../../../libs/Videos/hooks/useVideoDetail";
import videoTagsData from "../../../db/videoTags.json";
import videoLangsData from "../../../db/videoLangs.json";
import { useState } from "react";
import clsx from "clsx";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase";

export default function ContributeDetail() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const contributeRef = doc(db, "contribute", "songs");

  const { videoId } = ContributeDetailRoute.useParams();

  const { data: videoDetail } = useVideoDetail(videoId);

  const parseISODuration = (iso: string): string => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hours = parseInt(match?.[1] ?? "0", 10);
    const minutes = parseInt(match?.[2] ?? "0", 10);
    const seconds = parseInt(match?.[3] ?? "0", 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleLanguage = (id: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((lang) => lang !== id) : [...prev, id]
    );
  };

  const isMoodSelected = (id: string) => selectedMoods.includes(id);
  const isLangSelected = (id: string) => selectedLanguages.includes(id);

  const handleSubmitSongCustomization = async () => {
    if (!videoDetail) return;
    await setDoc(
      contributeRef,
      {
        songs: [
          {
            videoId: videoDetail.items[0].id,
            title: videoDetail.items[0].snippet.title,
            channelTitle: videoDetail.items[0].snippet.channelTitle,
            moods: selectedMoods,
            languages: selectedLanguages,
            timestamp: Date.now(),
          },
        ],
      },
      { merge: true }
    );

    // Verify the data was added
    const snap = await getDoc(contributeRef);
    if (snap.exists()) {
      console.log("✅ Song contributed:", snap.data());
    } else {
      console.log("❌ Contribute document not found");
    }
  };

  return (
    <>
      <TabTitle title="Contribute Detail" />
      <Navbar />
      <main className={style.PageContainer}>
        <div className={style.DetailContainer}>
          <div className={style.DetailItemContent}>
            <p className={style.Header}>Video detail</p>
            {videoDetail && (
              <div className={style.ItemDetail}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoDetail.items[0].id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className={style.Info}>
                  <p className={style.Title}>
                    {videoDetail.items[0].snippet.title}
                  </p>
                  <div className={style.Meta}>
                    <p className={style.MetaItem}>
                      Artist: {videoDetail.items[0].snippet.channelTitle}
                    </p>
                    <p className={style.MetaItem}>
                      Duration:{" "}
                      {parseISODuration(
                        videoDetail.items[0].contentDetails.duration
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={style.DetailItemContent}>
            <p className={style.Header}>Video tags</p>
            <div className={style.ItemList}>
              {videoTagsData.map((tag) => {
                return (
                  <div
                    key={tag.id}
                    className={clsx(
                      style.Item,
                      isMoodSelected(tag.id) && style.ItemActive
                    )}
                    onClick={() => toggleMood(tag.id)}
                  >
                    {tag.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={style.DetailItemContent}>
            <p className={style.Header}>Video language</p>

            <div className={style.ItemList}>
              {videoLangsData.map((lang) => {
                return (
                  <div
                    key={lang.id}
                    className={clsx(
                      style.Item,
                      isLangSelected(lang.id) && style.ItemActive
                    )}
                    onClick={() => toggleLanguage(lang.id)}
                  >
                    {lang.label}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitSongCustomization}
            className={style.SubmitButton}
          >
            Submit
          </button>
        </div>
      </main>
    </>
  );
}
