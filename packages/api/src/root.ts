import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { linkedinRouter } from "./router/linkedin";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  linkedin: linkedinRouter,
  auth: authRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
