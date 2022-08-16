
const server = process.env['VUE_APP_SERVER']
const IPFS_GATEWAY = 'https://2eff.lukso.dev/ipfs/';

const { ERC725 } = require('@erc725/erc725.js');
const erc725schema = require('@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json');
const { LSPFactory } = require('@lukso/lsp-factory.js');

const up = {
    namespaced: true,
    state: () => ({
        profile: null,
        address: null,
        loading: true,
    }),
    mutations: {
        setProfile(state, payload){
            state.profile = payload //markRaw(payload)
        },
        setAddress(state, payload){
            state.address = payload
        },
        setLoading(state, payload){
            state.loading = payload
        }
    },
    actions: {
        
        /*
        * Try fetching the @param's Universal Profile
        *
        * @param address of Universal Profile
        * @return string JSON or custom error
        */
        // async fetchProfile({ rootState, commit }) {
        //     commit('setLoading', true)
        //     let profile = new ERC725(erc725schema, rootState.ethereum.user, rootState.ethereum.provider, {ipfsGateway: IPFS_GATEWAY});
        //     commit('setProfile', await profile.fetchData())
        //     commit('setLoading', false)
        // },

        createUniversalProfile({ rootState, commit }, { up, onDeploy }) {
            return new Promise((resolve, reject) => {
                commit('setLoading', true)
                const lspFactory = new LSPFactory(window.ethereum, {
                    chainId: 1,
                });
                let deployedContracts = lspFactory.UniversalProfile.deploy({
                    controllerAddresses: [up.wallet],
                    lsp3Profile: {
                        name: up.username,
                        description: up.description,
                        tags: ['public-profile'],
                        profileImage: [up.profile.file],
                        backgroundImage: [up.background.file]
                    }
                }, {
                onDeployEvents: {
                        next: (deploymentEvent) => {
                            onDeploy(deploymentEvent)
                            console.log(deploymentEvent);
                        },
                        error: (error) => {
                            console.error(error);
                            reject(error)
                        },
                        complete: (contracts) => {
                            commit("setProfile", deployedContracts.LSP0ERC725Account)
                            commit("setAddress", deployedContracts.LSP0ERC725Account.address)
                            commit('setLoading', false)
                            console.log('Universal Profile deployment completed');
                            console.log(contracts);
                            resolve(contracts)
                        },
                    }
                })
            })
            
        },
        async updateProfile({ rootState, commit }, up){
            commit('setLoading', true)
            const lspFactory = new LSPFactory(window.ethereum, {
                chainId: Number(process.env['VUE_APP_CHAIN']),
            });
            const uploadResult = await lspFactory.UniversalProfile.uploadProfileData(
                jsonFile.LSP3Profile
            );
            const lsp3ProfileIPFSUrl = uploadResult.url;
            // 'ipfs://QmYCQTe5r5ZeVTbtpZMZXSQP2NxXdgJFVZb61Dk3gFP5VX'
        
            // Step 3.1 - Setup erc725.js
            const schema = [
                {
                    name: "LSP3Profile",
                    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
                    keyType: "Singleton",
                    valueContent: "JSONURL",
                    valueType: "bytes",
                },
            ];
            
            const erc725 = new ERC725(schema, profileAddress, web3.currentProvider, {
                ipfsGateway: "https://cloudflare-ipfs.com/ipfs/",
            });
            
            // Step 3.2 - Encode the LSP3Profile data (to be written on our UP)
            const encodedData = erc725.encodeData({
                keyName: "LSP3Profile",
                value: {
                    hashFunction: "keccak256(utf8)",
                    // hash our LSP3 metadata JSON file
                    hash: web3.utils.keccak256(JSON.stringify(jsonFile)),
                    url: lsp3ProfileIPFSUrl,
                },
            });
            
            // Step 4.1 - Load our EOA
            const myEOA = web3.eth.accounts.wallet.add(PRIVATE_KEY);
            console.log('EOA:', myEOA.address);
        
            // Step 4.2 - Create instances of our Contracts
            const universalProfileContract = new web3.eth.Contract(UniversalProfile.abi, profileAddress);
            const keyManagerAddress = await universalProfileContract.methods.owner().call();
            const keyManagerContract = new web3.eth.Contract(KeyManager.abi, keyManagerAddress);
            
            // Step 4.3 - Set data (updated LSP3Profile metadata) on our Universal Profile
        
            // encode the setData payload
            const abiPayload = await universalProfileContract.methods["setData(bytes32[],bytes[])"](encodedData.keys, encodedData.values).encodeABI();
            
            // execute via the KeyManager, passing the UP payload
            await keyManagerContract.methods.execute(abiPayload).send({ from: myEOA.address, gasLimit: 300_000 });    
            commit('setLoading', false)
        
        },
        stopLoading({commit}){
            commit('setLoading', false)
        }
  
    },
    getters: {

    }
}
export default up