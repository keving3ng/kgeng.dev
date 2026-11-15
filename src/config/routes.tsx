import type { ComponentType } from 'react'
import Home from '../pages/Home'
import Index from '../pages/Index'
import Work from '../pages/Work'
import About from '../pages/About'
import Splits from '../pages/Splits'
import Recipeer from '../pages/Recipeer'
import Picks from '../pages/Picks'
import Recipes from '../pages/Recipes'
import AnimationTest from '../pages/AnimationTest'
import NotFound from '../pages/NotFound'
import { Navigate } from 'react-router-dom'
import { legacyRedirects, paths } from './paths'

export interface AppRoute {
  path: string
  Component: ComponentType
}

/** Register client routes here; `App.tsx` maps over this list. */
export const appRoutes: AppRoute[] = [
  { path: paths.home, Component: Index },
  { path: paths.work, Component: Work },
  { path: paths.writing, Component: Home },
  { path: '/post/:slug', Component: Home },
  { path: paths.cv, Component: Home },
  { path: paths.about, Component: About },
  { path: paths.tools.splits, Component: Splits },
  { path: paths.tools.recipeer, Component: Recipeer },
  { path: paths.picks, Component: Picks },
  { path: paths.recipes, Component: Recipes },
  { path: paths.test, Component: AnimationTest },
  ...Object.entries(legacyRedirects).map(([from, to]) => ({
    path: from,
    Component: () => <Navigate to={to} replace />,
  })),
  /** Catch-all; must stay last. */
  { path: '*', Component: NotFound },
]
