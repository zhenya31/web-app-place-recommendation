<template>
  <div class="header">
    <div class="header-content">
       <img src="./assets/logo.png" id="logo">
      <div class="header-menu">
        <router-link to="/places/" class="menu-link"><div class="icon icon-place"></div> Места</router-link>
        <router-link to="/favorites/liked/" class="menu-link"><div class="icon icon-favorites"></div> Избранное</router-link>
        <router-link to="/profile" class="menu-link"><span class="material-icons">person</span> Профиль</router-link>
      </div>
    </div>
  </div>
  <div id="content">
    <router-view></router-view>
  </div>

  <div class="mobile-nav">
        <router-link to="/places/" class="menu-link"><span class="material-icons">location_on</span> <span>Места</span></router-link>
        <router-link to="/favorites/liked/" class="menu-link"><span class="material-icons">favorite</span> <span>Избранное</span></router-link>
        <router-link to="/profile" class="menu-link"><span class="material-icons">person</span> <span>Профиль</span></router-link>
  </div>

</template>

<script>
</script>

<style lang="scss">

.header {
  width: 100%;
  border-bottom: 1px solid #EAE8E9;
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
  z-index: 1;
  @media (max-width: 840px) {
    display: none;
  }

  .header-content {
    width: 100%;
    margin: 0 auto;
    max-width: 840px;
    height: 84px;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;

    #logo {width: 241px; margin-right: 72px;}

    .header-menu {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: right;
      width: auto;
      align-content: stretch;

      .menu-link {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        color: #555555;
        text-decoration: none;
        margin-left: 40px;

        .icon {
          margin-right: 12px;
          width: 24px;
          height: 24px;
        }

        .icon-place { background: url('./assets/icon-place-24.svg') }
        &.router-link-active .icon-place {background: url('./assets/icon-place-active-24.svg') }

        .icon-favorites { background: url('./assets/icon-favorites-24.svg') }
        &.router-link-active .icon-favorites {background: url('./assets/icon-favorites-active-24.svg') }

        .material-icons {
          color: #555555;
          font-size: 24px;
          line-height: 24px;
          margin-right: 12px;
        }
        &.router-link-active {
          .material-icons {
            color: #F4743B;
          }
        }


        &.router-link-active {color: #F4743B;}
    }

    }

  }
}

.mobile-nav {
  border-top: 1px solid #EAE8E9;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1;
  display: flex;

  padding: 0 15px;

  height: 52px;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  @media (min-width: 840px) {
    display: none;
  }

  a.menu-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 6px 0px;
    gap: 2px;

    width: 90px;
    height: 52px;

    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    color: #978D92;

    text-decoration: none;

    .material-icons {
      font-size: 24px;
      line-height: 24px;
      color: #978D92
    }

    &.router-link-active {
      color: #2F1B25;
      .material-icons {
        color:  #F4743B;
      }
    }
  }


}


#content {
  padding-top: 84px;
  @media (max-width: 840px) {
    padding-top: 0 !important;
  }
}

#app {
  font-family: Inter,  sans-serif;
  text-align: center;
  color: #2c3e50;
}

body {margin: 0; padding: 0}

</style>