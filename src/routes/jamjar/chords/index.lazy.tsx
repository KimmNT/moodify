import { createLazyFileRoute } from "@tanstack/react-router";
import Chords from "../../../views/Jamjar/components/Chords/Chords";

export const Route = createLazyFileRoute("/jamjar/chords/")({
  component: Chords,
});
