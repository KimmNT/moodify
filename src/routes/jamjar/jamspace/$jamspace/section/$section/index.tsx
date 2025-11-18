import { createFileRoute } from "@tanstack/react-router";
import Section from "../../../../../../views/JamSpace/components/JamSpaceDetail/components/Section/Section";

export const Route = createFileRoute(
  "/jamjar/jamspace/$jamspace/section/$section/"
)({
  component: Section,
});
