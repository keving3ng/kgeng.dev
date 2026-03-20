import { Navigate, useParams } from 'react-router-dom'
import { getGameBySlug } from '../games/registry'
import { paths } from '../config/paths'

export default function GameRoute() {
  const { gameSlug } = useParams<{ gameSlug: string }>()
  const game = getGameBySlug(gameSlug)

  if (!game) {
    return <Navigate to={paths.games} replace />
  }

  const { Component } = game
  return <Component />
}
