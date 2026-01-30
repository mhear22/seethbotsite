import { defineComponent } from 'vue'

interface RouteData {
  title: string
  icon: string
}

interface Routes {
  [key: string]: RouteData
}

export const Router = defineComponent({
  props: {
    currentRoute: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
      routes: {
        home: { title: 'Home', icon: '🌸' },
        girl: { title: 'Girl Mode', icon: '💕' },
        gender: { title: 'Gender', icon: '🔮' },
        about: { title: 'About', icon: 'ℹ️' },
        rankings: { title: 'Rankings', icon: '👻' },
        cats: { title: 'Cats', icon: '🐱' }
      } as Routes
    };
  },
  methods: {
    navigate(route: string) {
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
});
