import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

const handoffToDataCenterApp = (to: RouteLocationNormalized) => {
  if (typeof window !== 'undefined') {
    const dataCenterPath =
      to.fullPath === '/datacenter'
        ? '/datacenter/'
        : to.fullPath.startsWith('/datacenter?')
          ? to.fullPath.replace('/datacenter?', '/datacenter/?')
          : to.fullPath

    window.location.assign(dataCenterPath)
  }

  return false
}

export const dataCenterRoutes: RouteRecordRaw[] = [
  {
    path: '/datacenter',
    name: 'datacenter',
    beforeEnter: handoffToDataCenterApp
  },
  {
    path: '/datacenter/:pathMatch(.*)*',
    name: 'datacenter-nested',
    beforeEnter: handoffToDataCenterApp
  }
]
