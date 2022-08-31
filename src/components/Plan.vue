<template>
    <div>
        <b-card v-if="!loading" no-body style="border: solid 3px white; background: rgba( 255, 255, 255, 0.25 )">
          <b-card-header><h3>{{ data.name }} Plan</h3></b-card-header>
          <b-card-body>
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text >Execution Endpoint</b-input-group-text>
              </b-input-group-prepend>
              <b-form-input readonly ref="execution-endpoint" v-on:focus="$event.target.select()" :value="data.baseURL + 'execute'"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-secondary" id="execute-endpoint-copy" @click="copy('execution-endpoint')"><b-icon-clipboard></b-icon-clipboard></b-button>
                <b-tooltip target="execute-endpoint-copy" triggers="click blur" title="Copied!"></b-tooltip>
                <b-button variant="secondary" v-b-modal.executionTest>Test</b-button>
                <b-modal id="executionTest" @ok="executeTest">
                  <template #modal-title>
                    Test Execution
                  </template>
                    <b-card class="bg-light">
                      <div>
                        <h2>Options</h2>
                        <b-form-group
                          id="controller"
                          description="The address of your browser extension"
                          label="Controller Address"
                          label-for="input-1"
                        >
                          <b-form-input id="input-1" v-model="controller"></b-form-input>
                        </b-form-group>
                        <b-form-group
                          id="transaction"
                          description="Choose a transaction"
                          label="Transaction"
                          label-for="input-2"
                        >
                          <b-form-select id="input-2" :options="options" v-model="option"></b-form-select>
                        </b-form-group>
                    </div>
                  </b-card>
                </b-modal>
              </b-input-group-append>
            </b-input-group>
            <br> 
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text >Quota Endpoint</b-input-group-text>
              </b-input-group-prepend>
              <b-form-input readonly ref="quota-endpoint" v-on:focus="$event.target.select()" :value="data.baseURL + 'quota'"></b-form-input>
              <b-input-group-append>
                <b-button variant="outline-secondary" id="quota-endpoint-copy" @click="copy('quota-endpoint')"><b-icon-clipboard></b-icon-clipboard></b-button>
                <b-tooltip target="quota-endpoint-copy" triggers="click blur" title="Copied!"></b-tooltip>
                <b-button variant="secondary" @click="quotaTest">Test</b-button>
              </b-input-group-append>
            </b-input-group>
            <br>
            <b-card class="border-0 shadow" style="background: rgba( 255, 255, 255, 0.25 )">
                <h4 class="d-inline">Billing</h4>
                <b-row>
                    <b-col>Price: </b-col>
                    <b-col>{{ data.price }} USD</b-col>
                </b-row>
                <b-row>
                    <b-col>Quota: </b-col>
                    <b-col>{{ data.quota }} LYXe </b-col>
                </b-row>
                <b-row>
                    <b-col>Next Billing Cycle: </b-col>
                    <b-col>{{nextPeriod}}</b-col>
                </b-row>
                <b-progress class="mt-2" :max="data.quota" show-value>
                    <b-progress-bar id="usage" :value="remaining" variant="primary" style="transition-duration:1000ms;">
                        <span class="text-black">{{Number(((remaining > quota ? quota : remaining)).toFixed(3))}} remaining</span>
                    </b-progress-bar>
                    <b-progress-bar id="usage" :value="usage" variant="secondary"  style="transition-duration:1000ms;">
                        <span>{{Number(((usage > quota ? quota : usage)).toFixed(3))}} used</span>
                    </b-progress-bar>
                </b-progress>
                <br>
                <div v-if="!isLastPlan">
                    <b-button style="float: right" variant="outline-dark" :href="nextPlan.stripeURL + '?client_reference_id=' + this.$store.state.ethereum.user">Upgrade</b-button>              
                </div>
                <div v-if="!isFirstPlan">
                    <!-- <b-button style="float: right" variant="outline-danger" :href="`mailto:${supportEmail}?subject=Cancel&body=${user}`">Cancel Subscription</b-button>               -->
                    <b-button style="float: right" variant="primary" @click="manageSubscription">Manage Subscription</b-button>
                </div>
            </b-card>

          </b-card-body>
        </b-card>
        <b-card v-else no-body style="border: solid 3px white; background: rgba( 255, 255, 255, 0.25 )">
            <b-card-header>
                <b-skeleton width="50%"></b-skeleton>
            </b-card-header>
            <b-card-body>
                <b-skeleton type="input" width="100%"></b-skeleton><br>
                <b-skeleton type="input" width="100%"></b-skeleton><br>
                <br>
                <b-card class="border-0 shadow" style="background: rgba( 255, 255, 255, 0.25 )">
                    <b-skeleton width="50%"></b-skeleton>
                    <b-row>
                        <b-col><b-skeleton width="85%"></b-skeleton></b-col>
                        <b-col><b-skeleton width="60%"></b-skeleton></b-col>
                    </b-row>                
                    <b-row>
                        <b-col><b-skeleton width="60%"></b-skeleton></b-col>
                        <b-col><b-skeleton width="70%"></b-skeleton></b-col>
                    </b-row>                
                    <b-row>
                        <b-col><b-skeleton width="85%"></b-skeleton></b-col>
                        <b-col><b-skeleton width="70%"></b-skeleton></b-col>
                    </b-row>                
                    <b-skeleton width="100%"></b-skeleton>
                    <b-skeleton class="float-right" type="button"></b-skeleton>
                </b-card>
            </b-card-body>
        </b-card>
    </div>
</template>
<script>
import { BIconClipboard } from 'bootstrap-vue'
import { StripeCheckout } from '@vue-stripe/vue-stripe';

export default {
    components: {
        BIconClipboard,
        StripeCheckout,
    },
    data(){
        return {
            controller: "",
            options: [{ text: 'Send 0 to myself (should succeed)', value: false}, { text:'Send MAX to myself (should fail)', value: true}],
            option: [0],
            usage: 0,
            remaining: 0
        }
    },
    computed: {
        ready(){
            return !this.$store.state.ethereum.user
        },
        data(){
            return this.$store.state.quota
        }, 
        loading(){
            return !this.$store.state.ethereum.user || !this.$store.state.quota
        },
        isFirstPlan(){
            return JSON.stringify(this.$store.state.plans[0]) == JSON.stringify(this.$store.state.plans[this.$store.state.plan])
        },
        isLastPlan(){
            return JSON.stringify(this.$store.state.plans[this.$store.state.plans.length-1]) == JSON.stringify(this.$store.state.plans[this.$store.state.plan])
        },
        supportEmail(){
          return this.$store.state.supportEmail
        },
        user(){
            return this.$store.state.ethereum.user
        },
        quota(){
            return Number(this.$store.state.quota.quota)
        },
        plan(){
            return this.$store.state.plans[this.$store.state.plan]   
        },
        nextPlan(){
            return this.$store.state.plans[this.$store.state.plan+1]
        },
        nextPeriod(){
            let in30days = (new Date()).setDate((new Date()).getDate()+30)
            let period = this.data.nextPeriod.isBigNumber ? this.data.nextPeriod.toNumber() : this.data.nextPeriod
            period = period == 0 ? in30days : (new Date(period * 1000)).toLocaleString()
            return period || in30days
        }
    },
    watch:{
      ready() {
        this.$store.dispatch("getQuota")
        this.$store.dispatch("watch")
      },
      data() {
        let data = this.$store.state.quota
        setTimeout((() => {
          this.usage = Number(data.usage)
          this.remaining = Number(data.quota-this.usage < 0 ? 0 : data.quota-this.usage)
          
        }).bind(this), 500);
      }
    },
    methods: {
        copy(ref) {
            this.$refs[ref].focus();
            document.execCommand('copy');
        },
        quotaTest(){
          fetch(this.plan.baseURL +"quota", {
            method: "POST",
            body: JSON.stringify({ address: this.$store.state.ethereum.user, timestamp: Date.now()/1000, signature: ""}),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          }).then(res => { if(!res.ok) { throw new Error(res.statusText)} else { return res.json()}}).then(quota => {
            this.$bvToast.toast(`${quota['quota']} ${quota['unit']} of ${quota['totalQuota']} ${quota['unit']} resets at ${(new Date(quota['resetDate']*1000)).toLocaleDateString()}`, {
                variant: "success",
                title: "Success"
            })
          }).catch(err => {
            this.$bvToast.toast(err['message'], {
              variant: "danger",
              title: "Error"
            })
          })
        },  
        async executeTest(e){
          e.preventDefault()
          await this.$store.dispatch("test", { URL: this.plan.baseURL +"execute", controller: this.controller, MAX: this.option}).then(json => {
              this.$bvToast.toast(`Transaction hash: ${JSON.stringify(json)}`, {
                  variant: "success",
                  title: "Success"
              })
          }).catch(err => {
              this.$bvToast.toast(err['message'], {
                  variant: "danger",
                  title: "Error"
              })
          })
        },
        async manageSubscription(){
          fetch(this.data.baseURL + 'create-customer-portal-session', { 
            method: 'POST', 
            redirect: 'follow',            
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              address: this.$store.state.ethereum.user,
              redirect_url: window.location.href,
            })
          })
          .then(res => { if(!res.ok) { throw new Error(res.statusText)} else { return res.json()}}).then(res => {
              // HTTP 301 response
              window.open(res.url, '_blank').focus();
          })
          .catch(err => {
              this.$bvToast.toast(err['message'], {
                  variant: "danger",
                  title: "Error"
              })
          });
        }
    },
    mounted(){

    }

}
</script>
