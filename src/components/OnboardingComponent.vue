<template>
  <vue-final-modal v-model="showOnboarding" :click-to-close="false">
    <div class="onboarding-modal" v-if="showOnboarding">
      <div v-if="stage===0" class="onboarding-content">
        <img src="../assets/onboarding-cover.png" class="onboarding-cover">

        <div class="onboarding-h1" style="margin-top: 40px;">Добро пожаловать!</div>
        <div style="font-weight: 500; font-size: 16px; line-height: 24px; color: #2F1B25; max-width: 336px; margin-top: 10px;">Приготовим для вас индивидуальные рекомендации кафе и ресторанов</div>
        <div class="onboarding-btn" @click="stage=1" style="margin: 44px 0 16px;">Далее</div>
      </div>


      <div v-if="stage===1" class="onboarding-content" style="justify-content: flex-start;">

        <template v-if="!showSearch && !showFavourites" >
          <div  style="max-width: 310px; margin-bottom: 40px">
            <div style="width: 60px;height: 60px;background: #FFE6DB;border-radius: 12px; text-align: center; display: flex; align-items: center; justify-content: center; margin: 10px auto 30px">
              <span class="material-icons" style="color: #F4743B;">favorite</span>
            </div>
            <div style="font-weight: 500; font-size: 15px; line-height: 16px;color: #7B596A;">
              Наши алгоритмы рекомендаций опираются на список ваших любимых кафе и ресторанов
              <br><br>
              Это позволяет им понять ваши индивидуальные вкусы
            </div>
          </div>

          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #fff; padding: 18px 20px 24px;">
            <div class="onboarding-btn gray-btn" @click="skipOnboarding">Пропустить</div>
          </div>
        </template>


        <div class="color-box search-line-box" :class="{ 'active': showSearch }">
          <div v-if="!showSearch" style=" font-weight: 500;font-size: 16px;line-height: 20px;color: #2F1B25;margin-bottom: 26px;">
            Укажите несколько мест, которые вам нравятся, а наши алгоритмы подберут похожие на них
          </div>

          <SearchInput @focus="showSearch = true"
                       v-model="searchQuery"
                       @keyup.enter="updateSearch"
                       :placeholder="'Введите название ресторана'"
                       :clearOnEsc="false" :shortcutIcon="false" :clearIcon="true">
          </SearchInput>
          <a class="cancel-search-btn" v-if="showSearch" @click="showSearch = false; searchQuery = ''; searchResults = {}" >
            Отмена
          </a>

        </div>


        <div v-if="showSearch" class="search-results" style="padding: 0 8px;">
          <div v-for="place in searchResults" :key="place.id" class="place-card">
            <div class="place-card-link" style="cursor: auto;">
              <div class="place-card-img" :style="'background-image: url(\'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg\')'"></div>
              <div class="place-card-info">
                <div class="name">{{ place.name }}</div>
                <div class="categories">{{ place.categories }}</div>
                <div class="address">{{ place.address }}</div>
              </div>
            </div>
            <div>
              <a v-if="placeInFavourites(place.id)" class="action-btn active" @click="removeFromFavourites(place)">
                <span class="material-icons"  style="color: #F4743B">favorite</span>
              </a>
              <a v-else class="action-btn" @click="addToFavourites(place)">
                <span class="material-icons"  style="color: #978D92">favorite_border</span>
              </a>
            </div>
          </div>
        </div>

        <template v-if="!showSearch && showFavourites">
          <div class="onboarding-tip" style="margin: 28px 36px 20px;">
            Списком любимых мест можно будет управлять в любое время в разделе «Избранное»
          </div>
          <div class="search-results" style="padding: 0 8px;">
            <div v-for="place in favourites" :key="place.id" class="place-card">
              <div class="place-card-link" style="cursor: auto;">
                <div class="place-card-img" :style="'background-image: url(\'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg\')'"></div>
                <div class="place-card-info">
                  <div class="name">{{ place.name }}</div>
                  <div class="categories">{{ place.categories }}</div>
                  <div class="address">{{ place.address }}</div>
                </div>
              </div>
              <div>
                <a v-if="placeInFavourites(place.id)" class="action-btn active" @click="removeFromFavourites(place)">
                  <span class="material-icons"  style="color: #F4743B">favorite</span>
                </a>
                <a v-else class="action-btn" @click="addToFavourites(place)">
                  <span class="material-icons"  style="color: #978D92">favorite_border</span>
                </a>
              </div>
            </div>
          </div>

          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #fff; padding: 18px 20px 24px; border-top: 1px solid #EAE8E9;">
            <div class="onboarding-btn" @click="getRecommendations" style="width: 100%; box-sizing: border-box; max-width: 400px">Подобрать рекомендациии</div>
          </div>
        </template>

      </div>

      <div v-if="stage===2" class="onboarding-content">
        <div class="onboarding-h1" style="margin-top: 20px;">Готово!</div>
        <div style="font-weight: 500; font-size: 16px; line-height: 24px; color: #2F1B25; max-width: 336px; margin: 10px 0;">
          На основе списка ваших любимых мест рекомендуем {{ numberOfRecommended }} кафе и ресторанов
        </div>

        <img src="../assets/onboarding-cover.png" class="onboarding-cover">

        <div class="onboarding-btn" @click="$router.go()" style="margin: 16px 0 30px;">Начать пользоваться</div>

        <div class="onboarding-tip" style="margin: 0 36px 16px;">
          Вы можете в любой момент редактировать список любимых мест, а рекомендации будут переподбираться автоматически        </div>
      </div>
    </div>
  </vue-final-modal>
</template>

<script>
import {VueFinalModal} from "vue-final-modal";
import {loadYmap, YandexCollection, YandexMap, YandexMarker, YandexObjectManager} from "vue-yandex-maps";
import PlaceBalloon from "@/components/PlaceBalloon";
import SearchInput from "vue-search-input";
import axios from "axios";
import _ from "lodash";


export default {
  name: "OnboardingComponent",

  components: {
    VueFinalModal,
    SearchInput
  },
  data() {
    return {
        showOnboarding: false,
        stage: 1,
        searchQuery: '',
        showSearch: false,
        searchResults: [],
        favourites: {},
        numberOfRecommended: -1,
    }
  },
  computed: {
    showFavourites: function () {
      console.log(this.favourites);
      let currentFavourites = this.favourites;
      return !(currentFavourites === undefined || currentFavourites === null || _.isEmpty(currentFavourites))
    }
  },
  created() {
    let token = this.userToken();

    if (token === -1) {

      let stage = this.$cookies.get('onboardingStage');
      if (!stage) {
        this.showOnboarding = true;
        this.stage = 0;
      }
      if (stage === 0 || stage === 1) {
        this.showOnboarding = true;
        this.stage = stage;
      }
    }
    else {
      this.showOnboarding = false;
    }

    let currentFavourites = this.$cookies.get('favourites');
    if (currentFavourites === undefined || currentFavourites === null || _.isEmpty(currentFavourites))
      currentFavourites = {}
    this.favourites = currentFavourites;

  },
  methods: {
    updateSearch: function () {
      if (this.searchQuery === '') {
        this.showSearch = false;
        this.searchResults = {}
      }
      axios.get('http://elesinsv.fvds.ru:8080/cafes/search/'+this.searchQuery).then((response) => {
        if (response.status === 200) {
          this.searchResults = (response.data).slice(0, 100);
        }
      });
    },

    placeInFavourites: function (placeId) {
      if (this.favourites === undefined || this.favourites === null || _.isEmpty(this.favourites))
        return false;
      return Object.keys(this.favourites).indexOf(placeId.toString()) >= 0;
    },

    addToFavourites: function (place) {
      let currentFavourites = this.$cookies.get('favourites');
      if (currentFavourites === undefined || currentFavourites === null || _.isEmpty(currentFavourites))
        currentFavourites = {}
      currentFavourites[place.id] = place;

      this.$cookies.set('favourites', currentFavourites);

      this.favourites = currentFavourites;

      this.searchQuery = '';
      this.showSearch = false;
      this.searchResults = {}
    },
    removeFromFavourites: function (place) {
      let currentFavourites = this.$cookies.get('favourites')
      delete currentFavourites[place.id];
      this.$cookies.set('favourites', currentFavourites)

      this.favourites = currentFavourites;
    },

    getRecommendations: function () {
      let favourites = this.$cookies.get('favourites');
      let favourites_ids = Object.keys(favourites).map(function (id) {
        return parseInt(id);
      });

      axios.post('http://elesinsv.fvds.ru:8080/recommended-cafes-for', favourites_ids).then((response) => {
        if (response.status === 200) {
          let recommendedPlaces = response.data;
          this.numberOfRecommended = recommendedPlaces.length;
          this.$cookies.set('onboardingStage', 2)
          this.stage = 2;
        }
      });
    },
    skipOnboarding: function () {
      this.$cookies.set('onboardingStage', 3)
      this.stage = 2;
      this.showOnboarding = false;
    },

    userToken: function() {
      let token = this.$cookies.get('usertoken');
      if (token !== undefined && token !== null && token !== -1 && token !== '') {
        return token;
      }
      return -1;
    },

  }
}
</script>

<style lang="scss">


.onboarding-modal {
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 60px;
}

.onboarding-content {
  width: 100%;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;

  text-align: center;

  position: relative;

  .onboarding-h1 {
    font-weight: 600; font-size: 22px; line-height: 24px; text-align: center; color: #2F1B25;
  }

  .onboarding-cover { max-height: 372px; flex-shrink: 2}


  .onboarding-btn {
    text-align: center;
    padding: 10px 40px;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: inline-block;

    color: #FFFFFF;


    background: #F4743B;
    border-radius: 80px;
    cursor: pointer;
    &.gray-btn {
      background: #EAE8E9;
      color: #2F1B25;
    }

    &:hover {
      opacity: .9;
    }
  }

}

.search-line-box {
  box-sizing: border-box;

  &:not(.active) {
    //max-width: 360px;
    padding: 32px 22px;
  }

  &.active {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;

    background: none;
    padding: 20px 20px;
    .search-input-wrapper {
      flex: 1;
      input {
        border: none;
        box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    .cancel-search-btn{
      font-weight: 400;
      font-size: 15px;
      line-height: 20px;
      color: #F4743B;
      cursor: pointer;

      margin-left: 15px;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.onboarding-content {
  .search-results {
    overflow-y: scroll;
    box-sizing: border-box;

    .place-card {
      justify-content: space-between;
    }
  }
}

.color-box {
  background: #F3EFF9;
  border-radius: 12px;
  margin: 0 15px;
}

.onboarding-tip {
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  text-align: center;
  color: #978D92;
}


</style>