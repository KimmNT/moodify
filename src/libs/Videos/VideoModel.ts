import { type } from "arktype";

export const VideoID = type({
  kind: "string",
  videoId: "string",
});

export const VideoThumbnailItem = type({
  url: "string",
  width: "number",
  height: "number",
});

export const VideoThumbnails = type({
  default: VideoThumbnailItem,
  medium: VideoThumbnailItem,
  high: VideoThumbnailItem,
});

export const VideoSnippet = type({
  channelId: "string",
  channelTitle: "string",
  publishTime: "string",
  title: "string",
  description: "string",
  thumbnail: VideoThumbnails,
});

export const VideoItem = type({
  id: VideoID,
  snippet: VideoSnippet,
});

export type VideoItem = typeof VideoItem.infer;

export const VideosResponse = type({
  items: [VideoItem],
});

export type VideosResponse = typeof VideosResponse.infer;

export const FavoriteButtonProps = type({
  videoId: "string",
});
export type FavoriteButtonProps = typeof FavoriteButtonProps.infer;
