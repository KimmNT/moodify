import { Route as IndexRoute } from "./routes/index";
import { Route as ContributeDetailRoute } from "./routes/contribute/$videoId/index";

export type RegisteredRoutes = typeof IndexRoute | typeof ContributeDetailRoute;

export { IndexRoute, ContributeDetailRoute };
