<template>
    <div>
        <h3 class="d-inline mr-2">Transactions</h3>
        <p class="text-muted">A list of the last 1000 transactions associated with your profile</p>
        <div v-if="$store.state.ethereum.user">
            <div v-if="transactions['length'] == 0" >
                <b-card style="border: 3px dashed white; background: rgba( 255, 255, 255, 0.25 )">
                    <div class="text-center">
                        <h3 class="text-muted">No data</h3>
                        <b-img :src="require('@/assets/no-data.svg')" style="filter: grayscale(100%); opacity: .25; max-height: 200px"></b-img>
                    </div>
                </b-card>
            </div>
            <div v-else>
                <div v-for="(transaction, index) in transactions.slice((cur-1)*per, (cur)*per)" :key="transaction.hash">
                    <b-row>
                        <!-- <b-col lg="auto" md="auto" sm="auto"><b-card class="bg-transparent border-0">{{index + 1}}.</b-card></b-col> -->
                        <b-col>
                            <b-card class="border-0" style="background: rgba( 255, 255, 255, 0.5 )">
                                <b-row>
                                    <b-col lg="auto" md="auto" sm="auto"><b-badge :variant="colors[$store.state.plans.findIndex(plan => plan.name == transaction.plan)]">{{transaction.plan}} Plan</b-badge></b-col>
                                    <b-col><a style="text-overflow: ellipsis; overflow: hidden; max-width: 200px; display:inline-block; white-space: nowrap;" :href="`https://explorer.execution.l16.lukso.network/tx/${transaction.hash}`">{{transaction.hash}}</a></b-col>
                                    <b-col>{{transaction.usage}} LYXe Used</b-col>
                                    <b-col>{{(new Date(transaction.timestamp)).toLocaleDateString()}}</b-col>
                                </b-row>
                            </b-card>
                        </b-col>
                    </b-row>
                    <br>
                </div>
                <div class="text-center">
                    <b-pagination v-model="cur" :total-rows="rows" :per-page="per" align="center"></b-pagination>
                </div>
            </div>
        </div>
        <div v-else>
            <b-card style="border: 3px dashed white; background: rgba( 255, 255, 255, 0.25 )">
                <b-row>
                    <b-col><b-skeleton width="40%"></b-skeleton></b-col>
                    <b-col><b-skeleton width="85%"></b-skeleton></b-col>
                    <b-col><b-skeleton width="60%"></b-skeleton></b-col>
                </b-row>   
            </b-card>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            list: [],
            colors: ["primary", "secondary", "info", "success", "warning","danger"],
            loading: false,
            time: 0,
            per: 5,
            cur: 1,
        }
    },
    methods: {
        add(item){
            if(item){this.list.push(item); return}
            this.list.push({
                hash: Math.random()*100,
                plan: ["Free", "Basic"][~~(Math.random()*2)],
                usage: Math.random()*.01,
                timestamp: new Date((new Date(2012, 0, 1)).getTime() + Math.random() * ((new Date()).getTime() - (new Date(2012, 0, 1)).getTime()))
            })
        },
        remove(i){
            i = i ? i : ~~(Math.random() * this.list.length)
            this.list.splice(i,1)
        },
        async check(first){
            if(first){
                this.loading = true;
                await this.$store.dispatch("getTransactions")
                this.time = 0
                this.loading = false
                return
            }
            this.time++
            if(this.time >= 30){
                this.loading = true
                await this.$store.dispatch("getTransactions")
                this.time = 0
                this.loading = false
            }
        }
    },
    computed: {
        ready(){
            return !this.$store.state.ethereum.user
        },
        transactions() {
            return this.$store.state.transactions
        },
        rows(){
            return this.$store.state.transactions.length
        }
    },
    watch: {
        ready(){
            this.check(true)
            //setInterval(() => this.check(), 1000)
        },
        transactions(){
            for(let i = 0; i < this.transactions.length; i++){
                this.list.push(this.transactions[i])
            }
        }
    },

}
</script>