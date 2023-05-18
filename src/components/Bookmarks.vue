<template>
  <h1>Избранное</h1>
  <div class="favourites-tabs">
    <router-link  :to="'/favorites/liked/'" class="favourites-tab">
      Любимые места
    </router-link>
    <router-link  :to="'/favorites/bookmarks/'" class="favourites-tab">
      Хочу сходить
    </router-link>
  </div>
  <div class="favourites-list">
    <div v-for="place in places" :key="place.id" class="place-card">
      <router-link  :to="'/place/'+place.id" class="place-card-link">
        <div class="place-card-img" :style="'background-image: url(\'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg\')'"></div>
        <div class="place-card-info">
          <div class="name">{{ place.name }}</div>
          <div class="categories">{{ place.categories }}</div>
          <div class="address">{{ place.address }}</div>
        </div>
      </router-link>
      <div>
        <a class="action-btn active" @click="removeFromFavourites(place.id)">
          <span class="material-icons"  style="color: #9FD356">bookmark</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'BookmarksComponent',

  data() {
    return {
      places: {},
    }
  },

  created() {
    this.places = this.$cookies.get('bookmarks')
  },
  methods: {
    removeFromFavourites: function (id){
      delete this.places[id];
      this.$cookies.set('bookmarks', this.places);
    }
  }
}
</script>

<style lang="scss">
</style>
