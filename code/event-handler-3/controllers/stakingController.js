//LIBRARIES

//ABIs
const stakerAbi = require('../ABI/staker-abi.json');
const stakerMinerAbi = require('../ABI/staker-miner-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES

//QUERIES

//HELPERS

//MODELS
const StakerModel = require('../models/staking/stakerModel');
const StakerTownhall = require('../models/staking/thStakerModel');
const StakerLumberjack = require('../models/staking/ljStakerModel');
const StakerStonemine = require('../models/staking/smStakerModel');
const StakerFisherman = require('../models/staking/fmStakerModel');
const StakerMiner = require('../models/staking/mnStakerModel');
const StakerFarmer = require('../models/staking/frStakerModel');

//MODELS INITIALIZATION
let stakerTh = new StakerTownhall.StakerTownhall();
let stakerLj = new StakerLumberjack.StakerLumberjack();
let stakerSm = new StakerStonemine.StakerStonemine();
let stakerFm = new StakerFisherman.StakerFisherman();
let stakerMn = new StakerMiner.StakerMiner();
let stakerFr = new StakerFarmer.StakerFarmer();

//LISTENERS
let listOfListener = {
    townhall: {
        stake: undefined,
        unstake: undefined
    },

    townhallNew: {
        stake: undefined,
        unstake: undefined
    },


    lumberjack: {
        stake: undefined,
        unstake: undefined
    },

    lumberjackNew: {
        stake: undefined,
        unstake: undefined
    },

    stonemine: {
        stake: undefined,
        unstake: undefined
    },

    stonemineNew: {
        stake: undefined,
        unstake: undefined
    },

    fisherman: {
        stake: undefined,
        unstake: undefined
    },

    fishermanNew: {
        stake: undefined,
        unstake: undefined
    },

    miner: {
        stake: undefined,
        unstake: undefined
    },

    minerNew: {
        stake: undefined,
        unstake: undefined
    },

    farmerNew: {
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
    
    console.log('Initializing listeners stakingController....')

    var myContractStakerTh = new serverConfig.chain.wssWeb3.eth.Contract(stakerAbi, serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS_OLD);
    var myContractStakerThNew = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_TOWNHALL_ADDRESS);
    var myContractStakerLj = new serverConfig.chain.wssWeb3.eth.Contract(stakerAbi, serverConfig.chain.contracts.STAKER_LUMBERJACK_ADDRESS_OLD);
    var myContractStakerLjNew = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_LUMBERJACK_ADDRESS);
    var myContractStakerSm = new serverConfig.chain.wssWeb3.eth.Contract(stakerAbi, serverConfig.chain.contracts.STAKER_STONEMINE_ADDRESS_OLD);
    var myContractStakerSmNew = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_STONEMINE_ADDRESS);
    var myContractStakerFm = new serverConfig.chain.wssWeb3.eth.Contract(stakerAbi, serverConfig.chain.contracts.STAKER_FISHERMAN_ADDRESS_OLD);
    var myContractStakerFmNew = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_FISHERMAN_ADDRESS);
    var myContractStakerMn = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_MINER_ADDRESS_OLD);
    var myContractStakerMnNew = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_MINER_ADDRESS);
    var myContractStakerFrNew = new serverConfig.chain.wssWeb3.eth.Contract(stakerMinerAbi, serverConfig.chain.contracts.STAKER_FARMER_ADDRESS);

    //<--------------STAKER TOWNHALL------------------>
    listOfListener.townhall.stake = myContractStakerTh.events.NFTStaked()
    .on('data', stakerTh.stakeOnData)
    .on('change', stakerTh.stakeOnChange)
    .on('error', stakerTh.stakeOnError);

    listOfListener.townhall.unstake = myContractStakerTh.events.NFTUnstaked()
    .on('data', stakerTh.unstakeOnData)
    .on('change', stakerTh.unstakeOnChange)
    .on('error', stakerTh.unstakeOnError);

    //<--------------STAKER TOWNHALL NEW------------------>
    listOfListener.townhallNew.stake = myContractStakerThNew.events.NFTStaked()
    .on('data', stakerTh.stakeOnDataNew)
    .on('change', stakerTh.stakeOnChange)
    .on('error', stakerTh.stakeOnError);

    listOfListener.townhallNew.unstake = myContractStakerThNew.events.NFTUnstaked()
    .on('data', stakerTh.unstakeOnDataNew)
    .on('change', stakerTh.unstakeOnChange)
    .on('error', stakerTh.unstakeOnError);

    //<--------------STAKER LUMBERJACK------------------>
    listOfListener.lumberjack.stake = myContractStakerLj.events.NFTStaked()
    .on('data', stakerLj.stakeOnData)
    .on('change', stakerLj.stakeOnChange)
    .on('error', stakerLj.stakeOnError);

    listOfListener.lumberjack.unstake = myContractStakerLj.events.NFTUnstaked()
    .on('data', stakerLj.unstakeOnData)
    .on('change', stakerLj.unstakeOnChange)
    .on('error', stakerLj.unstakeOnError);

    //<--------------STAKER LUMBERJACK NEW------------------>
    listOfListener.lumberjackNew.stake = myContractStakerLjNew.events.NFTStaked()
    .on('data', stakerLj.stakeOnDataNew)
    .on('change', stakerLj.stakeOnChange)
    .on('error', stakerLj.stakeOnError);

    listOfListener.lumberjackNew.unstake = myContractStakerLjNew.events.NFTUnstaked()
    .on('data', stakerLj.unstakeOnDataNew)
    .on('change', stakerLj.unstakeOnChange)
    .on('error', stakerLj.unstakeOnError);


    //<--------------STAKER STONEMINE------------------>
    listOfListener.stonemine.stake = myContractStakerSm.events.NFTStaked()
    .on('data', stakerSm.stakeOnData)
    .on('change', stakerSm.stakeOnChange)
    .on('error', stakerSm.stakeOnError);

    listOfListener.stonemine.unstake = myContractStakerSm.events.NFTUnstaked()
    .on('data', stakerSm.unstakeOnData)
    .on('change', stakerSm.unstakeOnChange)
    .on('error', stakerSm.unstakeOnError);

    //<--------------STAKER STONEMINE NEW------------------>
    listOfListener.stonemineNew.stake = myContractStakerSmNew.events.NFTStaked()
    .on('data', stakerSm.stakeOnDataNew)
    .on('change', stakerSm.stakeOnChange)
    .on('error', stakerSm.stakeOnError);

    listOfListener.stonemineNew.unstake = myContractStakerSmNew.events.NFTUnstaked()
    .on('data', stakerSm.unstakeOnDataNew)
    .on('change', stakerSm.unstakeOnChange)
    .on('error', stakerSm.unstakeOnError);

    //<--------------STAKER FISHERMAN------------------>
    listOfListener.fisherman.stake = myContractStakerFm.events.NFTStaked()
    .on('data', stakerFm.stakeOnData)
    .on('change', stakerFm.stakeOnChange)
    .on('error', stakerFm.stakeOnError);

    listOfListener.fisherman.unstake = myContractStakerFm.events.NFTUnstaked()
    .on('data', stakerFm.unstakeOnData)
    .on('change', stakerFm.unstakeOnChange)
    .on('error', stakerFm.unstakeOnError);

    //<--------------STAKER FISHERMAN NEW------------------>
    listOfListener.fishermanNew.stake = myContractStakerFmNew.events.NFTStaked()
    .on('data', stakerFm.stakeOnDataNew)
    .on('change', stakerFm.stakeOnChange)
    .on('error', stakerFm.stakeOnError);

    listOfListener.fishermanNew.unstake = myContractStakerFmNew.events.NFTUnstaked()
    .on('data', stakerFm.unstakeOnDataNew)
    .on('change', stakerFm.unstakeOnChange)
    .on('error', stakerFm.unstakeOnError);

    //<--------------STAKER MINER------------------>
    listOfListener.miner.stake = myContractStakerMn.events.NFTStaked()
    .on('data', stakerMn.stakeOnData)
    .on('change', stakerMn.stakeOnChange)
    .on('error', stakerMn.stakeOnError);

    listOfListener.miner.unstake = myContractStakerMn.events.NFTUnstaked()
    .on('data', stakerMn.unstakeOnData)
    .on('change', stakerMn.unstakeOnChange)
    .on('error', stakerMn.unstakeOnError);

    //<--------------STAKER MINER NEW------------------>
    listOfListener.minerNew.stake = myContractStakerMnNew.events.NFTStaked()
    .on('data', stakerMn.stakeOnDataNew)
    .on('change', stakerMn.stakeOnChange)
    .on('error', stakerMn.stakeOnError);

    listOfListener.minerNew.unstake = myContractStakerMnNew.events.NFTUnstaked()
    .on('data', stakerMn.unstakeOnDataNew)
    .on('change', stakerMn.unstakeOnChange)
    .on('error', stakerMn.unstakeOnError);


    //<--------------STAKER FARMER NEW------------------>
    listOfListener.farmerNew.stake = myContractStakerFrNew.events.NFTStaked()
    .on('data', stakerFr.stakeOnDataNew)
    .on('change', stakerFr.stakeOnChange)
    .on('error', stakerFr.stakeOnError);

    listOfListener.farmerNew.unstake = myContractStakerFrNew.events.NFTUnstaked()
    .on('data', stakerFr.unstakeOnDataNew)
    .on('change', stakerFr.unstakeOnChange)
    .on('error', stakerFr.unstakeOnError);


    console.log('Initialized listeners stakingController....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();