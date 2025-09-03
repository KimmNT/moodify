import { createLazyFileRoute } from "@tanstack/react-router";
import Favorite from "../../views/Favorite/Favorite";

export const Route = createLazyFileRoute("/favorite/")({
  component: Favorite,
});
