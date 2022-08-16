<template>
  <div>
    <div v-if="!isConnected" class="container">
      <b-card id="overlay" class="h-100">
          <div class="d-flex h-100">
              <connect class="align-self-center mx-auto"></connect>
          </div>
      </b-card>
    </div>
    <div class="container text-left mt-4">
      <plan></plan>
      <br>
      <br>
      <transaction-list></transaction-list>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Plan from "@/components/Plan.vue"
import TransactionList from '@/components/TransactionList.vue';
import Connect from "@/components/Connect.vue";

export default {
  name: "HomeView",
  components: {
    Plan,
    TransactionList,
    Connect
  },
  computed: {
    isConnected(){
        return this.$store.getters['ethereum/ready']
    },
  }
};
</script>