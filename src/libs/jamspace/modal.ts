import { type } from "arktype";

export const SectionDetail = type({
  duration: "number",
  selectedValue: "string",
});

export type SectionDetail = typeof SectionDetail.infer;

export const Section = type({
  id: "string",
  name: "string",
  type: "string",
  details: SectionDetail.array(),
});

export type Section = typeof Section.infer;

export const JamProject = type({
  id: "string",
  projectId: "string",
  projectName: "string",
  tempo: "number",
  timestamp: "string",
  sections: Section.array(),
  updateAt: "number",
});

export type JamProject = typeof JamProject.infer;
