<template>
  <div>
    <div v-if="!isConnected && !loading" class="text-center">
        <b-card style="border: 3px dashed white; background: rgba( 255, 255, 255, 0.25 )">
            <h3 class="text-muted">Connect your Universal Profile</h3>
            <br>
            <b-img :src="require('@/assets/tabs.svg')"  style="filter: grayscale(100%); opacity: .5; max-height: 200px"></b-img>
            <br>
            <br>
            <b-button variant="dark" @click="Connect" :disabled="loading">Connect</b-button>
        </b-card>
    </div>
    <b-button v-else-if="!isConnected && loading" variant="dark" disabled><b-spinner></b-spinner></b-button>

    <!-- <b-button title="Connect your wallet" size="lg" v-if="!isConnected" variant="light" @click="Connect()"><b-icon-wallet-2></b-icon-wallet-2></b-button> -->
    <div v-else-if="!isCorrectNetwork && !loading"><b-badge variant="danger">Unsupported Network</b-badge></div>
    <b-button v-else-if="!isCorrectNetwork && loading" variant="dark" disabled><b-spinner></b-spinner></b-button>
    <div v-else-if="ready">
        <b-avatar style="border: solid 2px white" alt="Ethereum blockies avatar" :src="blocky" :title="$store.state.ethereum.user" @click="toggle()"></b-avatar>
        <b-badge variant="light" class="ml-2"><b>{{$store.state.ethereum.network}}:</b> {{$store.state.ethereum.user.substring(0,10)}}...</b-badge>
    </div>
    <div v-else>Error</div>
  </div>
</template>
<script>
import makeBlockie from 'ethereum-blockies-base64';
// import { BIconWallet2 } from 'bootstrap-vue'

export default {
    name: "Connect",
    // components: { BIconWallet2 },
    data(){
        return {
            dialog: false,
        }
    }, 
    methods: {
        async Connect(){
            this.$store.dispatch("ethereum/Connect").then(result => {
            }).catch(err => {
                this.$store.dispatch("ethereum/stopLoading")
                this.$bvToast.toast(err['message'], {
                    variant: "danger",
                    title: "Error"
                })
            })
        },
        async Disconnect(){
            this.loading = true
            this.$store.dispatch("ethereum/Disconnect").then(result => {
            }).catch(err => {
                this.$store.dispatch("ethereum/stopLoading")
                this.$bvToast.toast(err['message'], {
                    variant: "danger",
                    title: "Error"
                })
            })
        },
        toggle(){
            let modal = document.getElementById('dialog-default');  
            this.dialog = this.dialog ? false : true
            this.dialog ? modal.showModal() : modal.close();
        }
    },
    computed: {
        loading(){
            return this.$store.state.ethereum.loading
        },
        isConnected(){
            return this.$store.getters['ethereum/isConnected']
        },
        isCorrectNetwork(){
            return this.$store.getters['ethereum/isCorrectNetwork']
        },
        ready(){
            return this.$store.getters['ethereum/ready']
        },
        signer(){
            return this.$store.state.signer
        },
        blocky(){
            let user = this.$store.state.ethereum.user
            if(user){
                return makeBlockie(user);
            }
            return ""
        }
    }
}

</script>