import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});

const router = VueRouter.createRouter({
    // Adding the base repo path ensures Vue Router matches the hash roots correctly on GitHub Pages
    history: VueRouter.createWebHashHistory('/NchgngDemonList.github.io/'),
    routes,
});

// ^^^^^^^ yo lets delete this are we veen using vue :joy:

app.use(router);
app.mount('#app');
