import { createLazyFileRoute } from "@tanstack/react-router";
import Lyrics from "../../views/Lyrics/Lyrics";

export const Route = createLazyFileRoute("/lyrics/")({
  component: Lyrics,
});
