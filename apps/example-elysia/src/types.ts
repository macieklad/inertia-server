import type { Context } from "elysia";
import type { InertiaHelper } from "inertia-server";

export type InertiaContext = Context & {
  inertia: InertiaHelper;
};
