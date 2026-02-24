import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

const handoffToTicketsApp = (to: RouteLocationNormalized) => {
  if (typeof window !== 'undefined') {
    const ticketFullPath =
      to.fullPath === '/tickets'
        ? '/tickets/'
        : to.fullPath.startsWith('/tickets?')
          ? to.fullPath.replace('/tickets?', '/tickets/?')
          : to.fullPath

    window.location.assign(ticketFullPath)
  }
  return false
}

export const ticketsRoutes: RouteRecordRaw[] = [
  import.meta.env.DEV
    ? {
        path: '/tickets',
        name: 'tickets',
        component: () => import('../../components/pages/TicketsPage.vue')
      }
    : {
        path: '/tickets',
        name: 'tickets',
        beforeEnter: handoffToTicketsApp
      }
]
