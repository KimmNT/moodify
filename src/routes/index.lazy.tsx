import { createLazyFileRoute } from "@tanstack/react-router";
import Index from "../views/Index/Index";

export const Route = createLazyFileRoute("/")({
  component: Index,
});
