<template>
  <div class="place-info-content">
    <div class="place-header" :style="'background-image: url(\'http://elesinsv.fvds.ru:8080/assets/cafes/'+place.photo+'.jpg\')'">
      <div class="gradient"></div>
      <div class="place-header-text">
        {{ place.name }}
        <div class="place-categories">{{ place.categories }}</div>
      </div>
      <div class="actions">
        <a class="action-btn">
          <span class="material-icons">bookmark_border</span>
        </a>
        <a class="action-btn">
          <span class="material-icons">favorite_border</span>
        </a>
        </div>
      <a class="action-btn close" @click="this.$router.push(this.$router.options.history.state.back)">
        <span class="material-icons">close</span>
      </a>
    </div>

    {{ id }}
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'PlaceInfo',
  props: {
    id: Number,
  },

  data() {
    return {
      place: {},
    }
  },

  created() {
    axios.get('http://elesinsv.fvds.ru:8080/cafes/'+this.id).then((response) => {
      if (response.status === 200) {
        this.place = response.data;
      }
    });
  },
  methods: []
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

.place-info-content {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 8px;

  .place-header {
    width: 100%;
    height: 240px;
    border-radius: 24px;
    position: relative;
    overflow: hidden;

    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;

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


}



h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
