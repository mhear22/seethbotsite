import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

const handoffToMechApp = (to: RouteLocationNormalized) => {
  if (typeof window !== 'undefined') {
    window.location.assign(to.fullPath)
  }
  return false
}

export const mechRoutes: RouteRecordRaw[] = [
  {
    path: '/mech',
    redirect: '/mech/builder'
  },
  {
    path: '/mech/builder',
    name: 'mech-builder',
    beforeEnter: handoffToMechApp
  },
  {
    path: '/mech/battle',
    name: 'mech-battle',
    beforeEnter: handoffToMechApp
  },
  // Legacy paths kept for backward compatibility.
  {
    path: '/mech-builder',
    redirect: '/mech/builder'
  },
  {
    path: '/mech-battle',
    redirect: '/mech/battle'
  }
]
