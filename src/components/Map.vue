<template>
  <div class="map-bar">
    <div class="map-bar-content">
      <a v-if="currentPage==='map'" class="btn recommendations-btn" :class="{active : selectedFilters.recommended }" @click="selectedFilters.recommended = !selectedFilters.recommended; tempSelectedFilters.recommended = !tempSelectedFilters.recommended">
        Рекомендации
        <div class="btn-counter">{{ recommendedPlaces.length }}</div>
      </a>
      <a v-if="currentPage==='map'" class="btn" @click="showFilters = true">
        <img src="../assets/icon-filters-20.svg">
        Фильтры
        <div class="btn-counter" v-if="filtersCount > 0">{{ filtersCount }}</div>
      </a>
      <SearchInput @focus="currentPage = 'search'"
                   v-model="searchQuery"
                   @keyup.enter="updateSearch"
                   :placeholder="'Поиск по названию'"
                   :clearOnEsc="false" :shortcutIcon="false" :clearIcon="true">
      </SearchInput>
      <a v-if="currentPage==='search'" class="btn" @click="currentPage = 'map'; searchQuery = ''; searchResults = {}" style="gap: 8px">
        Отмена
      </a>
    </div>
  </div>
  <vue-final-modal v-model="showFilters">
    <div class="filters-modal">
      <div class="filters-modal-header">
        <div><img src="../assets/icon-filters-20.svg"></div>
        <div style="flex: 1">Фильтры</div>
        <a @click="closeFilters"  style="color: #D5D1D3; cursor:pointer;"><span class="material-icons">cancel</span></a>
      </div>
      <div class="filters-main">
        <div class="filter-group" v-for="group in filtersList" :key="group.id">
          <div class="filter-h">{{ group.name }}</div>
          <div class="filter-variants">
            <div class="filter-variant" v-for="(variant, i) in group.variants" :key="i">
              <input type="checkbox" :id="group.id+'-'+variant" :value="variant" v-model="tempSelectedFilters.other[group.name]"/>
              <label :for="group.id+'-'+variant">{{ group.name ==='Ценовая категория' ? '₽'.repeat(Number(variant))  : variant }}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="filters-footer">
        <a class="btn flat-btn" @click="clearFilters">Сбросить</a>
        <a class="btn flat-btn active" @click="applyFilters">Применить</a>
      </div>
    </div>
  </vue-final-modal>

  <div style="display: flex; flex-direction: column; padding-top: 120px; height: 100%; width: 100%; box-sizing: border-box">

    <YandexMap
        :coordinates="coordinates"
        :detailed-controls="detailedControls"
        :controls="controls"
        :settings="settings"
        :zoom="13"
        @created="mapInit"
        :style="currentPage==='map' ? '' : 'display: none'"
    >
    </YandexMap>

    <div class="search-results map-search" v-if="currentPage==='search'">
      <router-link  :to="'/place/'+place.id" class="place-card" v-for="place in searchResults" :key="place.id">
        <div class="place-card-img" :style="'background-image: url(\'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg\')'"></div>
        <div class="place-card-info">
          <div class="name">{{ place.name }}</div>
          <div class="categories">{{ place.categories }}</div>
          <div class="address">{{ place.address }}</div>
        </div>
      </router-link>
    </div>
  </div>


  <div v-if="currentPage==='map'" class="map-bar-mobile">
      <a  class="btn recommendations-btn" :class="{active : selectedFilters.recommended }" @click="selectedFilters.recommended = !selectedFilters.recommended; tempSelectedFilters.recommended = !tempSelectedFilters.recommended">
        Рекомендации
        <div class="btn-counter">{{ recommendedPlaces.length }}</div>
      </a>
      <a class="btn" @click="showFilters = true">
        <img src="../assets/icon-filters-20.svg">
        Фильтры
        <div class="btn-counter" v-if="filtersCount > 0">{{ filtersCount }}</div>
      </a>
  </div>
  <div class="mobile-search-line">
    <SearchInput @focus="currentPage = 'search'"
                 v-model="searchQuery"
                 @keyup.enter="updateSearch"
                 :placeholder="'Поиск по названию'"
                 :clearOnEsc="false" :shortcutIcon="false" :clearIcon="true">
    </SearchInput>
    <a v-if="currentPage==='search'" class="cancel-search-btn" @click="currentPage = 'map'; searchQuery = ''; searchResults = {}" style="gap: 8px">
      Отмена
    </a>
  </div>

  <OnboardingComponent></OnboardingComponent>

</template>

<script>
import { ref } from 'vue';
import OnboardingComponent from './OnboardingComponent.vue'


import { loadYmap, YandexMap, YandexMarker, YandexCollection, YandexObjectManager } from 'vue-yandex-maps';
import axios from 'axios'

import SearchInput from 'vue-search-input'
import '../assets/style/search-input-styles.css'

import {VueFinalModal} from "vue-final-modal";

import _ from 'lodash'



let $objectManager, $myMap, $ymaps;




// let myMap;

export default {
  name: 'MapComponent',
  components: {
    YandexMap,
    YandexMarker,
    // eslint-disable-next-line vue/no-unused-components
    YandexCollection,
    // eslint-disable-next-line vue/no-unused-components
    loadYmap,
    VueFinalModal,
    // eslint-disable-next-line vue/no-unused-components
    YandexObjectManager,
    SearchInput,
    OnboardingComponent
  },
  data() {
    return {
      settings: {
        apiKey: 'f8bbc959-1a6a-48c1-a92c-3316ea6e81f3', // Индивидуальный ключ API
        lang: 'ru_RU', // Используемый язык
        coordorder: 'latlong', // Порядок задания географических координат
        debug: false, // Режим отладки
        version: '2.1', // Версия Я.Карт,
      },

      controls: [],
      detailedControls: {zoomControl: {position: {right: 12, top: 140}}, geolocationControl: {position: {right: 12, top: 100}}},
      coordinates: ref([55.753, 37.614]),
      allPlaces: [],
      recommendedPlaces: [],
      shownPlaces: [],

      filteredIds: [],
      BalloonContentLayout: {},

      selectedFilters: {
        recommended: true,
        other: {},
      },
      tempSelectedFilters: {
        recommended: true,
        other: {},
      },
      filtersList: {},

      currentPage: 'map',
      searchQuery: '',
      searchResults: {},

      showFilters: false,
    }
  },
  computed: {
    filtersCount: function (){
      return Object.keys(this.selectedFilters.other).filter(key => this.selectedFilters.other[key].length > 0).length;
    }
  },

  created() {
  },
  mounted() {
  },

  watch: {
    selectedFilters: {
      async handler() {

        let places;
        if (this.selectedFilters.recommended) {
          places = this.recommendedPlaces;
        } else
          places = this.allPlaces;

        let max_n = 800
        if (places.length > max_n)
          places = places.slice(0, max_n);

        places = await this.filter(places);
        $objectManager.removeAll();
        $objectManager.add(this.placesToJsonGeoObjects(places, !this.selectedFilters.recommended));

        this.shownPlaces = places;
      },
      deep: true
    }
  },
  methods: {
    mapInit: async function (map) {
      await loadYmap(this.settings);
      // eslint-disable-next-line no-undef
      $ymaps = ymaps;
      // myMap = e;
      // Делаем так, чтобы балун закрывался по клику по любому месту на карте (кроме геообъекта)
      map.events.add('click', function (e) {
        if (e.get('target') === map) { // Если клик был на карте, а не на геообъекте
          map.balloon.close();
        }
      });


      let objectManager = new $ymaps.ObjectManager({
        clusterize: true,
        maxZoom: 12,
        gridSize: 256,
      });

      let MyIconContentLayout = $ymaps.templateLayoutFactory.createClass(
          '<div class="place-caption"><div class="inner">$[properties.iconContent]</div></div>'
      );

      let MyBalloonLayout = this.createBalloonLayout();
      let MyBalloonContentLayout = $ymaps.templateLayoutFactory.createClass(
          '<div class="balloon-content">' +
          '<div class="balloon-img" style="background-image: url({{ properties.balloonPlacePhoto}})"></div>' +
          '<div class="balloon-info">' +
          '<div class="name">{{ properties.balloonPlaceName }}</div>' +
          '<div class="categories">{{ properties.balloonPlaceCategories }}</div>' +
          '<div class="address">{{ properties.balloonPlaceAddress }}</div>' +
          '</div>' +
          '</div>'
      );


      objectManager.objects.options.set({
        iconLayout: 'default#imageWithContent',
        iconImageHref: 'map-pin.svg',
        iconImageSize: [16, 16],
        iconImageOffset: [-8, -8],
        iconContentOffset: [14, -4],
        iconContentLayout: MyIconContentLayout,

        geoObjectOpenBalloonOnClick: true,
        balloonShadow: false,
        balloonLayout: MyBalloonLayout,
        balloonContentLayout: MyBalloonContentLayout,
        balloonPanelMaxMapArea: 0,

        // Не скрываем иконку при открытом балуне.
        hideIconOnBalloonOpen: false,
        balloonOffset: [3, -40]
      })

      objectManager.clusters.options.set('preset', 'islands#orangeClusterIcons');

      map.geoObjects.add(objectManager);
      $objectManager = objectManager;

      $objectManager.removeAll();
      this.loadPlacesData();
      $objectManager.add(this.placesToJsonGeoObjects(this.shownPlaces));
    },

    filter: async function (places) {
      let filtersData = []
      for (let key in this.selectedFilters.other) {
        if (this.selectedFilters.other[key].length > 0)
          filtersData.push({
            name: key,
            variants: this.selectedFilters.other[key]
          })
      }
      let filteredPlaces;
      if (filtersData.length === 0)
        return places

      await axios.post('http://elesinsv.fvds.ru:8080/filtered-cafes', filtersData).then((response) => {
        if (response.status === 200) {
          let filteredIds = response.data;
          filteredPlaces = places.filter((place) => {
            return filteredIds.indexOf(place.id) >= 0
          })
        }
      });
      return filteredPlaces;
    },

    createBalloonLayout: function () {
      let MyBalloonLayout = $ymaps.templateLayoutFactory.createClass(
          '<div class="place-balloon">' +
          '<div class="inner">' +
          '$[[options.contentLayout observeSize minWidth=100 maxWidth=400 minHeight=52 maxHeight=52]]' +
          '</div>' +
          '</div>', {
            build: function (e) {
              // Сначала вызываем метод build родительского класса.
              MyBalloonLayout.superclass.build.call(this);

              let balloonData = this.getData()
              let balloonLink = balloonData.properties._data.balloonLink

              // А затем выполняем дополнительные действия.
              let el = document.getElementsByClassName('place-balloon')[0];
              el.balloonLink = balloonLink;
              el.addEventListener("click", this.onBalloonClick);
            },
            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
              // Выполняем действия в обратном порядке - сначала снимаем слушателя,
              // а потом вызываем метод clear родительского класса.
              let el = document.getElementsByClassName('place-balloon')[0];
              el.removeEventListener("click", this.onBalloonClick);

              MyBalloonLayout.superclass.clear.call(this);
            },

            onBalloonClick: (e) => {
              this.$router.push(e.currentTarget.balloonLink)
              }
            }
      );
        return MyBalloonLayout;
    },
    loadPlacesData: function () {
      axios.get('http://elesinsv.fvds.ru:8080/cafes').then((response) => {
        if (response.status === 200) {
          this.allPlaces = response.data;
          if (!this.selectedFilters.recommended) {
            $objectManager.removeAll();
            $objectManager.add(this.placesToJsonGeoObjects(this.allPlaces.slice(0, 800)));
          }
        }
      });

      let token = this.userToken();

      // Если не авторизован
      if (token === -1) {
        let favourites = this.$cookies.get('favourites');
        let favourites_ids = Object.keys(favourites).map(function (id) {
          return parseInt(id);
        });

        if (favourites_ids.length > 0){
          this.selectedFilters.recommended = true;
          this.tempSelectedFilters.recommended = true;

          axios.post('http://elesinsv.fvds.ru:8080/recommended-cafes-for', favourites_ids).then((response) => {
            if (response.status === 200) {
              this.recommendedPlaces = response.data;

              $objectManager.removeAll();
              $objectManager.add(this.placesToJsonGeoObjects(this.recommendedPlaces));
            }
          });
        }
        else {
          this.selectedFilters.recommended = false;
          this.tempSelectedFilters.recommended = false;
          $objectManager.removeAll();
          $objectManager.add(this.placesToJsonGeoObjects(this.allPlaces.slice(0, 800)));
        }
      }
      else {
        console.log(token)

        axios({
          method: 'get',
          url: 'http://elesinsv.fvds.ru:8080/recommended-cafes',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then((response) => {

        // axios.get(
        //     'http://elesinsv.fvds.ru:8080/recommended-cafes',
        //     {
        //       headers: { 'Authorization': 'Bearer ' + token }}).then((response) => {
          if (response.status === 200) {
            this.recommendedPlaces = response.data;
            if (this.recommendedPlaces.length > 0) {
              this.selectedFilters.recommended = true;
              this.tempSelectedFilters.recommended = true;
              $objectManager.removeAll();
              $objectManager.add(this.placesToJsonGeoObjects(this.recommendedPlaces));
            }
            else {
                this.selectedFilters.recommended = false;
                this.tempSelectedFilters.recommended = false;
                $objectManager.removeAll();
                $objectManager.add(this.placesToJsonGeoObjects(this.allPlaces));
              }
          }
        });
      }

      // Если авторизован
      // axios.get('http://elesinsv.fvds.ru:8080/users/1/recommended-cafes').then((response) => {
      //   if (response.status === 200) {
      //     this.recommendedPlaces = response.data;
      //     $objectManager.removeAll();
      //     $objectManager.add(this.placesToJsonGeoObjects(this.recommendedPlaces));
      //   }
      // });

      axios.get('http://elesinsv.fvds.ru:8080/filters').then((response) => {
        if (response.status === 200) {
          this.filtersList = response.data;
          this.filtersList.forEach((group) => {
            this.selectedFilters.other[group.name] = [];
            this.tempSelectedFilters.other[group.name] = [];
          });
        }
      });
    },
    updateSearch: function () {
      axios.get('http://elesinsv.fvds.ru:8080/cafes/search/'+this.searchQuery).then((response) => {
        if (response.status === 200) {
          this.searchResults = (response.data).slice(0, 100);
        }
      });
    },
    closeFilters: function () {
      this.showFilters=false;
      this.tempSelectedFilters = _.cloneDeep(this.selectedFilters);
    },
    applyFilters: function () {
      this.showFilters = false;
      this.selectedFilters = _.cloneDeep(this.tempSelectedFilters);
    },
    clearFilters: function () {
      this.filtersList.forEach((group) => {
        this.tempSelectedFilters.other[group.name] = [];
      });
      this.selectedFilters = _.cloneDeep(this.tempSelectedFilters);
      this.showFilters = false;
    },
    placesToJsonGeoObjects: function (places, onlyMarkers = false) {
      onlyMarkers = false
      let jsonGeoObjects = {
            "type": "FeatureCollection",
            "features": []
      }
      places.forEach((place) => {
        // iconContentOffset + padding 6x с двух сторон + примерная длинна строки
        let shapeX = 14+6*2+(place.name.length * 6.6);
        let geoObject = {
          "type": "Feature",
          "id": place.id,
          "geometry": {"type": "Point", "coordinates": [place.location.latitude, place.location.longitude]},
          // Когда много точек – показываем только маркеры, без iconCaption
          "properties": onlyMarkers ? {} : {
            iconContent: place.name,
            // iconCaption: place.name,
            balloonContent: place.name,
            balloonLink: '/place/'+place.id,
            balloonPlaceName: place.name,
            balloonPlaceAddress: place.address,
            balloonPlaceCategories: place.categories,
            balloonPlacePhoto: 'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg',
          },
          options: {
            iconShape: {
              type: 'Rectangle',
              coordinates: [
                [-8, -12], [shapeX, 12]
              ]
            }
          }
          // iconImageOffset: [-shapeX+8, -8],

          // iconShape: {
          //   type: 'Rectangle',
          //   coordinates: [
          //     [-8, -8], [16, shapeX]
          //   ]
          // }
        };
        jsonGeoObjects.features.push(geoObject)
      });
      return jsonGeoObjects;
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


.place-caption, .place-balloon {
  background: url('../assets/vector-arrow.svg') no-repeat left center;
  padding-left: 8px;
  .inner {
    font-family: 'Inter', sans-serif;
    border-radius: 6px;

    inline-size: min-content;
    white-space: nowrap;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.06);

    text-decoration: none;

  }
}
.place-caption {
  .inner {
    background: rgba(255, 255, 255, 0.8);

    color: #2F1B25;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    padding: 4px 6px;

    &:empty {display: none}
  }
}

.place-balloon {
  cursor: pointer;

  position: absolute;
  top: 8px;
  left: 3px;
  .inner {
    padding: 6px 12px 6px 6px;
    background: #fff;
    .balloon-content {
      display: flex;
      .balloon-img {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
      }
      img {height: 52px; width: 52px; border-radius: 10px}
      .balloon-info {
        margin-left: 8px;
        max-width: 336px;
        .name {
          color: #2F1B25; line-height: 20px; font-size: 14px; font-weight: 600; width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .categories {
          color: #978D92; line-height: 16px; font-size: 11px; font-weight: 400; width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;}
        .address { color: #6D5F66; line-height: 16px; font-size: 11px; font-weight: 400; width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}



body {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.yandex-container {
  position: absolute;
  top: 176px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  @media (max-width: 840px) {
    top: 0;
    bottom: 52px;
  }
}

.balloon-head {font-size: 25px}

.yandex-balloon {
  width: 300px;
  height: 52px;
  font-family: Inter,  sans-serif;
}




.map-bar {
  position: fixed;
  top: 85px;
  left: 0;
  width: 100%;
  height: 90px;
  background: #fff;
  z-index: 2;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.08);
  @media (max-width: 840px) {
    display: none;
  }
}

.btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  border-radius: 80px;
  box-shadow: (0px 2px 4px rgba(0, 0, 0, 0.08));
  cursor: pointer;
  gap: 8px;


  font-weight: 500;
  font-size: 15px;
  line-height: 20px;

  background: #EAE8E9;
  color: #2F1B25;

  &.flat-btn {box-shadow: none;}

  &.active {
    background: #F4743B;
    color: #fff;
    .btn-counter {background: #fff; color: #F4743B }
  }

  .btn-counter {
    border-radius: 80px;
    padding: 2px 6px;
    background: #6D5F66;
    color: #fff;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
  }

  &.recommendations-btn {
    width: 216px;
    height: 44px;
    box-sizing: border-box;
  }
}


.map-bar-content {
  width: 100%;
  margin: 0 auto;
  max-width: 840px;
  height: 84px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;


  .search-line {
    flex: 1;
    height: 20px;
    min-width: 20px;
    background: #fff;
    border-radius: 80px;
    box-shadow: (0px 2px 4px rgba(0, 0, 0, 0.08));
    border: 1px solid #EEEEEE;
    transition: all 1s ease;
  }
}

.search-results {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  &.map-search {
    @media (max-width: 840px) {
      position: fixed;
      top: 100px;
      bottom: 53px;
      overflow-y: scroll;
    }
  }
}

.place-card {
  display: flex;
  width: 100%;
  margin: 0 auto;
  cursor: pointer;
  text-decoration: none;
  padding: 10px 15px;
  box-sizing: border-box;


  &:hover {
    opacity: 0.9;
  }
  .place-card-img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .place-card-info {
    margin: 0 10px;
    text-align: left;
    flex: 1;

    div {
      margin-bottom: 2px;
    }

    .name {
      font-weight: 500;
      font-size: 15px;
      line-height: 20px;
      color: #2F1B25;
    }
    .categories {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: #978D92;
    }
    .address {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: #6D5F66;
    }
  }

}


.onboarding-modal, .filters-modal  {
  background: #fff;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;

  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 840px) {
    bottom: 0 !important;
    border-radius: 12px 12px 0 0;

  }
}

.vfm--overlay {
  background-color: rgb(47 27 37 / 60%) !important;
}

.filters-modal {
  position: absolute;
  left: 0;
  right: 0;
  top: 68px;
  bottom: 68px;


  .filters-modal-header {
    box-sizing: border-box;


    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 18px 15px;
    gap: 8px;

    width: 100%;
    height: 60px;

    background: #FFFFFF;

    border-bottom: 1px solid #EAE8E9;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    text-align: center;

    color: #2F1B25;
  }

  .filters-main {
    overflow-y: scroll;
    width: 100%;
    flex: 1;
    padding: 10px 0 0;

    .filter-group {
      padding: 0 15px 10px;
      .filter-h {
        padding: 9px 0;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #2F1B25;
        text-align: left;
      }

      .filter-variants {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 8px;
        padding: 4px 0;
      }

      .filter-variant {
        input[type="checkbox"] {
          display: none;
        }

        input[type="checkbox"] + label {
          -webkit-transition: all 200ms ease;
          transition: all 200ms ease;
          cursor: pointer;
          background-color: #fff;
          display: inline-block;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;

          padding: 8px 16px;
          border: 1px solid #EAE8E9;
          border-radius: 80px;

          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          color: #2F1B25;
        }


        input[type="checkbox"]:checked + label {
          background-color: #6D5F66;
          border-color: #6D5F66;
          color: white;
        }

      }
    }

  }
  .filters-footer {
    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 20px 15px;
    gap: 8px;

    width: 100%;
    height: 84px;

    /* White */

    background: #FFFFFF;
    /* Dark Purple/-10 */

    border-top: 1px solid #EAE8E9;
    .btn {
      width: 50%;
      flex: 1;
    }
  }
}



.map-bar-mobile {
  position: fixed;
  height: 80px;
  left: 0px;
  right: 0px;
  bottom: 53px;
  box-shadow: 0px -4px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px 12px 0px 0px;
  background: #fff;
  z-index: 2;

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  //gap: 16px;

  padding: 0 15px;
  gap: 8px;

  @media (min-width: 840px) {
    display: none;
  }

  .btn {
    box-shadow: none;
    padding: 10px 16px !important;
    height: auto;
    &.recommendations-btn {
      flex: 1;
    }
  }
}


.mobile-search-line {
  position: fixed;
  //height: 80px;
  left: 15px;
  right: 15px;
  top: 24px;

  display: flex;
  flex-direction: row;
  align-items: center;

  .search-input-wrapper input[data-search-input=true] {
    border: none;
    box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.08);
    &:focus {
      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  .cancel-search-btn {
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

</style>