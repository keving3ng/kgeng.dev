import type { ComponentType } from 'react'
import Home from '../pages/Home'
import Blog from '../pages/Blog'
import About from '../pages/About'
import Splits from '../pages/Splits'
import Recipeer from '../pages/Recipeer'
import Picks from '../pages/Picks'
import Projects from '../pages/Projects'
import Recipes from '../pages/Recipes'
import Boba from '../pages/Boba'
import Games from '../pages/Games'
import GameRoute from '../pages/GameRoute'
import { paths } from './paths'

export interface AppRoute {
  path: string
  Component: ComponentType
}

/** Register client routes here; `App.tsx` maps over this list. */
export const appRoutes: AppRoute[] = [
  { path: paths.home, Component: Home },
  { path: '/post/:slug', Component: Home },
  { path: paths.cv, Component: Home },
  { path: paths.blog, Component: Blog },
  { path: paths.about, Component: About },
  { path: paths.tools.splits, Component: Splits },
  { path: paths.tools.recipeer, Component: Recipeer },
  { path: paths.tools.boba, Component: Boba },
  { path: paths.picks, Component: Picks },
  { path: paths.projects, Component: Projects },
  { path: paths.recipes, Component: Recipes },
  { path: paths.games, Component: Games },
  { path: '/games/:gameSlug', Component: GameRoute },
]
