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

export const VideoContentDetails = type({
  duration: "string",
  dimension: "string",
  definition: "string",
  caption: "string",
  licensedContent: "boolean",
});

export type VideoContentDetails = typeof VideoContentDetails.infer;

export const VideoDetailItem = type({
  id: "string",
  contentDetails: VideoContentDetails,
  snippet: VideoSnippet,
});

export type VideoDetailItem = typeof VideoDetailItem.infer;

export const VideosDetailResponse = type({
  items: [VideoDetailItem],
});

export type VideosDetailResponse = typeof VideosDetailResponse.infer;
