import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { type } from "arktype";
import searchParamString from "../../../utils/schema/searchParamString";

const DEFAULT_VALUES = {
  jamSpaceId: "",
};

const indexSearchSchema = type({
  jamSpaceId: searchParamString.default(DEFAULT_VALUES.jamSpaceId),
});

export const Route = createFileRoute("/jamjar/jamspace/")({
  validateSearch: indexSearchSchema,
  search: {
    middlewares: [stripSearchParams(DEFAULT_VALUES)],
  },
});
