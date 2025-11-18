import { createLazyFileRoute } from "@tanstack/react-router";
import JamSpace from "../../../views/JamSpace/JamSpace";

export const Route = createLazyFileRoute("/jamjar/jamspace/")({
  component: JamSpace,
});
