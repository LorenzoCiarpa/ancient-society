import './game-miner.scss';
import '../../json-mockup';

import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';

import gameComponentContentBorder
  from '../../assets-ui/game-component/content-border.png';
import gameComponentFooterBack
  from '../../assets-ui/game-component/footer-back.png';
import gameComponentFooterMark
  from '../../assets-ui/game-component/footer-mark.png';
import gameComponentHeaderBack
  from '../../assets-ui/game-component/header-back.png';
import gameComponentHeaderBorder1
  from '../../assets-ui/game-component/header-border-1.png';
import gameComponentHeaderBorder2
  from '../../assets-ui/game-component/header-border-2.png';
import BonusBar from '../../components-game/bonus/BonusBar';
import BonusView from '../../components-game/bonus/BonusView';
// import toolRepairingGif from '../../assets-game/toolRepairing.gif';
// import toolUpgradingGif from '../../assets-game/toolUpgrading.gif';
import { playSound } from '../../utils/sounds';
import {
  getRemainingTime_InMinute,
  msToTime,
} from '../../utils/utils';

const ANCIEN_IMAGE = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/ancien.webp'

const classNameForComponent = 'game-miner' // ex: game-inventory
const componentTitle = 'Mine' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GameMiner(props) {
    // Tab
    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        playSound('tab')
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    // delegation data
    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
    const [delegationData, setDelegationData] = useState(props.delegationData)
    useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])

    // colony data
    const [idColony, setIdColony] = useState(props.idColony)
    useEffect(() => { setIdColony(props.idColony) }, [props.idColony])
    const [colonyData, setColonyData] = useState(props.colonyData)
    useEffect(() => { setColonyData(props.colonyData) }, [props.colonyData])

    // Data
    const [onLoading, setOnLoading] = useState(true)
    const [caves, setCaves] = useState([])
    const [caveIndex, setCaveIndex] = useState(0);
    const [axes, setAxes] = useState([])
    const [currentInventory, setCurrentInventory] = useState({})
    const [minerIsMining, setMinerIsMining] = useState(false)
    const [passiveInfo, setPassiveInfo] = useState({})

    useEffect(() => {
        axios.post('/api/m1/miner/getMiner', {
            address: props.metamask.walletAccount,
            idDelegate: idDelegate,
            idColony: idColony,
        })
            .then(response => {
                const minerResponse = response.data.data.minerResponse
                console.log(minerResponse)
                updateState(minerResponse)
                setOnLoading(false)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
    }, [])

    const showCaveInfoHandler = (sIndex) => {
        playSound('popup')
        setOpenConfirmType('info')
        setCaveIndex(sIndex)
    }

    // equippedAxe
    const [currentAxe, setCurrentAxe] = useState({})
    useEffect(() => {
        for (var i = 0; i < axes.length; ++i) {
            if (axes[i].status == 'equipped') {
                setCurrentAxe(axes[i])
                break
            }
        }
    }, [axes])

    // ChangeAxe Button/Popup
    const onChangeAxeClick = (e) => {
        playSound('button')
        // playSound('popup')
        setOpenConfirmType('change')
    }

    const [selectedAxe, setSelectedAxe] = useState(null)
    const onAxeMenuClick = (axe) => {
        setSelectedAxe(axe)
        setOpenConfirmType('changeConfirm')
        playSound('touch')
    }

    const onAxeChange = () => {
        const axe = JSON.parse(JSON.stringify(selectedAxe))
        playSound('touch')
        onCloseConfirmModal()
        setDoingAction(true)
        setConfirmActionType('change')
        if (axe.status == 'equipped') {
            axios.post('/api/m1/miner/unEquipAxe', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idToolInstance: axe.id
            })
                .then(response => {
                    if (response.data.success) {
                        const res = response.data.data
                        clearInterval(axeEndingTimer)
                        setAxeEndingTime(null)
                        setAxeRemainingTime(null)
                        var newAxes = JSON.parse(JSON.stringify(axes))
                        for (var i = 0; i < newAxes.length; ++i) {
                            if (newAxes[i].status == 'equipped') {
                                newAxes[i].status = 'available'
                                break
                            }
                        }
                        setAxes(newAxes)
                        setCaves(res.caves)
                        setCurrentAxe({})
                        setCurrentInventory({})
                    }
                    setDoingAction(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else {
            axios.post('/api/m1/miner/changeAxe', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idToolInstance: axe.id
            })
                .then(response => {
                    if (response.data.success) {
                        const res = response.data.data
                        if (!res.axe.isMining) {
                            clearInterval(axeEndingTimer)
                            setAxeEndingTime(null)
                            setAxeRemainingTime(null)
                        } else {
                            setAxeEndingTime(res.axe.axeEndingTime)
                        }
                        var newAxes = JSON.parse(JSON.stringify(axes))
                        for (var i = 0; i < newAxes.length; ++i) {
                            if (newAxes[i].status == 'equipped') {
                                newAxes[i].status = 'available'
                            } else if (newAxes[i].id == axe.id) {
                                for (var x in res.axe) {
                                    newAxes[i][x] = res.axe[x]
                                }
                            }
                        }
                        setAxes(newAxes)
                        setCaves(res.caves)
                        setCurrentInventory(res.equippedAxeInstanceData)
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: res.passiveInfo.maxPerformableActions })
                    }
                    setDoingAction(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }

    // FISHING ENDING TIME
    const [miningEndingTime, setMiningEndingTime] = useState(null)
    const [miningRemainingTime, setMiningRemainingTime] = useState(null)
    const [miningEndingTimer, setMiningEndingTimer] = useState(null)
    const [axeEndingTime, setAxeEndingTime] = useState(null)
    const [axeRemainingTime, setAxeRemainingTime] = useState(null)
    const [axeEndingTimer, setAxeEndingTimer] = useState(null)
    const [inCooldown, setInCooldown] = useState(false)

    const [nextStoreTimer, setNextStoreTimer] = useState(null)
    const [nextStoreTime, setNextStoreTime] = useState(null)
    const [nextStoreRemainingTime, setNextStoreRemainingTime] = useState(null)
    useEffect(() => {
        if (!nextStoreTime) return
        clearInterval(nextStoreTimer)
        setNextStoreTimer(setInterval(() => {
            setNextStoreRemainingTime(getRemainingTime_InMinute(nextStoreTime))
        }, 1000))
    }, [nextStoreTime])

    useEffect(() => {
        if (nextStoreRemainingTime < 0) {
            clearInterval(nextStoreTimer)
            setOnLoading(true)
            axios.post('/api/m1/miner/getMiner', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
            })
                .then(response => {
                    const minerResponse = response.data.data.minerResponse
                    console.log(minerResponse)
                    updateState(minerResponse)
                    setOnLoading(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }, [nextStoreRemainingTime])

    useEffect(() => {
        if (!miningEndingTime) return
        clearInterval(miningEndingTimer)
        setMiningEndingTimer(setInterval(() => {
            setMiningRemainingTime(getRemainingTime_InMinute(miningEndingTime))
        }, 1000))
    }, [miningEndingTime])

    useEffect(() => {
        if (!axeEndingTime) return
        clearInterval(axeEndingTimer)
        setAxeEndingTimer(setInterval(() => {
            setAxeRemainingTime(getRemainingTime_InMinute(axeEndingTime))
        }, 1000))
    }, [axeEndingTime])

    useEffect(() => {
        if (miningRemainingTime < 0) clearInterval(miningEndingTimer)
        if (axeRemainingTime < 0) clearInterval(axeEndingTimer)
        if (axeRemainingTime < 0 && miningRemainingTime < 0) setInCooldown(false)
        if (axeRemainingTime > 0 || miningRemainingTime > 0) setInCooldown(true)

    }, [miningRemainingTime, axeRemainingTime])

    useEffect(() => {
        console.log("coolDown: ", inCooldown)

    }, [inCooldown])

    useEffect(() => {
        console.log("currentInventory: ", currentInventory)

    }, [currentInventory])

    // RepairAxe Button/Dialog  
    const onRepairAxeClick = () => {
        playSound('button')
        setOpenConfirmType('repair')
    }

    // UpgradeAxe Button/Dialog  
    const onUpgradeAxeClick = () => {
        playSound('button')
        //setOpenConfirmType('upgrade')
    }

    // Inventory Button
    const onInventoryClick = (e) => {
        playSound('button')
        props.navbarCallback_showComponent('craft-inventory', { id: currentInventory.id })
    }

    // DO FISH
    const [doingAction, setDoingAction] = useState(false)
    const [miningCave, setMiningCave] = useState(null)

    const onMineClick = (cave) => {
        // playSound('button')
        playSound('confirm')
        setOpenConfirmType('mine');
        setMiningCave(cave)
    }

    const onActionBtnClick = (actionType) => {
        playSound('button')
        playSound('confirm')
        onCloseConfirmModal()
        setConfirmActionType(actionType)
        if (actionType == 'repair') {
            setDoingAction(true);
            axios.post('/api/m1/miner/repairAxe', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idToolInstance: currentInventory.id,
                consumableIds: [repairConsumables[0].id, repairConsumables[1].id],
                buildingType: 5,
            })
                .then(response => {
                    console.log('repairAxe', response.data.data)
                    onResetConsumables()
                    if (response.data.success) {
                        props.callback_setInventory(response.data.data.storage)
                        updateInventoryData(response)
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: response.data.data.maxPerformableActions })
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => console.log(error))
        }
    }

    const updateInventoryData = (response) => {
        if (response.data.success && response.data.data.inventory != undefined) {
            const inventory = response.data.data.inventory
            for (var i = 0; i < inventory.length; ++i) {
                const elements = inventory[i].elements
                for (var j = 0; j < elements.length; ++j) {
                    const action = inventory[i].action, element = elements[j]
                    if (action == 'edit' && element.type == 'tool' && element.id == currentInventory.id) {
                        setCurrentInventory(element)
                        setAxes(axes.map((axe) => (axe.id == element.id ? { ...axe, level: element.level, rarity: element.level, durability: element.durability } : axe)))
                        break
                    }
                }
            }
        }
    }

    const onCloseConfirmModal = () => {
        setOpenConfirmType('')
        setActionRes(null)
    }

    const updateState = (minerResponse) => {
        setPassiveInfo(minerResponse.passiveInfo)
        setHasConsumables(minerResponse.hasConsumables)
        setConsumables(minerResponse.consumables)
        setCaves(minerResponse.caves)
        setAxes(minerResponse.axes)
        setMinerIsMining(minerResponse.minerIsMining)
        setCurrentInventory(minerResponse.equippedAxeInstanceData)
        minerResponse.minerEndingTime ? setMiningEndingTime(minerResponse.minerEndingTime) : null
        minerResponse.axeEndingTime ? setAxeEndingTime(minerResponse.axeEndingTime) : null
        minerResponse.passiveInfo.nextStoreTime ? setNextStoreTime(minerResponse.passiveInfo.nextStoreTime) : null
    }

    const onPassiveAction = () => {
        const confirmType = openConfirmType
        onCloseConfirmModal()
        setConfirmActionType(confirmType)
        setDoingAction(true)
        if (confirmType == 'unlock' || confirmType == 'passive') {
            axios.post('/api/m1/buildings/setPassiveOn', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                pkBuilding: 1,
                buildingType: 5,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            if (response.data.data.storage) {
                                props.callback_setInventory(response.data.data.storage)
                            }
                            updateState(response.data.data.minerResponse)
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmType == 'active') {
            axios.post('/api/m1/buildings/setPassiveOff', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                pkBuilding: 1,
                buildingType: 5,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            let minerRes = response.data.data.minerResponse;

                            setPassiveInfo(minerRes.passiveInfo)
                            minerRes.passiveInfo.nextStoreTime ? setNextStoreTime(minerRes.passiveInfo.nextStoreTime) : null
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmType == 'passiveUpgrade') {
            axios.post('/api/m1/buildings/upgradePassive', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                pkBuilding: 1,
                buildingType: 5,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            if (response.data.data.storage) {
                                props.callback_setInventory(response.data.data.storage)
                            }
                            updateState(response.data.data.minerResponse)
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmType == 'burn') {
            axios.post('/api/m1/miner/burnPassiveTNT', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                burnTNTCount: burnTNTCount
            })
                .then(response => {
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            setBurnTNTCount(0)
                            let editInfo = response.data.data.passiveInfo
                            console.log(editInfo)
                            setPassiveInfo({ ...passiveInfo, maxPerformableActions: editInfo.maxPerformableActions, tntData: editInfo.tntData, burntActions: editInfo.burntActions })
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }

    const onDoAction = () => {
        onCloseConfirmModal()
        if ((passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0)) {
            return
        }
        setDoingAction(true)
        setConfirmActionType('mine');
        if (passiveInfo.isPassive) {
            axios.post('/api/m1/miner/startPassiveMining', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idCave: miningCave.id,
                consumableIds: [null, null, null],
                actionNumber: passiveInfo.maxPerformableActions
            })
                .then(response => {
                    onResetConsumables()
                    console.log('startPassiveMining response', response.data)
                    if (response.data.success) {
                        if (response.data.data.storage) {
                            props.callback_setInventory(response.data.data.storage)
                        }
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: response.data.data.passiveInfo.maxPerformableActions, burntActions: response.data.data.passiveInfo.burntActions, storedActions: response.data.data.passiveInfo.storedActions })
                        setAxes(axes.map((axe) => (axe.id == currentAxe.id ? { ...axe, isMining: true, durability: response.data.data.axe.durability } : axe)))
                        setCaves(response.data.data.caves)
                        setMiningEndingTime(response.data.data.miningEndingTime)
                        setAxeEndingTime(response.data.data.axeEndingTime)
                        setHasConsumables(response.data.data.hasConsumables)
                        setConsumables(response.data.data.consumables)
                        setCurrentInventory(response.data.data.equippedAxeInstanceData)
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else {
            axios.post('/api/m1/miner/startMining', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idCave: miningCave.id,
                consumableIds: [mineConsumables[0].id, mineConsumables[1].id, mineConsumables[2].id]
            })
                .then(response => {
                    onResetConsumables()
                    console.log('startMining response', response.data)
                    if (response.data.success) {
                        setAxes(axes.map((axe) => (axe.id == currentAxe.id ? { ...axe, isMining: true, durability: response.data.data.axe.durability } : axe)))
                        setCaves(response.data.data.caves)
                        setMiningEndingTime(response.data.data.miningEndingTime)
                        setAxeEndingTime(response.data.data.axeEndingTime)
                        setHasConsumables(response.data.data.hasConsumables)
                        setConsumables(response.data.data.consumables)
                        setCurrentInventory(response.data.data.equippedAxeInstanceData)
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    console.log(error)
                    // error.response.status == 500 && props.callback_Logout()
                    // error.response.status == 401 && props.callback_Logout()
                })
        }
    }

    const [openConfirmType, setOpenConfirmType] = useState('');
    const [confirmActionType, setConfirmActionType] = useState(null)
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)

    const onUnLockBtnClick = () => {
        playSound('button')
        setOpenConfirmType('unlock')
    }
    const onPassiveBtnClick = () => {
        playSound('button')
        setOpenConfirmType('passive')
    }
    const onPassiveUpgradeBtnClick = () => {
        playSound('button')
        setOpenConfirmType('passiveUpgrade')
    }
    const onActiveBtnClick = () => {
        playSound('button')
        setOpenConfirmType('active')
    }

    const [burnTNTCount, setBurnTNTCount] = useState(0)
    const onBurnTNTBtnClick = () => {
        playSound('button')
        setOpenConfirmType('burn')
    }

    const onDidAction = (response) => {
        playSound('confirm')
        setActionRes(response)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setConfirmActionType(null)
        setActionResModalOpen(false)
    }

    const [consumableOpen, setConsumableOpen] = useState('')
    const [consumableAnchorEl, setConsumableAnchorEL] = useState(null)

    const onConsumableBtnClick = (e, type) => {
        setConsumableAnchorEL(e.currentTarget)
        setConsumableOpen(type)
    }

    const onCloseConsumable = () => {
        setConsumableOpen('')
    }

    const [hasConsumables, setHasConsumables] = useState(false)
    const [consumables, setConsumables] = useState([])
    const [mineConsumables, setMineConsumables] = useState([{}, {}, {}])
    const [repairConsumables, setRepairConsumables] = useState([{}, {}])
    const [upgradeConsumables, setUpgradeConsumables] = useState([{}, {}])

    const onResetConsumables = (consumType = '') => {
        if (consumType == '') {
            setRepairConsumables([{}, {}])
            setUpgradeConsumables([{}, {}])
            setMineConsumables([{}, {}, {}])
        } else if (consumType == 'mine') {
            setMineConsumables([{}, {}, {}])
        } else if (consumType == 'repair') {
            setRepairConsumables([{}, {}])
        } else if (consumType == 'upgrade') {
            setUpgradeConsumables([{}, {}])
        }
    }

    const onConsumableClick = (consumType, pconsumable) => {
        onCloseConsumable()
        if (consumType == 'mine1') {
            setMineConsumables(mineConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'mine2') {
            setMineConsumables(mineConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        } else if (consumType == 'mine3') {
            setMineConsumables(mineConsumables.map((consumable, index) => (index == 2 ? pconsumable : consumable)))
        } else if (consumType == 'repair1') {
            setRepairConsumables(repairConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'repair2') {
            setRepairConsumables(repairConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        } else if (consumType == 'upgrade1') {
            setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'upgrade2') {
            setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        }
    }

    const [openedActionPanel, setOpenedActionPanel] = useState(false)
    const onActionPanelChange = () => {
        setOpenedActionPanel(!openedActionPanel);
    }

    const [passivePanelOpen, setPassivePanelOpen] = useState(false)
    const onPassivePanelChange = () => {
        setPassivePanelOpen(!passivePanelOpen);
    }

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <img className='gameComponentHeaderBack' src={gameComponentHeaderBack} alt='game-component-header-back'></img>
                    <img className='gameComponentHeaderBorder1' src={gameComponentHeaderBorder1} alt='game-component-header-border1'></img>
                    <img className='gameComponentHeaderBorder2' src={gameComponentHeaderBorder2} alt='game-component-header-border2'></img>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    <img className='gameComponentContentBorder' src={gameComponentContentBorder} alt='game-component-content-border'></img>
                    {(onLoading || doingAction) &&
                        <div className='api-loading'>
                            {/* confirmActionType == 'mine' ? <>
                        <img className='apiCallingGif' src={miningGif} />
                    </> : confirmActionType == 'repair' ? <>
                        <img className='apiCallingGif' src={toolRepairingGif} />
                    </> : confirmActionType == 'upgrade' ? <>
                        <img className='apiCallingGif' src={toolUpgradingGif} />
                    </> : confirmActionType == 'change' ? <>
                        <img className='apiCallingGif' src={changingGif} />
                    </> :  */<span className='apiCallLoading'></span>}
                            <span className={'loader ' + confirmActionType + '-loader'}></span>
                        </div>}
                    <div className='scroll-content'>
                        {!onLoading &&
                            <div className='page-content'>
                                <div className='mine-info'>
                                    <div className='passive-panel'>
                                        <Accordion
                                            expanded={passivePanelOpen}
                                            onChange={() => onPassivePanelChange()}
                                        >
                                            <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                                                <div className='setting-accordion-summary'>
                                                    <span>Passive Mode</span>
                                                    <span className={passiveInfo.locked ? 'locked' : 'unlocked'}>{passiveInfo.locked ? <><LockOutlinedIcon />Locked</> : <><LockOpenOutlinedIcon />Unlocked</>}
                                                    </span>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className='details'>
                                                {passiveInfo.locked ? <>
                                                    <div className='actions'>
                                                        <span className='unlockDesc'>In passive mode, you can store mining actions and do them at once.</span>
                                                        <Button className={'actionBtn unLockBtn' + (!passiveInfo.isUnlockAble ? ' notAllowed' : '')} onClick={onUnLockBtnClick} variant="outlined" endIcon={<LockOpenOutlinedIcon />}>
                                                            Unlock
                                                        </Button>
                                                    </div>
                                                    <div className='cost-list'>
                                                        {passiveInfo.unlockRequirements.length == 0 &&
                                                            <div className='noRequirementsText'>No Unlock requirements</div>}
                                                        {passiveInfo.unlockRequirements.map((requirement, index) => (
                                                            <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                                <div className='costDesc'>
                                                                    <span className='costQuantity'>x {requirement.quantity}</span>
                                                                    <span className='costName'>{requirement.name}</span>
                                                                </div>
                                                                <img className='costImg' src={requirement.image} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </> : <>
                                                    <div className='actions'>
                                                        <div className='passive-info'>
                                                            <span className='passive-level'>Lvl : <b>+{passiveInfo.passiveLevel}{/* {passiveInfo.upgradeInfo.isUpgradable ? ` (-> +${passiveInfo.upgradeInfo.passiveLevel})` : ''} */}</b></span>
                                                            <span className='passive-miningCoolDown'>Store CD : <b>{passiveInfo.miningCoolDown}{/* {passiveInfo.upgradeInfo.isUpgradable ? ` (-> ${passiveInfo.upgradeInfo.miningCoolDown})` : ''} */}</b> mins</span>
                                                        </div>
                                                        {passiveInfo.upgradeInfo.isUpgradable ?
                                                            <Button className={'actionBtn passiveUpgradeBtn' + (!passiveInfo.upgradeInfo.upgradeAllowed ? ' notAllowed' : '')} onClick={onPassiveUpgradeBtnClick} variant="outlined" endIcon={<UpgradeIcon />}>
                                                                Upgrade
                                                            </Button> :
                                                            <div className='notAllowedText'>At Max Level</div>}
                                                    </div>
                                                    {passiveInfo.upgradeInfo.isUpgradable ?
                                                        <div className='cost-list'>
                                                            {passiveInfo.upgradeInfo.upgradeRequirements.length == 0 &&
                                                                <div className='noRequirementsText'>No Upgrade requirements</div>}
                                                            {passiveInfo.upgradeInfo.upgradeRequirements.map((requirement, index) => (
                                                                <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                                    <div className='costDesc'>
                                                                        <span className='costQuantity'>x {requirement.quantity}</span>
                                                                        <span className='costName'>{requirement.name}</span>
                                                                    </div>
                                                                    <img className='costImg' src={requirement.image} />
                                                                </div>
                                                            ))}
                                                        </div> : <div className='space'></div>}
                                                    <div className='actions' style={{ borderTop: '1px solid #3c3c3c', padding: '10px 0px 5px 0px' }}>
                                                        <div className='passiveSwitchText'>
                                                            Set Passive On/Off
                                                        </div>
                                                        <div className='passiveSwitchActions'>
                                                            <IconButton className={'iconBtn passiveBtn' + (passiveInfo.isPassive ? ' notAllowed' : '')} onClick={onPassiveBtnClick}>
                                                                <PlayCircleIcon />
                                                            </IconButton>
                                                            <IconButton className={'iconBtn activeBtn' + (!passiveInfo.isPassive ? ' notAllowed' : '')} onClick={onActiveBtnClick}>
                                                                <PauseCircleIcon />
                                                            </IconButton>
                                                        </div>

                                                    </div>
                                                </>}
                                            </AccordionDetails>
                                        </Accordion>
                                    </div>
                                    <div className='mine-axe'>
                                        {currentAxe.image !== undefined ?
                                            <>
                                                <div className='mine-img'>
                                                    <BonusBar info={currentInventory.bonuses} />
                                                    <BonusView icon={true} info={currentInventory.bonuses} />
                                                    <img src={currentAxe.image} />
                                                    {/* <img className={'mine-img ' + ((doingAction || (idDelegate != null && !delegationData.inventory)) ? 'notAllowed' : '')} src={currentAxe.image} onClick={() => onUpgradeAxeClick()} /> */}
                                                </div>
                                                <div className='mine-axe-info'>
                                                    <span className='mine-name'>
                                                        {currentAxe.name != undefined ? currentAxe.name : '..'}
                                                        {(currentAxe.level != undefined && currentAxe.level >= 0) ? `+ ${currentAxe.level}` : null}
                                                        <br />
                                                        <b>Rarity: {currentAxe.rarity}</b>
                                                    </span>
                                                    <div className='durability'>
                                                        <div className='durability-info'>
                                                            <span className='durability-label'>Durability</span>
                                                            <div className='durability-bar'></div>
                                                        </div>
                                                        <span className='durability-text'> {
                                                            currentAxe.durability != undefined
                                                                ? currentAxe.durability == -1 ? ' ∞'
                                                                    : currentAxe.durability
                                                                : '..'
                                                        } </span>
                                                    </div>
                                                </div>
                                            </> :
                                            <div className='noEquippedText'>No Equipped Pickaxe</div>}
                                    </div>
                                    <div className='mine-action'>
                                        <Accordion
                                            expanded={openedActionPanel}
                                            onChange={() => onActionPanelChange()}
                                        >
                                            <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                                                <div className='setting-accordion-summary'>
                                                    <span>Show Actions</span>
                                                    {/* <span>Mineer Timer</span> */}
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className='details'>
                                                <div className='mine-action-button'>

                                                    <Button variant="outlined" color="success" onClick={(e) => !doingAction && onChangeAxeClick(e)}
                                                        id='ChangeAxeBtn'
                                                    >{currentAxe.image != undefined ? 'Change Pickaxe' : 'Equip Pickaxe'}</Button>

                                                    {(idDelegate == null || delegationData.hand) && <Button variant="outlined" color="success" onClick={() => !doingAction && onRepairAxeClick()}
                                                        id='repairAxeBtn'
                                                        disabled={!currentInventory?.isAvailable || currentInventory?.isAvailable.repair !== 1 ? true : false}
                                                        className={!currentInventory?.isAvailable || currentInventory?.isAvailable.repair !== 1 ? 'notAllowed' : ''}
                                                    > {'Repair Axe'} </Button>}
                                                    <Button
                                                        variant="outlined"
                                                        color="success"
                                                        onClick={() => !doingAction && onInventoryClick()}
                                                        id='inventoryBtn'
                                                        disabled={!currentInventory?.id ? true : false}
                                                        className={!currentInventory?.id ? 'notAllowed' : ''}
                                                    >
                                                        {'Inventory'}
                                                    </Button>
                                                </div>
                                                <div className='mine-timer'>
                                                    {/* ENDING TIMES */}
                                                    {miningRemainingTime > 0 ?
                                                        <p className='remainingTime remainingTimeMiner'>Next Miner spot: <b>{
                                                            `${msToTime(miningRemainingTime).hours}:${msToTime(miningRemainingTime).minutes}:${msToTime(miningRemainingTime).seconds}`
                                                        }</b> min</p>
                                                        : null}
                                                    {axeRemainingTime > 0 ?
                                                        <p className='remainingTime remainingTimeAxe'>Equipped Pickaxe available in: <b>{
                                                            `${msToTime(axeRemainingTime).hours}:${msToTime(axeRemainingTime).minutes}:${msToTime(axeRemainingTime).seconds}`
                                                        }</b> min</p>
                                                        : null}
                                                    {miningRemainingTime <= 0 && axeRemainingTime <= 0 && <p className='noMiningText'>Available for mining</p>}
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    </div>
                                </div>
                                <div className="mine-items">
                                    {!passiveInfo.isPassive ?
                                        <div className='consumables'>
                                            {hasConsumables ?
                                                <>
                                                    <span className='desc'>Consumable</span>
                                                    <div
                                                        className={'consumableBtn'}
                                                        onClick={(e) => { onConsumableBtnClick(e, 'mine1') }}
                                                        id='mineConsumableBtn1'
                                                        aria-controls={consumableOpen == 'mine1' ? 'mineConsumableMenu1' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'mine1' ? 'true' : undefined}
                                                    >
                                                        {mineConsumables[0].id != undefined && <img className='consumable-image' src={mineConsumables[0].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='mineConsumableMenu1'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'mine1'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'mineConsumableBtn1',
                                                        }}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'center',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'center',
                                                        }}
                                                    >
                                                        <div className='noConsumableText'>
                                                            No More Consumable
                                                        </div>
                                                        {consumables.map((consumable, index) => (
                                                            consumable.id != mineConsumables[0].id && consumable.id != mineConsumables[1].id && consumable.id != mineConsumables[2].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('mine1', consumable)}>
                                                                <img className='consumableImage' src={consumable.image}></img>
                                                                <div className='consumableDesc'>
                                                                    <span className='consumableName'>{consumable.name}</span>
                                                                    <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                    <span className='consumableDescription'>{consumable.description}</span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                    <div
                                                        className={'consumableBtn'}
                                                        onClick={(e) => { onConsumableBtnClick(e, 'mine2') }}
                                                        id='mineConsumableBtn2'
                                                        aria-controls={consumableOpen == 'mine2' ? 'mineConsumableMenu2' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'mine2' ? 'true' : undefined}
                                                    >
                                                        {mineConsumables[1].id != undefined && <img className='consumable-image' src={mineConsumables[1].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='mineConsumableMenu2'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'mine2'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'mineConsumableBtn2',
                                                        }}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'center',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'center',
                                                        }}
                                                    >
                                                        <div className='noConsumableText'>
                                                            No More Consumable
                                                        </div>
                                                        {consumables.map((consumable, index) => (
                                                            consumable.id != mineConsumables[0].id && consumable.id != mineConsumables[1].id && consumable.id != mineConsumables[2].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('mine2', consumable)}>
                                                                <img className='consumableImage' src={consumable.image}></img>
                                                                <div className='consumableDesc'>
                                                                    <span className='consumableName'>{consumable.name}</span>
                                                                    <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                    <span className='consumableDescription'>{consumable.description}</span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                    <div
                                                        className={'consumableBtn'}
                                                        onClick={(e) => { onConsumableBtnClick(e, 'mine3') }}
                                                        id='mineConsumableBtn3'
                                                        aria-controls={consumableOpen == 'mine3' ? 'mineConsumableMenu3' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'mine3' ? 'true' : undefined}
                                                    >
                                                        {mineConsumables[2].id != undefined && <img className='consumable-image' src={mineConsumables[2].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='mineConsumableMenu3'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'mine3'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'mineConsumableBtn3',
                                                        }}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'center',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'center',
                                                        }}
                                                    >
                                                        <div className='noConsumableText'>
                                                            No More Consumable
                                                        </div>
                                                        {consumables.map((consumable, index) => (
                                                            consumable.id != mineConsumables[0].id && consumable.id != mineConsumables[1].id && consumable.id != mineConsumables[2].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('mine3', consumable)}>
                                                                <img className='consumableImage' src={consumable.image}></img>
                                                                <div className='consumableDesc'>
                                                                    <span className='consumableName'>{consumable.name}</span>
                                                                    <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                    <span className='consumableDescription'>{consumable.description}</span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                    <div className='resetBtn'>
                                                        <Button variant="contained" onClick={() => onResetConsumables('mine')}>
                                                            Reset
                                                        </Button>
                                                    </div>
                                                </> :
                                                <div className='noConsumableText'>
                                                    No Consumable
                                                </div>}
                                        </div> :
                                        <div className='tnt-panel'>
                                            <div className='tnt-info'>
                                                <div className='tnt-left'>
                                                    <img className='tnt-image' src={passiveInfo.tntData.image} />
                                                    <div className='tnt-desc'>
                                                        You can use each <b>{passiveInfo.tntData.name}</b> to add <a>{passiveInfo.constant.actionCountPerMiningTNT}</a> actions.<br />
                                                        <div className={'tnt-quantity' + (Number(burnTNTCount) > passiveInfo.tntData.quantity ? ' missing' : '')}> x{passiveInfo.tntData.quantity - Number(burnTNTCount)}</div>
                                                    </div>
                                                </div>
                                                <div className='tnt-right'>
                                                    <input className='burnTNTInput' type='number' value={burnTNTCount} onChange={(e) => {
                                                        var str = e.target.value
                                                        if (typeof str !== 'string' && typeof str !== 'number') {
                                                            setBurnTNTCount('')
                                                        } else {
                                                            let burnCount = Number(str)
                                                            if (burnCount == '') {
                                                                setBurnTNTCount('')
                                                            } else {
                                                                burnCount = Math.max(Math.min(burnCount, Math.floor((passiveInfo.maxStorableActions - passiveInfo.burntActions + passiveInfo.constant.actionCountPerMiningTNT - 1) / passiveInfo.constant.actionCountPerMiningTNT)), 0)
                                                                setBurnTNTCount(burnCount)
                                                            }
                                                        }
                                                    }} />
                                                    <Button variant="contained" className={'burnTNTBtn' + ((Number(burnTNTCount) > passiveInfo.tntData.quantity || Number(burnTNTCount) == 0) ? ' missing' : '')} onClick={onBurnTNTBtnClick}>
                                                        Burn
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='possibleActionCount'>
                                                Burnt Actions:<b>{passiveInfo.burntActions}</b>/{passiveInfo.maxStorableActions}<div>(After burn:<a>{Math.min(passiveInfo.burntActions + passiveInfo.constant.actionCountPerMiningTNT * burnTNTCount, passiveInfo.maxStorableActions)}</a></div>)
                                            </div>
                                            <div className='action-info'>
                                                <div className='storedActionBar'>
                                                    <div className='bar-desc'>
                                                        Stored :
                                                    </div>
                                                    <span className='bar-text'>
                                                        <a>{passiveInfo.storedActions}</a>/{passiveInfo.maxStorableActions}
                                                    </span>
                                                    {(passiveInfo.storedActions < passiveInfo.maxStorableActions) &&
                                                        <div className='nextStore'>
                                                            (To next:<a>{msToTime(nextStoreRemainingTime).hours}:{msToTime(nextStoreRemainingTime).minutes}:{msToTime(nextStoreRemainingTime).seconds}</a>)
                                                        </div>}
                                                </div>
                                                <div className='performActionCount'>
                                                    Performable Actions : <b>{passiveInfo.maxPerformableActions}</b>
                                                    {/* (Will cost<a>{passiveInfo.constant.ancienCostPerEachMiningAction * passiveInfo.maxPerformableActions}</a> 
                            <img src={ANCIEN_IMAGE} />) */}
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {/* SEAS */}
                                    {
                                        caves.map((cave, index) => (
                                            (cave.always == 1 || passiveInfo.locked || !passiveInfo.isPassive) &&
                                            <div className={'mine-item' + (cave.always == 0 ? ' special-cave' : '')} style={(index === caves.length - 1) ? { marginBottom: '0px' } : {}} key={index}>
                                                <span className='mine-item-title'>{cave.title}</span>
                                                <div className='mine-item-content'>
                                                    <div className="mine-item-text">
                                                        <div><span className='mine-item-description'>{cave.description}</span></div>
                                                        <div><span className='mine-item-recipe'>Rarity Required {cave.rarityRequired}</span></div>
                                                        {/* { !cave.isAllowed && <div className="mine-item-warning">{cave.messageNotAllowed}</div>} */}
                                                    </div>
                                                    <div className='mine-item-detail'>
                                                        <IconButton onClick={() => showCaveInfoHandler(index)}><InfoOutlinedIcon></InfoOutlinedIcon></IconButton>
                                                    </div>
                                                </div>
                                                <div className={'mine-item-btn' + (cave.isAllowed ? '' : ' notAllowed')}>
                                                    {cave.isAllowed ?
                                                        <Button variant="contained" color="success" onClick={() => !doingAction && onMineClick(cave)}>
                                                            {'Mine'}
                                                        </Button> :
                                                        <Button variant="contained" color="error">Mine</Button>
                                                    }
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>}
                    </div>
                </div>
                <div className='footer'>
                    <div className='footer-container'>
                        <img className='gameComponentFooterBack' src={gameComponentFooterBack} alt='game-component-footer-back'></img>
                        <img className='gameComponentFooterMark' src={gameComponentFooterMark} alt='game-component-footer-mark'></img>
                    </div>
                </div>
            </div>

            <props.ConfirmContext.ConfirmationDialog
                className="confirm-panel"
                open={openConfirmType != ''}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                    {openConfirmType == 'change' && <>{openConfirmType} Axe</>}
                    {openConfirmType == 'repair' && <>{`Durability ${currentAxe.durability}` + ` -> ${currentInventory.durabilityTotal}`}</>}
                </DialogTitle>
                <DialogContent>
                    {openConfirmType == 'unlock' && <DialogContentText>Do you want to unlock?</DialogContentText>}
                    {openConfirmType == 'passive' && <DialogContentText>Do you want to Passive On?</DialogContentText>}
                    {openConfirmType == 'passiveUpgrade' && <DialogContentText>Do you want to upgrade to Lvl +{passiveInfo.upgradeInfo.passiveLevel}?</DialogContentText>}
                    {openConfirmType == 'active' && <DialogContentText>Do you want to Passive Off?<br />Store CoolDown will be reset.</DialogContentText>}
                    {openConfirmType == 'burn' && <DialogContentText>Do you want to use {burnTNTCount} tnts?</DialogContentText>}

                    {openConfirmType == 'mine' &&
                        <DialogContentText>
                            {(passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0) ? <>No performable actions</> : <> Are you sure you want to mine at {miningCave?.title}?
                                {miningCave.specialInfo && miningCave.specialInfo.burn == 1 && <><br />You will use {miningCave.specialInfo.type == 'item' ? `x` : ''}<span className='burnInventory'>{miningCave.specialInfo.type == 'item' ? `${miningCave.specialInfo.quantity}` : ''} {miningCave.specialInfo.name}{miningCave.specialInfo.type == 'tool' ? ` +${miningCave.specialInfo.level}` : ''}</span></>}
                                {mineConsumables[0].id != undefined && <><br />{mineConsumables[0].description}</>}
                                {mineConsumables[1].id != undefined && <><br />{mineConsumables[1].description}</>}
                                {mineConsumables[2].id != undefined && <><br />{mineConsumables[2].description}</>}
                            </>}
                        </DialogContentText>
                    }
                    {openConfirmType == 'change' &&
                        <div className='changeAxeMenu'>
                            {axes.length == 0 && <span className='noAxeText'>You have no axe yet.</span>}
                            {axes.map((axe, index) => (
                                <div
                                    onClick={() => onAxeMenuClick(axe)}
                                    key={index}
                                    className={'ownedAxe ' + axe.status}
                                >
                                    <BonusBar info={axe.bonuses} />
                                    <div className='statusText'>
                                        {axe.status == 'equipped' && <div className='axeStatusText axeEquipText'>EQUIPPED</div>}
                                        {axe.status == 'not-available' && <div className='axeStatusText axeWarningText'>MISSING</div>}
                                        {axe.isMining == 1 && <div className='axeStatusText axeMiningText'>MINING</div>}
                                    </div>
                                    <img className='axeImage' src={axe.image} />
                                    <div className='axeDesc'>
                                        <span className='axeName'>{axe.name}</span>
                                        <span className='axeInfo'>{axe.level >= 0 ? `LVL + ${axe.level},` : null} Rarity {axe.rarity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    {openConfirmType == 'changeConfirm' &&
                        <div className='axeChangeConfirmText'>
                            Do you want to change your Axe? You will lose all your stored actions.
                        </div>
                    }
                    {openConfirmType == 'info' &&
                        <div className="caveInfoMenu">
                            {caves[caveIndex].drop.map((drop, sIndex) => (
                                <div key={sIndex} className="ownedCaveInfo">
                                    <div className='drop'>
                                        <div className='drop-desc'>
                                            <span className={'drop-desc-name-' + drop.rarity}>{drop.name}</span>
                                            {/* <br/>
                            <span>{drop.description}</span> */}
                                        </div>
                                        <img className='drop-image' src={drop.image} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    {openConfirmType == 'repair' &&
                        <>
                            <div className='action-panel repair-panel'>
                                {currentInventory?.isAvailable.repair ?
                                    <>
                                        <div className='actions-list'>
                                            <div className='actions'>
                                                <div className={'actionBtn repairBtn' + (currentInventory?.repair.isAllowed ? '' : ' notAllowed')}>
                                                    <Button variant="contained" onClick={() => onActionBtnClick('repair')}>
                                                        {doingAction ? <CircularProgress size={15} sx={{ color: "black" }} /> : 'Repair'}
                                                    </Button>
                                                </div>
                                                <div className='consumables'>
                                                    {currentInventory?.repair.hasConsumables ?
                                                        <>
                                                            <span className='desc'>Consumable</span>
                                                            <div className='consumable-panel'>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.repair.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'repair1') }}
                                                                    id='repairConsumableBtn1'
                                                                    aria-controls={consumableOpen == 'repair1' ? 'repairConsumableMenu1' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'repair1' ? 'true' : undefined}
                                                                >
                                                                    {repairConsumables[0].id != undefined && <img className='consumable-image' src={repairConsumables[0].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='repairConsumableMenu1'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'repair1'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'repairConsumableBtn1',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.repair.consumables.map((consumable, index) => (
                                                                        consumable.id != repairConsumables[0].id && consumable.id != repairConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('repair1', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.repair.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'repair2') }}
                                                                    id='repairConsumableBtn2'
                                                                    aria-controls={consumableOpen == 'repair2' ? 'repairConsumableMenu2' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'repair2' ? 'true' : undefined}
                                                                >
                                                                    {repairConsumables[1].id != undefined && <img className='consumable-image' src={repairConsumables[1].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='repairConsumableMenu2'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'repair2'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'repairConsumableBtn2',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.repair.consumables.map((consumable, index) => (
                                                                        consumable.id != repairConsumables[0].id && consumable.id != repairConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('repair2', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                            </div>
                                                            <div className='resetBtn'>
                                                                <Button variant="contained" onClick={() => onResetConsumables('repair')}>
                                                                    Reset
                                                                </Button>
                                                            </div>
                                                        </> :
                                                        <div className='noConsumableText'>
                                                            No Consumable
                                                        </div>}
                                                </div>
                                            </div>
                                            <div className='cost-list'>
                                                {currentInventory?.repair.requirements.length == 0 &&
                                                    <div className='noRequirementsText'>No requirements</div>}
                                                {currentInventory?.repair.requirements.map((requirement, index) => (
                                                    <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                        <div className='costDesc'>
                                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                                            <span className='costName'>{requirement.name}</span>
                                                        </div>
                                                        <img className='costImg' src={requirement.image} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='desc-panel'>
                                            Are you sure you want to repair?<br />
                                            After the repair the durability will be {currentInventory.durabilityTotal}.
                                        </div>
                                    </>
                                    :
                                    <span className='availableText'>Not repairable</span>}
                            </div>
                        </>
                    }
                    {openConfirmType == 'upgrade' &&
                        <>
                            <div className='action-panel upgrade-panel'>
                                {currentInventory?.isAvailable.upgrade ?
                                    <>
                                        <div className='actions-list'>
                                            <div className='actions'>
                                                <div className={'actionBtn upgradeBtn' + (currentInventory?.upgrade.isAllowed ? '' : ' notAllowed')}>
                                                    <Button variant="contained" onClick={() => onActionBtnClick('upgrade')}>
                                                        {doingAction ? <CircularProgress size={15} sx={{ color: "black" }} /> : 'Upgrade'}
                                                    </Button>
                                                </div>
                                                <div className='consumables'>
                                                    {currentInventory?.upgrade.hasConsumables ?
                                                        <><span className='desc'>Consumable</span>
                                                            <div className='consumable-panel'>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.upgrade.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'upgrade1') }}
                                                                    id='upgradeConsumableBtn1'
                                                                    aria-controls={consumableOpen == 'upgrade1' ? 'upgradeConsumableMenu1' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'upgrade1' ? 'true' : undefined}
                                                                >
                                                                    {upgradeConsumables[0].id != undefined && <img className='consumable-image' src={upgradeConsumables[0].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='upgradeConsumableMenu1'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'upgrade1'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'upgradeConsumableBtn1',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.upgrade.consumables.map((consumable, index) => (
                                                                        consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('upgrade1', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.upgrade.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'upgrade2') }}
                                                                    id='upgradeConsumableBtn2'
                                                                    aria-controls={consumableOpen == 'upgrade2' ? 'upgradeConsumableMenu2' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'upgrade2' ? 'true' : undefined}
                                                                >
                                                                    {upgradeConsumables[1].id != undefined && <img className='consumable-image' src={upgradeConsumables[1].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='upgradeConsumableMenu2'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'upgrade2'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'upgradeConsumableBtn2',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.upgrade.consumables.map((consumable, index) => (
                                                                        consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('upgrade2', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                            </div>
                                                            <div className='resetBtn'>
                                                                <Button variant="contained" onClick={() => onResetConsumables('upgrade')}>
                                                                    Reset
                                                                </Button>
                                                            </div>
                                                        </> :
                                                        <div className='noConsumableText'>
                                                            No Consumable
                                                        </div>}
                                                </div>
                                            </div>
                                            <div className='cost-list'>
                                                {currentInventory?.upgrade.requirements.length == 0 &&
                                                    <div className='noRequirementsText'>No requirements</div>}
                                                {currentInventory?.upgrade.requirements.map((requirement, index) => (
                                                    <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                        <div className='costDesc'>
                                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                                            <span className='costName'>{requirement.name}</span>
                                                        </div>
                                                        <img className='costImg' src={requirement.image} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='desc-panel'>
                                            Are you sure you want to upgrade?<br />
                                            {upgradeConsumables[0].id == 1 || upgradeConsumables[1].id == 1 ? 'The upgrade can fail.' : 'The upgrade can fail and the tool could be downgraded.'}
                                            <br />
                                            Probability of Success: {Math.min((upgradeConsumables[0].id == 2 || upgradeConsumables[1].id == 2 ? 10 : 0) + (upgradeConsumables[0].id == 6 || upgradeConsumables[1].id == 6 ? 5 : 0) + (upgradeConsumables[0].id == 7 || upgradeConsumables[1].id == 7 ? 15 : 0) + currentInventory.upgrade?.probability, 100)}%
                                        </div>
                                    </>
                                    :
                                    <span className='availableText'>Not upgradable</span>}
                            </div>
                        </>
                    }
                </DialogContent>
                {openConfirmType == 'mine' &&
                    <DialogActions>
                        <Button onClick={onDoAction} autoFocus> {(passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0) ? 'Ok' : 'Mine'} </Button>
                    </DialogActions>
                }
                {openConfirmType == 'changeConfirm' &&
                    <DialogActions>
                        <Button onClick={onAxeChange} autoFocus> Sure </Button>
                    </DialogActions>
                }
                {(openConfirmType == 'unlock' || openConfirmType == 'passive' || openConfirmType == 'active' || openConfirmType == 'passiveUpgrade' || openConfirmType == 'burn') &&
                    <DialogActions>
                        <Button onClick={onPassiveAction} autoFocus> Sure </Button>
                    </DialogActions>
                }
            </props.ConfirmContext.ConfirmationDialog>

            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {confirmActionType == 'mine' && (actionRes?.success ? "Success!" : 'Failed!')}
                    {(confirmActionType == 'upgrade' || confirmActionType == 'repair') && (actionRes?.data.done ? "Success!" : 'Failed!')}
                    {(confirmActionType == 'unlock' || confirmActionType == 'passive' || confirmActionType == 'active' || confirmActionType == 'passiveUpgrade' || confirmActionType == 'burn') &&
                        ((actionRes?.success && actionRes?.data.done) ? "Success!" : 'Failed!')
                    }
                </DialogTitle>
                <DialogContent>
                    {actionRes?.success ?
                        <>
                            {(confirmActionType == 'unlock' || confirmActionType == 'passive' || confirmActionType == 'active' || confirmActionType == 'passiveUpgrade' || confirmActionType == 'burn') &&
                                <DialogContentText>{actionRes?.data.message}</DialogContentText>
                            }
                            {confirmActionType == 'mine' &&
                                <div id="mineDropView">
                                    {actionRes?.data.drop.map((drop, index) => (
                                        <div className='drop' key={index}>
                                            <img className='drop-image' src={drop.image} />
                                            <div className={'drop-name drop-rarity-' + drop.rarity}>{drop.name}{drop.type == 'mine' && ` (${drop.experience} EXP)`}</div>
                                            {drop.type != 'mine' && <div className={'drop-desc drop-rarity-' + drop.rarity}>x {drop.quantity}</div>}
                                        </div>
                                    ))}
                                </div>
                            }
                            {confirmActionType == 'repair' &&
                                <div id="repairResponse">
                                    {actionRes?.data.message} <br /> {actionRes?.data.done ? `Now the durability is ${actionRes?.data.durability}.` : actionRes?.data.message}
                                </div>
                            }
                        </> :
                        <DialogContentText>
                            {actionRes?.error.errorMessage}
                        </DialogContentText>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseActionResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {/* { onLoading ?
        <div className='game-on-loading'>
            <div className="sk-cube-grid">
                <div className="sk-cube sk-cube1"></div>
                <div className="sk-cube sk-cube2"></div>
                <div className="sk-cube sk-cube3"></div>
                <div className="sk-cube sk-cube4"></div>
                <div className="sk-cube sk-cube5"></div>
                <div className="sk-cube sk-cube6"></div>
                <div className="sk-cube sk-cube7"></div>
                <div className="sk-cube sk-cube8"></div>
                <div className="sk-cube sk-cube9"></div>
            </div>
        </div>
    : null } */}
    </>)
}

export default GameMiner