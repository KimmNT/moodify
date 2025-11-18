import { createLazyFileRoute } from "@tanstack/react-router";
import JamSpaceDetail from "../../../../views/JamSpace/components/JamSpaceDetail/JamSpaceDetail";

export const Route = createLazyFileRoute("/jamjar/jamspace/$jamspace/")({
  component: JamSpaceDetail,
});
