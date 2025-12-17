import { onRequestGet as __api_posts__slug__ts_onRequestGet } from "/Users/kevingeng/code/kgeng.dev/functions/api/posts/[slug].ts"
import { onRequestGet as __api_posts_ts_onRequestGet } from "/Users/kevingeng/code/kgeng.dev/functions/api/posts.ts"

export const routes = [
    {
      routePath: "/api/posts/:slug",
      mountPath: "/api/posts",
      method: "GET",
      middlewares: [],
      modules: [__api_posts__slug__ts_onRequestGet],
    },
  {
      routePath: "/api/posts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_posts_ts_onRequestGet],
    },
  ]