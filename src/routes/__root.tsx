import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import YouTubePlayer from "../components/YoutubePlayer/YoutubePlayer";

export const Route = createRootRoute({
  component: () => (
    <>
      <YouTubePlayer />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
