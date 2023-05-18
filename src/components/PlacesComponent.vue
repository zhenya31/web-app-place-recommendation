<template>
  <div class="map-bar">
    <div class="map-bar-content">
      <a class="btn recommendations-btn" :class="{active : filters.recommended }" @click="filters.recommended = !filters.recommended">
        Рекомендации
        <div class="btn-counter">{{ recommendedPlaces.length }}</div>
      </a>
      <a class="btn" :class="{active : filters.recommended }" @click="filters.recommended = !filters.recommended">
        <img src="../assets/icon-filters-20.svg">
        Фильтры
        <div class="btn-counter">{{ recommendedPlaces.length }}</div>
      </a>
      <div class="search-line">
        <SearchInput @focus="this.$router.push('/favorites')" />

      </div>
    </div>
  </div>
  <div>Объектов на карте: {{ shownPlaces.length }}</div>
  <div>Открытый ресторан: {{  }}</div>
  <button @click="filter">Фильтр!</button>
  <!--  {{ da }}-->
  <!--  <div v-for="(place, i) in places" :key="`a-${i}`">-->
  <!--    {{ place.name  }}-->
  <!--  </div>-->
  <YandexMap
      :coordinates="coordinates"
      :detailed-controls="detailedControls"
      :controls="controls"
      :settings="settings"
      @created="mapInit"
  >
    <YandexCollection :options="{ preset: 'islands#orangeCircleDotIcon' }">
      <YandexMarker
          v-for="(place, i) in shownPlaces"
          :key="`m-${i}`"
          :options="{
            //balloonLayout: BalloonContentLayout,
          }"
          :coordinates="[place.location.latitude, place.location.longitude]"
          :properties="{ iconCaption: place.name,
          // balloonHeader: 'Заголовок балуна',
          //   balloonContent: 'Контент балуна',
          //   balloonFooter: 'Футер балуна'
          }"
          :marker-id="`m-${i}`"
      >
        <template #component>
          <PlaceBalloon  :name="place.name" :address="place.address" :categories="place.categories" :photo="place.photo" />
        </template>
      </YandexMarker>
    </YandexCollection>

  </YandexMap>
</template>

<script>
import { ref } from 'vue';
import PlaceBalloon from './PlaceBalloon.vue';
import { loadYmap, YandexMap, YandexMarker, YandexCollection } from 'vue-yandex-maps';
import axios from 'axios'

import SearchInput from 'vue-search-input'


// let myMap;

export default {
  name: 'Places',
  components: {
    YandexMap,
    YandexMarker,
    YandexCollection,
    // eslint-disable-next-line vue/no-unused-components
    loadYmap,
    // eslint-disable-next-line vue/no-unused-components
    PlaceBalloon,
    SearchInput
  },
  data() {
    return {
      settings: {
        apiKey: 'f8bbc959-1a6a-48c1-a92c-3316ea6e81f3', // Индивидуальный ключ API
        lang: 'ru_RU', // Используемый язык
        coordorder: 'latlong', // Порядок задания географических координат
        debug: false, // Режим отладки
        version: '2.1' // Версия Я.Карт
      },
      controls: ['fullscreenControl'],
      detailedControls: {zoomControl: {position: {right: 10, top: 50}}},
      coordinates: ref([55.7, 37.8]),
      allPlaces: [],
      recommendedPlaces: [],
      filteredIds: [],
      BalloonContentLayout: {},
      filters: {
        recommended: true,
      }
    }
  },
  computed: {
    shownPlaces: function () {
      let places;
      if (this.filters.recommended)
        places = this.recommendedPlaces
      else
        places = this.allPlaces

      let max_n = 500
      if (places.length > max_n)
        places = places.slice(0, max_n);

      if (this.filteredIds.length !== 0)
        places = places.filter((place) => { return this.filteredIds.indexOf(place.id) >= 0 })

      return places;
    }
  },
  async mounted() {
    await loadYmap(this.settings);
    // eslint-disable-next-line no-undef
    console.log(ymaps);


    // eslint-disable-next-line no-undef,no-unused-vars
    // this.BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    //     '<div class="balloon-root ">'+
    //     '<a class="close" href="#">&times;</a>'+
    //     '<div class="arrow balloon-pin"></div>'+
    //     '<div class="balloon-head balloon">$[properties.balloonHeader]</div>'+
    //     '<div class="balloon-body balloon">$[properties.balloonContent]</div>'+
    //     '<div class="balloon-footer balloon">$[properties.balloonFooter]</div>'+
    //     '</div>', {
    //       //Формирование макета
    //       build: function () {
    //         this.constructor.superclass.build.call(this);
    //
    //         this.applyElementOffset();
    //       },
    //       //удаление макета из DOM
    //       clear: function () {
    //         this._$element.find('.close')
    //             .off('click');
    //
    //         this.constructor.superclass.clear.call(this);
    //       },
    //       //закрытие балуна
    //       onCloseClick: function (e) {
    //         e.preventDefault();
    //
    //         this.events.fire('userclose');
    //       },
    //     });

    axios.get('http://elesinsv.fvds.ru:8080/cafes').then((response) => {
      if (response.status === 200) {
        this.allPlaces = response.data;
      }
    });

    axios.get('http://elesinsv.fvds.ru:8080/users/1/recommended-cafes').then((response) => {
      if (response.status === 200) {
        this.recommendedPlaces = response.data;
      }
    });
  },
  methods: {
    filter:  function () {
      let filter_data = [
        {
          "name": "Тип кухни",
          "variants": [
            "Грузинская",
            "Вегетарианская",
            "Израильская"
          ]
        }
      ];
      axios.post('http://elesinsv.fvds.ru:8080/filtered-cafes', filter_data).then( (response) => {
        if (response.status === 200){
          this.filteredIds = response.data
          alert(this.filteredIds.length)
        }
      })
    },
    mapInit: function (map){
      // myMap = e;
      // Делаем так, чтобы балун закрывался о клику по любому месту на карте (кроме геообъекта)
      map.events.add('click', function (e) {
        if(e.get('target') === map) { // Если клик был на карте, а не на геообъекте
          map.balloon.close();

        }
      });
    },
    openPlace: function () {

    }
  }
}
</script>

<style lang="scss">

.yandex-container {
  height: 700px;
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


  .search-line {
    flex: 1;  /* 1 and it will fill whole space left if no flex value are set to other children*/
    height: 20px;
    min-width: 20px;
    background: #fff;
    border-radius: 80px;
    box-shadow: (0px 2px 4px rgba(0, 0, 0, 0.08));
  }
}


</style>