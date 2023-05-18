<template>
  <h1>Профиль</h1>
  <div  v-if="activeScreen === 'login'"  class="profile-content">
    <div class="color-box">
      <div class="title-text">
        Войдите, чтобы получить доступ к своему избранному и рекомендациям
      </div>
      <div class="profile-from">
        <div class="label">Email адрес</div>
        <input type="text" v-model="login.email" placeholder="Введите ваш email" @keyup.enter="doLogin">
        <div class="label">Пароль</div>
        <input type="password" v-model="login.password" placeholder="Введите ваш пароль" @keyup.enter="doLogin">

        <a class="btn" style="margin-top: 28px" @click="doLogin">Войти</a>
      </div>
      <div class="profile-error-msg" v-if="login.error != ''">
        {{ login.error }}
      </div>
    </div>
    <div class="profile-question-action">
      Нет аккаунта? <a @click="activeScreen = 'signup'">Создать</a>
    </div>
  </div>
  <div v-if="activeScreen === 'signup'" class="profile-content">
    <div class="color-box">
      <div class="title-text">
        Зарегистрируйтесь, чтобы получать  индивидуальные рекомендации на всех устройствах
      </div>
      <div class="profile-from">
        <div class="label">Email адрес</div>
        <input type="text" v-model="signup.email" placeholder="Введите ваш email">
        <div class="label">Пароль</div>
        <input type="password" v-model="signup.password" placeholder="Придумайте пароль">
        <div class="label">Еще раз пароль</div>
        <input type="password" v-model="signup.passwordConfirm" placeholder="Введите пароль еще раз">

        <a class="btn" style="margin-top: 28px">Создать аккаунт</a>
      </div>
      <div class="profile-error-msg">
        Пароли не совпадают
      </div>
    </div>
    <div class="profile-question-action">
      Уже есть аккаунт? <a @click="activeScreen = 'login'">Войти</a>
    </div>
  </div>

  <div v-if="activeScreen === 'loggedin'" class="profile-content">
    <div class="color-box">
      <div class="title-text">
        Вы авторизовались как <br>
        {{ loggedin.email}}
      </div>
      <a class="btn" style="margin-top: 28px" @click="doLogout">Выйти</a>
    </div>
  </div>

</template>

<script>

import axios from "axios";
import _ from "lodash";

export default {
  name: 'ProfileComponent',

  data() {
    return {
      activeScreen: '',
      login: {
        email: '',
        password: '',
        error: '',
      },
      signup: {
        email: '',
        password: '',
        passwordConfirm: '',
        error: '',
      },
      loggedin: {
        email: '',
      }
    }
  },

  created() {
    let token = this.$cookies.get('usertoken');
    console.log(token)
    if (token !== undefined && token !== null && token !== -1 && token !== '') {
      this.loggedin.email = this.$cookies.get('userEmail');
      this.activeScreen = 'loggedin';
    }
    else {
      this.activeScreen = 'signup';
    }
  },
  methods: {
    doLogin: function (){
      let loginData = {
        email: this.login.email,
        password: this.login.password,
      }
      axios.post('http://elesinsv.fvds.ru:8080/login', loginData).then((response) => {
        if (response.status === 200) {
          let usertoken = response.data;

          this.$cookies.set('usertoken', usertoken);
          this.$cookies.set('userEmail', loginData.email);

          this.loggedin.email = loginData.email;
          this.activeScreen = 'loggedin';
        }
        else {
          this.login.error = 'Не верный логин или пароль'
        }
      }).catch((error) => {
        this.login.error = 'Не верный логин или пароль';
      });
    },
    doLogout: function (){
      this.$cookies.remove('userEmail');
      this.$cookies.remove('usertoken');
      this.$cookies.set('favourites', {});
      this.$cookies.set('bookmarks', {});
      this.activeScreen = 'login';
    },
  }
}
</script>

<style lang="scss">

.profile-content {
  max-width: 480px;
  margin: 0 auto;

  .color-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 22px;
    gap: 32px;
    margin-top: 24px;
    margin-bottom: 24px;

    .title-text {
      font-weight: 500;
      font-size: 15px;
      line-height: 20px;

      text-align: center;

      color: #000000;
    }
    .profile-from {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0;
      box-sizing: border-box;
      width: 100%;

      .label {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        color: #2F1B25;
        text-align: left;
        width: 100%;

        margin-bottom: 4px;

      }

      input {
        padding: 10px 16px 10px 24px;
        gap: 8px;
        box-sizing: border-box;
        width: 100%;
        margin-bottom: 16px;

        background: #FFFFFF;

        box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;

        font-weight: 400;
        font-size: 14px;
        line-height: 20px;

        outline: none;
        border: none;
      }
    }
  }

  .profile-error-msg {
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    /* identical to box height, or 167% */

    text-align: center;

    color: #F44336;
  }

  .btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    gap: 8px;

    width: 100%;
    box-sizing: border-box;

    background: #F4743B;
    border-radius: 8px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    text-align: center;

    color: #FFFFFF;

    &:hover {opacity: 0.9}

  }

  .profile-question-action {
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;

    text-align: center;


    color: #2F1B25;

    a {
      font-weight: 600;
      color: #F4743B;
      cursor: pointer;
      &:hover {opacity: 0.9}
    }
  }

}



</style>
