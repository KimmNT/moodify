import { createLazyFileRoute } from "@tanstack/react-router";
import Mood from "../../views/Mood/Mood";

export const Route = createLazyFileRoute("/mood/")({
  component: Mood,
});
