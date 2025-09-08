import Navbar from "../../../components/Navbar/Navbar";
import TabTitle from "../../../components/TabTitle/TabTitle";
import style from "../Contribute.module.scss";
import { ContributeDetailRoute } from "../../../routeRegistry";
import { useVideoDetail } from "../../../libs/Videos/hooks/useVideoDetail";
import videoTagsData from "../../../db/videoTags.json";
import videoLangsData from "../../../db/videoLangs.json";
import { useState } from "react";
import clsx from "clsx";
import { doc, setDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../../firebase";
import { Link } from "@tanstack/react-router";

export default function ContributeDetail() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(false);
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

    setIsSubmitting(true);
    setSuccess(null);

    try {
      const snap = await getDoc(contributeRef);

      if (!snap.exists()) {
        await setDoc(contributeRef, {
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
        });
      } else {
        await setDoc(
          contributeRef,
          {
            songs: arrayUnion({
              videoId: videoDetail.items[0].id,
              title: videoDetail.items[0].snippet.title,
              channelTitle: videoDetail.items[0].snippet.channelTitle,
              moods: selectedMoods,
              languages: selectedLanguages,
              timestamp: Date.now(),
            }),
          },
          { merge: true }
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error("❌ Failed to submit song:", err);
      setSuccess(false);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <>
      <TabTitle title="Contribute Detail" />
      <Navbar />
      <main>
        <div className={style.PageContainer}>
          <div className={style.DetailContainer}>
            <div className={style.DetailItemContent}>
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

              {success === true ? (
                <Link to="/contribute" className={style.SubmitButton}>
                  Back to Contribute
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitSongCustomization}
                  className={style.SubmitButton}
                >
                  Submit Contribution
                </button>
              )}
            </div>
          </div>
        </div>
        {isSubmitting ? (
          <div className={style.PageLoading}>
            <p>Submitting your contribution...</p>
          </div>
        ) : (
          <></>
        )}
      </main>
    </>
  );
}
