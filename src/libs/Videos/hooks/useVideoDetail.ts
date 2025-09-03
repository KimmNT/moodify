import { useQuery } from "@tanstack/react-query";
import type { VideosDetailResponse } from "../VideoModel";
// import type { VideosResponse } from "../VideoModel";

export function useVideoDetail(videoId: string) {
  return useQuery({
    queryKey: ["videos_detail", videoId],
    queryFn: async () => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      if (!res.ok) throw new Error("Failed to fetch video detail");
      return res.json() as Promise<VideosDetailResponse>;
    },
    enabled: !!videoId, // only fetch if songName is not empty
    staleTime: 1000 * 60 * 5, // cache 5 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
