<template>
  <div class="place-info-content">
    <div class="place-header" :style="'background-image: url(\'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg\')'">
      <div class="gradient"></div>
      <div class="place-header-text">
        {{ place.name }}
        <div class="place-categories">{{ place.categories }}</div>
      </div>
      <div class="actions">
        <a class="action-btn" @click="addToBookmarks" v-if="!inBookmarks">
          <span class="material-icons">bookmark_border</span>
        </a>
        <a class="action-btn" @click="removeFromBookmarks" v-if="inBookmarks" style="color: #9FD356">
          <span class="material-icons">bookmark</span>
        </a>
        <a class="action-btn" @click="addToFavourites" v-if="!inFavourites">
          <span class="material-icons">favorite_border</span>
        </a>
        <a class="action-btn active"  @click="removeFromFavourites" v-if="inFavourites">
          <span class="material-icons">favorite</span>
        </a>
      </div>
      <a class="action-btn close" @click="this.$router.push(this.$router.options.history.state.back)">
        <span class="material-icons">close</span>
      </a>
    </div>
    <div class="place-info-boxes">
      <div class="place-info-box">
        <div class="place-info-title">Адрес</div>
        <div class="place-info-box-content">{{ place.address }}</div>
      </div>
      <div class="place-info-box">
        <div class="place-info-title">Часы работы</div>
        <div class="place-info-box-content">
          <div v-for="(days, index) in place.workingHours.split('; ')" :key="index">
            {{ days }}
          </div>
        </div>
      </div>
      <div class="place-info-box big-box">
        <div class="place-info-title">Контакты</div>
        <div class="place-info-box-content">
          <div class="phone-numbers" >
              <a class="contact-link" v-for="(phoneNumber, index) in place.contactPhoneNumbers.split(', ')" :key="index">
                <div class="contacts-icon"><span class="material-icons">call</span></div>
                {{ phoneNumber }}
              </a>
          </div>
<!--          <div class="place-info-subtitle" style="margin-top: 14px">Сайт</div>-->
          <div class="sites" style="margin-top: 14px">
            <template v-for="(socials, index) in place.socials" :key="index">
              <a v-if="socials.type === 'Website'" href="socials.link" class="contact-link">
                <div class="contacts-icon"><span class="material-icons">language</span></div>
                {{ getDomain(socials.link) }}
              </a>
            </template>
          </div>
        </div>
      </div>

      <div v-if="inRecommendations" class="place-info-box big-box color-box" style="background: #F5FBEF; border-radius: 12px;">
        <div class="place-info-title">Рекомендуем!</div>
        <div class="place-info-box-content">Это место есть в списке рекомендованных. Сохраните его, чтобы не забыть</div>
        <a class="place-info-btn" @click="addToBookmarks" v-if="!inBookmarks" style="background: #91BC5A;">
          <span class="material-icons">bookmark_border</span>
          Хочу сходить
        </a>
        <a class="place-info-btn" @click="removeFromBookmarks" v-if="inBookmarks" style="background: #91BC5A;">
          <span class="material-icons">bookmark</span>
          Хочу сходить
        </a>
      </div>

      <div class="place-info-box big-box color-box" style="background: #F3EFF9; border-radius: 12px;">
        <div class="place-info-title">Уже бывали тут?</div>
        <div class="place-info-box-content">Добавьте заведение в список любимых мест. Будем рекомендовать похожие</div>
        <a class="place-info-btn" @click="addToFavourites" v-if="!inFavourites" style="background: #F4743B;">
          <span class="material-icons">favorite_border</span>
          Любимое место
        </a>
        <a class="place-info-btn active"  @click="removeFromFavourites" v-if="inFavourites" style="background: #F4743B;">
          <span class="material-icons">favorite</span>
          Любимое место
        </a>
      </div>

      <div class="place-info-box big-box">
        <div class="place-info-title">Теги и подборки</div>
        <div class="place-info-box-content" style="font-weight: 400; font-size: 14px; line-height: 20px; color: #6D5F66">{{ place.tags }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: 'PlaceInfo',
  props: {
    id: Number,
  },

  data() {
    return {
      place: {},
      inFavourites: false,
      inBookmarks: false,
      inRecommendations: false,
      phoneNumbersArray: [],
    }
  },

  created() {
    axios.get('http://elesinsv.fvds.ru:8080/cafes/'+this.id).then((response) => {
      if (response.status === 200) {
        this.place = response.data;

        this.inFavourites = Object.keys(this.$cookies.get('favourites')).indexOf(this.id.toString()) >= 0;
        this.inBookmarks = Object.keys(this.$cookies.get('bookmarks')).indexOf(this.id.toString()) >= 0;

        this.inRecommendations = this.isInRecommendations();

      }
    });

  },
  methods: {
    addToFavourites: function () {
      let currentFavourites = this.$cookies.get('favourites');
      if (currentFavourites === undefined || _.isEmpty(currentFavourites))
        currentFavourites = {}
      currentFavourites[this.place.id] = {
        id: this.place.id,
        name: this.place.name,
        photo: this.place.photo,
        categories: this.place.categories,
        address: this.place.address,
      }
      this.$cookies.set('favourites', currentFavourites);
      this.inFavourites = true;
    },
    removeFromFavourites: function (){
      let places = this.$cookies.get('favourites')
      delete places[this.place.id];
      this.$cookies.set('favourites', places);
      this.inFavourites = false;
    },
    addToBookmarks: function () {
      let currentBookmakrs = this.$cookies.get('bookmarks');
      if (currentBookmakrs === undefined || _.isEmpty(currentBookmakrs))
        currentBookmakrs = {}
      currentBookmakrs[this.place.id] = {
        id: this.place.id,
        name: this.place.name,
        photo: this.place.photo,
        categories: this.place.categories,
        address: this.place.address,
      }
      this.$cookies.set('bookmarks', currentBookmakrs);
      this.inBookmarks = true;
    },
    removeFromBookmarks: function (){
      let places = this.$cookies.get('bookmarks')
      delete places[this.place.id];
      this.$cookies.set('bookmarks', places);
      this.inBookmarks = false;
    },

    getDomain: function(href) {
      let l = document.createElement("a");
      l.href = href;
      return l.hostname;
    },

    isInRecommendations: async function () {

      //Если пользователь не авторизован:

      let favourites = this.$cookies.get('favourites');
      let favourites_ids = Object.keys(favourites).map(function (x) {
        return parseInt(x);
      });
      await axios.post('http://elesinsv.fvds.ru:8080/recommended-cafes', favourites_ids).then((response) => {
        if (response.status === 200) {
          let recommendedPlacesIds = response.data.map(function (place) {
            return place.id
          });

          return recommendedPlacesIds.indexOf(this.id) >= 0;
        }
      });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">



.contact-link {
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  height: 32px;

  color: #2F1B25;

  //margin: 8px 0;
}
.contacts-icon {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px;
  gap: 4px;

  width: 32px;
  height: 32px;


  border: 1px solid #EAE8E9;
  border-radius: 80px;

  .material-icons {
    color: #978D92;
    font-size: 20px;
    line-height: 20px;
  }
}

.place-info-box-content {
  .phone-numbers, .sites {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px;
    gap: 5px 28px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
}

.place-info-content {
  max-width: 640px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 32px 0;

  @media (max-width: 840px) {
    padding: 10px 0 53px;
  }

  .place-header {

    height: 240px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;

    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;

    @media (max-width: 840px) {
      margin: 0 8px;
    }

    .gradient {
      position: absolute;
      left: 0%;
      right: 0%;
      top: 0%;
      bottom: 0%;

      background: linear-gradient(180deg, rgba(47, 27, 37, 0) 0%, rgba(47, 27, 37, 0.3) 37.95%, rgba(47, 27, 37, 0.8) 100%);
    }

    .place-header-text {
      position: absolute;
      left: 0px;
      right: 0px;
      bottom: 30px;
      text-align: center;

      font-weight: 600;
      font-size: 28px;
      line-height: 28px;

      color: #FFFFFF;
      .place-categories {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;

        color: #FFFFFF;
        margin-top: 4px;
      }
    }

    .action-btn{
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 6px;
      background: #FFFFFF;
      border-radius: 80px;
      color: #978D92;
      font-size: 24px;
      line-height: 24px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
      &.active {color: #F4743B}
    }
    .actions {
      position: absolute;
      left: 15px;
      top: 12px;
      display: flex;
      flex-direction: row;
      gap: 8px;
    }
    .close {
      position: absolute;
      right: 15px;
      top: 12px;
    }
  }


  .place-info-boxes {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-top: 16px;

    .place-info-box {
      width: 50%;
      box-sizing: border-box;
      text-align: left;
      padding: 15px 15px;

      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &.big-box {
        width: 100%;
        margin-top: 10px;
      }
    }

    .place-info-title {
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: #2F1B25;
      margin-bottom: 9px;
    }
    .place-info-subtitle {
      font-weight: 400;
      font-size: 16px;
      line-height: 20px;
      color: #2F1B25;
      margin-bottom: 8px;
    }

    .place-info-box-content {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;

      color: #2F1B25;
    }
    .place-info-btn {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 6px 16px;
      gap: 4px;

      height: 32px;
      box-sizing: border-box;

      border-radius: 80px;
      cursor: pointer;

      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      color: #FFFFFF;
      margin-top: 15px;
      .material-icons {
        color: #fff;
        font-size: 20px;
        line-height: 20px;
      }
    }
  }

}


</style>
