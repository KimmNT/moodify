import { Route as IndexRoute } from "./routes/index";
import { Route as ContributeDetailRoute } from "./routes/contribute/$videoId/index";
import { Route as JamSpaceDetialRoute } from "./routes/jamjar/jamspace/$jamspace/index";
import { Route as SectionRoute } from "./routes/jamjar/jamspace/$jamspace/section/$section/index";

export type RegisteredRoutes =
  | typeof IndexRoute
  | typeof ContributeDetailRoute
  | typeof JamSpaceDetialRoute
  | typeof SectionRoute;

export { IndexRoute, ContributeDetailRoute, JamSpaceDetialRoute, SectionRoute };
