import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { type } from "arktype";
import searchParamString from "../../utils/schema/searchParamString";

const DEFAULT_VALUES = {
  videoId: "",
};

const indexSearchSchema = type({
  videoId: searchParamString.default(DEFAULT_VALUES.videoId),
});

export const Route = createFileRoute("/contribute/")({
  validateSearch: indexSearchSchema,
  search: {
    middlewares: [stripSearchParams(DEFAULT_VALUES)],
  },
});
