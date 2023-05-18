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
          <span class="material-icons"  style="color: #F4743B">favorite</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'FavouritesComponent',

  data() {
    return {
      places: {},
    }
  },

  created() {
    this.places = this.$cookies.get('favourites')
  },
  methods: {
    removeFromFavourites: function (id){
      delete this.places[id];
      this.$cookies.set('favourites', this.places);
    }
  }
}
</script>

<style lang="scss">

h1 {
  font-weight: 600;
  font-size: 24px;
  line-height: 28px;
  color: #2F1B25;
  text-align: center;


  max-width: 580px;
  width: 100%;
  margin: 36px auto 15px;

  @media (max-width: 580px) {
    width: auto;
    margin: 20px 15px 15px;
    text-align: left;

  }
}

.favourites-tabs {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 2px;
  box-sizing: border-box;


  max-width: 580px;
  width: 100%;
  margin: 32px auto;
  height: 46px;

  @media (max-width: 580px) {
    width: auto;
    margin: 15px 12px;
  }

  background: #FEF1EC;
  border-radius: 80px;
  .favourites-tab {
    width: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 6px 12px;
    gap: 10px;

    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;

    text-align: center;
    box-sizing: border-box;
    height: 42px;
    /* Dark Purple/100 */

    color: #2F1B25;

    &.router-link-active {
      background: #FFFFFF;


      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 80px;
    }
  }
}

.favourites-list {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  .place-card {
    justify-content: space-between;
  }
}

.place-card-link {
  display: flex;
  cursor: pointer;
  text-decoration: none;
}

</style>
