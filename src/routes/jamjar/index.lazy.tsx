import { createLazyFileRoute } from "@tanstack/react-router";
import Jamjar from "../../views/Jamjar/Jamjar";

export const Route = createLazyFileRoute("/jamjar/")({
  component: Jamjar,
});
