import { createLazyFileRoute } from "@tanstack/react-router";
import Explore from "../../views/Explore/Explore";

export const Route = createLazyFileRoute("/explore/")({
  component: Explore,
});
