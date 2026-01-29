export const Router = {
  data() {
    return {
      currentRoute: 'home',
      routes: {
        home: { title: 'Home', icon: '🌸' },
        girl: { title: 'Girl Mode', icon: '💕' },
        about: { title: 'About', icon: 'ℹ️' },
        rankings: { title: 'Rankings', icon: '👻' },
        cats: { title: 'Cats', icon: '🐱' }
      }
    };
  },
  methods: {
    navigate(route) {
      this.currentRoute = route;
      this.$emit('route-change', route);
      window.scrollTo(0, 0);
    }
  },
  template: `
    <div class="router-nav">
      <button
        v-for="(routeData, routeName) in routes"
        :key="routeName"
        :class="{ active: currentRoute === routeName }"
        @click="navigate(routeName)"
        class="router-link"
        :title="routeData.title"
      >
        {{ routeData.icon }} {{ routeData.title }}
      </button>
    </div>
  `,
  emits: ['route-change']
};
