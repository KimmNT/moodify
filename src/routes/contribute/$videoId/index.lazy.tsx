import { createLazyFileRoute } from "@tanstack/react-router";
import ContributeDetail from "../../../views/Contribute/components/ContributeDetail";

export const Route = createLazyFileRoute("/contribute/$videoId/")({
  component: ContributeDetail,
});
