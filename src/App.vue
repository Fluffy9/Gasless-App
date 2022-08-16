<template>
  <div id="app" class="">
    <!-- #region Main Menu -->
    <b-navbar class="" toggleable="sm">
      <b-navbar-brand role="button" title="Home" to="/" class="bg-white px-2 text-dark rounded" style="display: flex; align-items: center;">
        <b-avatar size="sm" :src="require('@/assets/10069.jpg')"></b-avatar>
      </b-navbar-brand>
      <b-collapse id="nav-text-collapse" is-nav>
        <b-navbar-nav class="mx-auto text-center">
          <!-- <b-nav-item to="/About"><small style="color: black">About</small></b-nav-item>
          <b-nav-item to="/Pricing"><small style="color: black">Pricing</small></b-nav-item> -->
        </b-navbar-nav>
        <b-navbar-nav class="m-0">
          <connect v-if="isConnected"></connect>
        </b-navbar-nav>
      </b-collapse>
      <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>
    </b-navbar>
    <!-- #endregion Main Menu -->
    <div class="mx-auto">
      <div>
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </div>
    <br>

  </div>
</template>

<style lang="scss">

$primary: #a0bed4;
$success: #a9ecbc;
$secondary: #ecafd7;
$body-bg: #f9ffff;
$white: white;

$theme-colors: (
  "primary": $primary,
  "secondary": $secondary,
  "success": $success,
  "dark": #030303,
  "white": $white,
  //...other variables, you can find them in node_modules/bootstrap/scss/_variables.scss
);

.card {
  border-radius: 20px;
}
.card-header {
  border-radius: 20px 20px 0 0;
}

// Import Bootstrap and BootstrapVue source SCSS files
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";
@import "~bootstrap-vue/src/icons.scss";

@import url('https://fonts.googleapis.com/css2?family=PT+Mono&display=swap');


body, html {
  background-image: url("@/assets/mesh-gradient.png");
  background-size: cover;
}

#overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 1;
  background: rgba( 255, 255, 255, 0.25 );
  text-align: center;
  backdrop-filter: blur(5px);
  border: 0
}

#app {
  // font-family: 'PT Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #030303;
}

.menu {
  background: rgba( 255, 255, 255, 0.25 );
  backdrop-filter: blur( 4px );
  -webkit-backdrop-filter: blur( 4px );
}

.btn {
  border-radius: 1px
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgb(98 123 209 / 8%) !important;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.15s;
}

.fade-enter-active {
  transition-delay: 0.15s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

</style>
