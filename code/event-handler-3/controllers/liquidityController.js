//LIBRARIES
const Web3 = require('web3');

//ABIs
let abiSwap = require('../ABI/swap-abi.json')

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES
const {LiquidityService} = require('../services/liquidityService')

//QUERIES

//HELPERS

//LISTENERS
let listOfListener = {
    swap: {
        increaseLiquidity: undefined,
        decreaseLiquidity: undefined,
        transfer: undefined
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
    

    console.log('Initializing listeners liquidityController...')
    const web3wss = new Web3(new Web3.providers.WebsocketProvider("wss://go.getblock.io/e37352f1f62141fa8cf310202d0fc127", serverConfig.options))
    let swap = new web3wss.eth.Contract(abiSwap, "0xc36442b4a4522e871399cd717abdd847ab11fe88");
    
    // let swap = new serverConfig.chain.wssWeb3.eth.Contract(abiSwap, "0xc36442b4a4522e871399cd717abdd847ab11fe88");

    //<-----------------INCREASE LIQUIDITY-------------------->
    listOfListener.swap.increaseLiquidity = swap.events.IncreaseLiquidity()
    .on('data', LiquidityService.increaseLiquidityHandler)
    .on('change', LiquidityService.onChange)
    .on('error', LiquidityService.onError)

    //<-----------------DECREASE LIQUIDITY-------------------->

    // listOfListener.swap.decreaseLiquidity = swap.events.DecreaseLiquidity()  
    // .on('data', LiquidityService.decreaseLiquidityHandler)
    // .on('change', LiquidityService.onChange)
    // .on('error', LiquidityService.onError)

    //<-----------------TRANSFER-------------------->

    // listOfListener.swap.transfer = swap.events.Transfer()  
    // .on('data', LiquidityService.transferPositionHandler)
    // .on('change', LiquidityService.onChange)
    // .on('error', LiquidityService.onError)

    console.log('Initialized listeners liquidityController...')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();