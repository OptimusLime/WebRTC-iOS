import Vue from 'vue'
import App from './App.vue'
import * as VueThreejs from 'vue-threejs' // >= 0.2.0

Vue.use(VueThreejs)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
