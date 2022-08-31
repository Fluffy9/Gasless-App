import Vue from 'vue'
import Vuex from 'vuex'
import ethereum from "./ethereum"
import up from "./UniversalProfile"
const { providers, Wallet, ethers, BigNumber } = require("ethers");
const UniversalProfileContract = require('@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json');
const KeyManagerContract = require('@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json');

Vue.use(Vuex)

let plans = [];

for(let i = 0; i < Number(process.env["VUE_APP_PLANS"]); i++){
  plans.push({
    name: process.env[`VUE_APP_PLAN_${i}_NAME`],
    price: process.env[`VUE_APP_PLAN_${i}_PRICE`],
    quota: process.env[`VUE_APP_PLAN_${i}_QUOTA`],
    baseURL: process.env[`VUE_APP_PLAN_${i}_BASEURL`],
    address: process.env[`VUE_APP_PLAN_${i}_LIMITER`],
    stripeURL: process.env[`VUE_APP_PLAN_${i}_CHECKOUT_URL`]
  })
}

let supportEmail = process.env['VUE_APP_SUPPORT_EMAIL']
export default new Vuex.Store({
  state: {
    plan: 0,
    plans: plans,
    quota: null,
    transactions: [],
    watchers: [],
    supportEmail: supportEmail
  },
  getters: {
  },
  mutations: {
    setQuota(state, payload){
      state.quota = payload
    },
    setTransactions(state, payload){
      state.transactions = payload
    },
    setPlan(state, payload){
      state.plan = payload
    }
  },
  actions: {
    async watch({state, dispatch, commit}){
      let filter = {
        address: state.plans.map(plan => plan.address),
        topics: [
          ethers.utils.id("execute(address,bytes,uint256,bytes)"),
          // ethers.utils.hexZeroPad(state.ethereum.user,32)
        ]
      }
      console.log(filter)
      state.ethereum.provider.on(filter, () => {
        console.log("New Transaction")
        dispatch("getQuota")
        dispatch("getTransactions")
      })
    },
    async getQuota({state, dispatch, commit}){
      let quotaData = state.plans.map(plan => (new ethers.Contract(plan.address, require("@/assets/ABI/GasLimiter.json"), state.ethereum.provider).quota(state.ethereum.user)))
      quotaData = await Promise.all(quotaData);
      // return the data of the highest plan that the user is registered for
      // we assume they have listed the plans in env from lowest => highest
      quotaData = quotaData.reverse()
      for(let i = 0; i < quotaData.length-1; i++){
        if(!BigNumber.from(0).eq(quotaData[i].timestamp)){
          let index = state.plans.length - (i+1) 
          let planData = await dispatch("getPlan", index)
          commit("setQuota", {
            name: state.plans[index].name,
            price: state.plans[index].price,
            quota: state.plans[index].quota,
            baseURL: state.plans[index].baseURL,
            address: state.plans[index].address,
            usage: state.plans[index].quota - ethers.utils.formatEther(quotaData[0].gas),
            timestamp: quotaData[i].timestamp,
            nextPeriod: planData.nextPeriod,
            cap: ethers.utils.formatEther(planData.limit)
          })
          commit("setPlan", index)
          return
        }
      }
      quotaData = quotaData.reverse()
      let planData = await dispatch("getPlan", 0)
      // in the case of the free plan, we need to consider the case where the user is not registered
      commit("setQuota", {
        name: state.plans[0].name,
        price: state.plans[0].price,
        quota: state.plans[0].quota,
        baseURL: state.plans[0].baseURL,
        address: state.plans[0].address,
        usage: BigNumber.from(0).eq(quotaData[0].timestamp) ? 0 : state.plans[0].quota - ethers.utils.formatEther(quotaData[0].gas),
        timestamp: quotaData[0].timestamp,
        nextPeriod: BigNumber.from(0).eq(quotaData[0].timestamp) ? BigNumber.from(0) : planData.nextPeriod,
        cap: ethers.utils.formatEther(planData.limit)
      })
    },
    async getPlan({state}, plan){
      let contract = new ethers.Contract(state.plans[plan].address, require("@/assets/ABI/GasLimiter.json"), state.ethereum.provider)
      let planData = [contract.nextPeriod(state.ethereum.user), contract.limit()]
      planData = await Promise.all(planData)
      return {nextPeriod: planData[0], limit: planData[1]}
    },

    async test({state}, {URL, controller, MAX}){
      let universalProfile = new ethers.Contract(state.ethereum.user, UniversalProfileContract.abi, state.ethereum.signer)
      let keyManager = await universalProfile.owner()
      keyManager = new ethers.Contract(keyManager, KeyManagerContract.abi, state.ethereum.signer)
      let payload = await universalProfile.populateTransaction.execute(
        0, // The OPERATION_CALL value. 0 for a LYX transaction
        state.ethereum.user, // Recipient address
        MAX ? ethers.constants.MaxUint256 : ethers.utils.parseEther("0"), // amount of LYX to send in wei
        '0x' // Call data, to be called on the recipient address, or '0x'
      );
      let nonce = await keyManager.getNonce(controller, 0)
      let chain = state.ethereum.supportedNetworks.filter(x => Object.keys(x) == state.ethereum.network)[0][state.ethereum.network]
      let message = ethers.utils.solidityKeccak256(["uint256", "address", "uint256", "bytes"], [chain, keyManager.address, BigNumber.from(nonce), payload.data])
      let signed = await window.ethereum.request({
        method: 'eth_sign',
        params: [state.ethereum.user, message],
      });
      console.log(signed)
      let signature = signed.signature
      let tx = await keyManager.populateTransaction.executeRelayCall(signature, nonce, payload.data)
      await state.ethereum.signer.estimateGas(tx)
      return fetch(URL, {
        method: "POST",
        body: JSON.stringify({ 
          address: universalProfile.address, 
          transaction: { 
            signature: signature, 
            nonce: nonce, 
            abi: payload.data
          }
        }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).then(res => { if(!res.ok) { throw new Error(res.statusText) } else {return res.json()}})
    },
    async getTransactions({state, commit}){
      if(!state.ethereum.provider){return}
      let block = await state.ethereum.provider.getBlock()
      let promises = []
      for(let i = 0; i < state.plans.length; i++){
        let plan = plans[i]
        promises[promises.length] = fetch(`https://explorer.execution.l16.lukso.network/api?module=logs&action=getLogs&fromBlock=0&toBlock=${block.number}&address=${plan.address}&topic0=${ethers.utils.id("Executed(address,address,uint256,uint256)")}&topic1=${ethers.utils.hexZeroPad(state.ethereum.user.toLowerCase(), 32)}&topic0_1_opr=and`).then(res => { if(!res.ok){ throw new Error(res.statusText)} else {return res.json()} })
      }
      let results = await Promise.allSettled(promises)
      results = results.filter(x => x.status == "fulfilled")
      results = results.filter(x => x.value.message == "OK")
      results = results.map(x => x.value.result)
      results = results.flat()
      results = results.map(x => {
        let [usage, nonce] = ethers.utils.defaultAbiCoder.decode(['uint256', 'uint256'], x.data)
        return {
          plan: plans.find(plan => plan.address.toLowerCase() == x.address.toLowerCase()).name,
          hash: x.transactionHash,
          usage: ethers.utils.formatEther(usage),
          timestamp: Number(x.timeStamp)*1000
        }
      })
      commit("setTransactions", results.reverse())
    }
  },
  modules: {
    ethereum: ethereum,
    up: up
  }
})
