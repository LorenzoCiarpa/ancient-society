//LIBRARIES
const Web3 = require('web3');

//ABIs
const BrokenMarketAbi = require('../ABI/omega-marketplace-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES
const {BrokenMarketService} = require('../services/brokenMarketService');

//MODELS

//MODELS INITIALIZATION

//LISTENERS
let listOfListener = {
    market: {
        purchase: undefined,
        purchaseEth: undefined
    },
}
  

const initListeners = () => {
    for(let listenerProp in listOfListener){
        let listener = listOfListener[listenerProp];

        for(let eventListenerProp in listener){
            let eventListener = listener[eventListenerProp];
            
            if(eventListener != undefined) eventListener.unsubscribe();
        }
    }
    

    console.log('Initializing listeners market....')

    // var brokenMarket = new serverConfig.chain.wssWeb3.eth.Contract(BrokenMarketAbi, serverConfig.chain.contracts.ANCIENT_ALPHA_MARKETPLACE_V1);    
    // var brokenMarketEth = new serverConfig.staticChain.chain.alpha.ethereum.wssWeb3.eth.Contract(BrokenMarketAbi, serverConfig.chain.contracts.ANCIENT_ALPHA_MARKETPLACE_V1_ETH);

    const web3wss = new Web3(new Web3.providers.WebsocketProvider("wss://go.getblock.io/e37352f1f62141fa8cf310202d0fc127", serverConfig.options))
    const web3wssEth = new Web3(new Web3.providers.WebsocketProvider("wss://go.getblock.io/7457b34bb4da44cd991a0bbed58533c7", serverConfig.options))

    const brokenMarket = new web3wss.eth.Contract(BrokenMarketAbi, '0x2946cC63fcd9bAe04564b00609800CC821b06292');
    const brokenMarketEth = new web3wssEth.eth.Contract(BrokenMarketAbi, '0x77C6DA1916F16488Ce1a22ef5FF3812a559BF3BA');


    //<-----------------PURCHASE-------------------->
    listOfListener.market.purchaseEth = brokenMarketEth.events.Purchase()
    .on('data', BrokenMarketService.purchaseHandler)
    .on('change', (event) => { console.log(event) })
    .on('error', (event) => { console.log(event) })

    listOfListener.market.purchase = brokenMarket.events.Purchase()
    .on('data', BrokenMarketService.purchaseHandler)
    .on('change', (event) => { console.log(event) })
    .on('error', (event) => { console.log(event) })


    console.log('Initialized listeners market....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();




