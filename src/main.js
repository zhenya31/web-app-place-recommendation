import { createApp } from 'vue'
import App from './App.vue'
import Map from './components/Map.vue'


import { createRouter, createWebHashHistory } from 'vue-router'
import PlaceInfo from "@/components/PlaceInfo";
import Favourites from "@/components/Favourites";
import Bookmarks from "@/components/Bookmarks";
import Profile from "@/components/Profile";



// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
    { path: '/places/:page', component: Map },
    { path: '/places/', component: Map },
    { path: '/favorites/liked/', component: Favourites },
    { path: '/favorites/bookmarks/', component: Bookmarks },
    { path: '/place/:id', component: PlaceInfo, props: true },
    { path: '/profile', component: Profile },
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})


// 5. Create and mount the root instance.
const app = createApp(App)
// Make sure to _use_ the router instance to make the
// whole app router-aware.
app.use(router)
app.use(require('vue-cookies'))


app.mount('#app')



