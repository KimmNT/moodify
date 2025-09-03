import { createLazyFileRoute } from "@tanstack/react-router";
import Contribute from "../../views/Contribute/Contribute";

export const Route = createLazyFileRoute("/contribute/")({
  component: Contribute,
});
