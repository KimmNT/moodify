import { createLazyFileRoute } from "@tanstack/react-router";
import Notes from "../../../views/Jamjar/components/Notes/Notes";

export const Route = createLazyFileRoute("/jamjar/notes/")({
  component: Notes,
});
