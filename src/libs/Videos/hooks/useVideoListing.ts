import { useQuery } from "@tanstack/react-query";
import type { VideosResponse } from "../VideoModel";

export function useVideoListing(songName: string) {
  return useQuery({
    queryKey: ["videos", songName],
    queryFn: async () => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${songName}&type=video&maxResults=7&key=${
          import.meta.env.VITE_YOUTUBE_API_KEY
        }`
      );
      if (!res.ok) throw new Error("Failed to fetch videos");
      return res.json() as Promise<VideosResponse>;
    },
    enabled: !!songName, // only fetch if songName is not empty
    staleTime: 1000 * 60 * 5, // cache 5 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
