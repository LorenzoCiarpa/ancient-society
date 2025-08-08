//LIBRARIES

//ABIs
const landsStakerAbi = require('../ABI/landStaker-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES

//QUERIES

//HELPERS

//MODELS
const StakerLand = require('../models/staking/landStakerModel');

//MODELS INITIALIZATION
let stakerLand = new StakerLand.StakerLand();

//LISTENERS
let listOfListener = {
    land: {
        stake: undefined,
        unstake: undefined
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
    console.log('Initializing listeners landStakingController....')

    var myLandStaker = new serverConfig.chain.wssWeb3.eth.Contract(landsStakerAbi, serverConfig.chain.contracts.STAKER_LAND_ADDRESS);
        
    listOfListener.land.stake = myLandStaker.events.NFTStaked()
    .on('data', stakerLand.stakeOnData)
    .on('change', stakerLand.stakeOnChange)
    .on('error', stakerLand.stakeOnError);

    listOfListener.land.unstake = myLandStaker.events.NFTUnstaked()
    .on('data', stakerLand.unstakeOnData)
    .on('change', stakerLand.unstakeOnChange)
    .on('error', stakerLand.unstakeOnError)

    console.log('Initialized listeners landStakingController....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();