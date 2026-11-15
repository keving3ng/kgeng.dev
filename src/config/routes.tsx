import type { ComponentType } from 'react'
import Home from '../pages/Home'
import Index from '../pages/Index'
import ProjectDetail from '../pages/ProjectDetail'
import PostDetail from '../pages/PostDetail'
import About from '../pages/About'
import Splits from '../pages/Splits'
import Recipeer from '../pages/Recipeer'
import Picks from '../pages/Picks'
import Recipes from '../pages/Recipes'
import RecipeDetail from '../pages/RecipeDetail'
import Trips from '../pages/Trips'
import TripDetail from '../pages/TripDetail'
import CmsLogin from '../pages/CmsLogin'
import CmsPosts from '../pages/CmsPosts'
import AnimationTest from '../pages/AnimationTest'
import NotFound from '../pages/NotFound'
import { paths } from './paths'

export interface AppRoute {
  path: string
  Component: ComponentType
}

/** Register client routes here; `App.tsx` maps over this list. */
export const appRoutes: AppRoute[] = [
  { path: paths.home, Component: Index },
  { path: '/work/:slug', Component: ProjectDetail },
  { path: '/post/:slug', Component: PostDetail },
  { path: paths.cv, Component: Home },
  { path: paths.about, Component: About },
  { path: paths.tools.splits, Component: Splits },
  { path: paths.tools.recipeer, Component: Recipeer },
  { path: paths.picks, Component: Picks },
  { path: paths.recipes, Component: Recipes },
  { path: '/picks/recipes/:id', Component: RecipeDetail },
  { path: paths.trips, Component: Trips },
  { path: '/trips/:slug', Component: TripDetail },
  { path: paths.cms, Component: CmsLogin },
  { path: paths.cmsPosts, Component: CmsPosts },
  { path: paths.test, Component: AnimationTest },
  /** Catch-all; must stay last. */
  { path: '*', Component: NotFound },
]
