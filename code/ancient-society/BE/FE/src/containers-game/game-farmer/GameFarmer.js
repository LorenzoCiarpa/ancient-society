import './game-farmer.scss';
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

const classNameForComponent = 'game-farmer' // ex: game-inventory
const componentTitle = 'Farm' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GameFarmer(props) {
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
    const [fields, setFields] = useState([])
    const [fieldIndex, setFieldIndex] = useState(0);
    const [hoes, setHoes] = useState([])
    const [currentInventory, setCurrentInventory] = useState({})
    const [farmerIsFarming, setFarmerIsFarming] = useState(false)
    const [passiveInfo, setPassiveInfo] = useState({})

    useEffect(() => {
        axios.post('/api/m1/farmer/getFarmer', {
            address: props.metamask.walletAccount,
            idDelegate: idDelegate,
            idColony: idColony,
        })
            .then(response => {
                const farmerResponse = response.data.data.farmerResponse
                console.log(farmerResponse)
                updateState(farmerResponse)
                setOnLoading(false)
                console.log(passiveInfo)

            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
    }, [])

    const showFieldInfoHandler = (sIndex) => {
        playSound('popup')
        setOpenConfirmType('info')
        setFieldIndex(sIndex)
    }

    // equippedHoe
    const [currentHoe, setCurrentHoe] = useState({})
    useEffect(() => {
        for (var i = 0; i < hoes.length; ++i) {
            if (hoes[i].status == 'equipped') {
                setCurrentHoe(hoes[i])
                break
            }
        }
    }, [hoes])

    // ChangeHoe Button/Popup
    const onChangeHoeClick = (e) => {
        playSound('button')
        // playSound('popup')
        setOpenConfirmType('change')
    }

    const [selectedHoe, setSelectedHoe] = useState(null)
    const onHoeMenuClick = (hoe) => {
        setSelectedHoe(hoe)
        setOpenConfirmType('changeConfirm')
        playSound('touch')
    }

    const onHoeChange = () => {
        const hoe = JSON.parse(JSON.stringify(selectedHoe))
        playSound('touch')
        onCloseConfirmModal()
        setDoingAction(true)
        setConfirmActionType('change')
        if (hoe.status == 'equipped') {
            axios.post('/api/m1/farmer/unEquipHoe', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idToolInstance: hoe.id
            })
                .then(response => {
                    if (response.data.success) {
                        const res = response.data.data
                        clearInterval(hoeEndingTimer)
                        setHoeEndingTime(null)
                        setHoeRemainingTime(null)
                        var newHoes = JSON.parse(JSON.stringify(hoes))
                        for (var i = 0; i < newHoes.length; ++i) {
                            if (newHoes[i].status == 'equipped') {
                                newHoes[i].status = 'available'
                                break
                            }
                        }
                        setHoes(newHoes)
                        setFields(res.fields)
                        setCurrentHoe({})
                        setCurrentInventory({})
                    }
                    setDoingAction(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else {
            axios.post('/api/m1/farmer/changeHoe', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idToolInstance: hoe.id
            })
                .then(response => {
                    if (response.data.success) {
                        const res = response.data.data
                        if (!res.hoe.isFarming) {
                            clearInterval(hoeEndingTimer)
                            setHoeEndingTime(null)
                            setHoeRemainingTime(null)
                        } else {
                            setHoeEndingTime(res.hoe.hoeEndingTime)
                        }
                        var newHoes = JSON.parse(JSON.stringify(hoes))
                        for (var i = 0; i < newHoes.length; ++i) {
                            if (newHoes[i].status == 'equipped') {
                                newHoes[i].status = 'available'
                            } else if (newHoes[i].id == hoe.id) {
                                for (var x in res.hoe) {
                                    newHoes[i][x] = res.hoe[x]
                                }
                            }
                        }
                        setHoes(newHoes)
                        setFields(res.fields)
                        setCurrentInventory(res.equippedHoeInstanceData)
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
    const [farmingEndingTime, setFarmingEndingTime] = useState(null)
    const [farmingRemainingTime, setFarmingRemainingTime] = useState(null)
    const [farmingEndingTimer, setFarmingEndingTimer] = useState(null)
    const [hoeEndingTime, setHoeEndingTime] = useState(null)
    const [hoeRemainingTime, setHoeRemainingTime] = useState(null)
    const [hoeEndingTimer, setHoeEndingTimer] = useState(null)
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
            axios.post('/api/m1/farmer/getFarmer', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
            })
                .then(response => {
                    const farmerResponse = response.data.data.farmerResponse
                    console.log(farmerResponse)
                    updateState(farmerResponse)
                    setOnLoading(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }, [nextStoreRemainingTime])

    useEffect(() => {
        if (!farmingEndingTime) return
        clearInterval(farmingEndingTimer)
        setFarmingEndingTimer(setInterval(() => {
            setFarmingRemainingTime(getRemainingTime_InMinute(farmingEndingTime))
        }, 1000))
    }, [farmingEndingTime])

    useEffect(() => {
        if (!hoeEndingTime) return
        clearInterval(hoeEndingTimer)
        setHoeEndingTimer(setInterval(() => {
            setHoeRemainingTime(getRemainingTime_InMinute(hoeEndingTime))
        }, 1000))
    }, [hoeEndingTime])

    useEffect(() => {
        if (farmingRemainingTime < 0) clearInterval(farmingEndingTimer)
        if (hoeRemainingTime < 0) clearInterval(hoeEndingTimer)
        if (hoeRemainingTime < 0 && farmingRemainingTime < 0) setInCooldown(false)
        if (hoeRemainingTime > 0 || farmingRemainingTime > 0) setInCooldown(true)

    }, [farmingRemainingTime, hoeRemainingTime])

    useEffect(() => {
        console.log("coolDown: ", inCooldown)

    }, [inCooldown])

    useEffect(() => {
        console.log("currentInventory: ", currentInventory)

    }, [currentInventory])

    // RepairHoe Button/Dialog  
    const onRepairHoeClick = () => {
        playSound('button')
        setOpenConfirmType('repair')
    }

    // UpgradeHoe Button/Dialog  
    const onUpgradeHoeClick = () => {
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
    const [farmingField, setFarmingField] = useState(null)

    const onFarmClick = (field) => {
        // playSound('button')
        playSound('confirm')
        setOpenConfirmType('farm');
        setFarmingField(field)
    }

    const onActionBtnClick = (actionType) => {
        playSound('button')
        playSound('confirm')
        onCloseConfirmModal()
        setConfirmActionType(actionType)
        if (actionType == 'repair') {
            setDoingAction(true);
            axios.post('/api/m1/farmer/repairHoe', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idToolInstance: currentInventory.id,
                consumableIds: [repairConsumables[0].id, repairConsumables[1].id],
                buildingType: 6,
            })
                .then(response => {
                    console.log('repairHoe', response.data.data)
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
                        setHoes(hoes.map((hoe) => (hoe.id == element.id ? { ...hoe, level: element.level, rarity: element.level, durability: element.durability } : hoe)))
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

    const updateState = (farmerResponse) => {
        setPassiveInfo(farmerResponse.passiveInfo)
        setHasConsumables(farmerResponse.hasConsumables)
        setConsumables(farmerResponse.consumables)
        setFields(farmerResponse.fields)
        setHoes(farmerResponse.hoes)
        setFarmerIsFarming(farmerResponse.farmerIsFarming)
        setCurrentInventory(farmerResponse.equippedHoeInstanceData)
        farmerResponse.farmerEndingTime ? setFarmingEndingTime(farmerResponse.farmerEndingTime) : null
        farmerResponse.hoeEndingTime ? setHoeEndingTime(farmerResponse.hoeEndingTime) : null
        farmerResponse.passiveInfo.nextStoreTime ? setNextStoreTime(farmerResponse.passiveInfo.nextStoreTime) : null
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
                buildingType: 6,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            if (response.data.data.storage) {
                                props.callback_setInventory(response.data.data.storage)
                            }
                            updateState(response.data.data.farmerResponse)
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
                buildingType: 6,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            let farmerRes = response.data.data.farmerResponse;

                            setPassiveInfo(farmerRes.passiveInfo)
                            farmerRes.passiveInfo.nextStoreTime ? setNextStoreTime(farmerRes.passiveInfo.nextStoreTime) : null
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
                buildingType: 6,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            if (response.data.data.storage) {
                                props.callback_setInventory(response.data.data.storage)
                            }
                            updateState(response.data.data.farmerResponse)
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
            axios.post('/api/m1/farmer/burnPassiveSeed', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                burnSeedCount: burnSeedCount
            })
                .then(response => {
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            setBurnSeedCount(0)
                            let editInfo = response.data.data.passiveInfo
                            console.log(editInfo)
                            setPassiveInfo({ ...passiveInfo, maxPerformableActions: editInfo.maxPerformableActions, seedData: editInfo.seedData, burntActions: editInfo.burntActions })
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
        setConfirmActionType('farm');
        if (passiveInfo.isPassive) {
            axios.post('/api/m1/farmer/startPassiveFarming', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idField: farmingField.id,
                consumableIds: [null, null, null],
                actionNumber: passiveInfo.maxPerformableActions
            })
                .then(response => {
                    onResetConsumables()
                    console.log('startPassiveFarming response', response.data)
                    if (response.data.success) {
                        if (response.data.data.storage) {
                            props.callback_setInventory(response.data.data.storage)
                        }
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: response.data.data.passiveInfo.maxPerformableActions, burntActions: response.data.data.passiveInfo.burntActions, storedActions: response.data.data.passiveInfo.storedActions })
                        setHoes(hoes.map((hoe) => (hoe.id == currentHoe.id ? { ...hoe, isFarming: true, durability: response.data.data.hoe.durability } : hoe)))
                        setFields(response.data.data.fields)
                        setFarmingEndingTime(response.data.data.farmingEndingTime)
                        setHoeEndingTime(response.data.data.hoeEndingTime)
                        setHasConsumables(response.data.data.hasConsumables)
                        setConsumables(response.data.data.consumables)
                        setCurrentInventory(response.data.data.equippedHoeInstanceData)
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else {
            axios.post('/api/m1/farmer/startFarming', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idField: farmingField.id,
                consumableIds: [farmConsumables[0].id, farmConsumables[1].id, farmConsumables[2].id]
            })
                .then(response => {
                    onResetConsumables()
                    console.log('startFarming response', response.data)
                    if (response.data.success) {
                        setHoes(hoes.map((hoe) => (hoe.id == currentHoe.id ? { ...hoe, isFarming: true, durability: response.data.data.hoe.durability } : hoe)))
                        setFields(response.data.data.fields)
                        setFarmingEndingTime(response.data.data.farmingEndingTime)
                        setHoeEndingTime(response.data.data.hoeEndingTime)
                        setHasConsumables(response.data.data.hasConsumables)
                        setConsumables(response.data.data.consumables)
                        setCurrentInventory(response.data.data.equippedHoeInstanceData)
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

    const [burnSeedCount, setBurnSeedCount] = useState(0)
    const onBurnSeedBtnClick = () => {
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
    const [farmConsumables, setFarmConsumables] = useState([{}, {}, {}])
    const [repairConsumables, setRepairConsumables] = useState([{}, {}])
    const [upgradeConsumables, setUpgradeConsumables] = useState([{}, {}])

    const onResetConsumables = (consumType = '') => {
        if (consumType == '') {
            setRepairConsumables([{}, {}])
            setUpgradeConsumables([{}, {}])
            setFarmConsumables([{}, {}, {}])
        } else if (consumType == 'farm') {
            setFarmConsumables([{}, {}, {}])
        } else if (consumType == 'repair') {
            setRepairConsumables([{}, {}])
        } else if (consumType == 'upgrade') {
            setUpgradeConsumables([{}, {}])
        }
    }

    const onConsumableClick = (consumType, pconsumable) => {
        onCloseConsumable()
        if (consumType == 'farm1') {
            setFarmConsumables(farmConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'farm2') {
            setFarmConsumables(farmConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        } else if (consumType == 'farm3') {
            setFarmConsumables(farmConsumables.map((consumable, index) => (index == 2 ? pconsumable : consumable)))
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
                            {/* confirmActionType == 'farm' ? <>
                        <img className='apiCallingGif' src={farmingGif} />
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
                                <div className='farm-info'>
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
                                                        <span className='unlockDesc'>In passive mode, you can store farming actions and do them at once.</span>
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
                                                            <span className='passive-farmingCoolDown'>Store CD : <b>{passiveInfo.farmingCoolDown}{/* {passiveInfo.upgradeInfo.isUpgradable ? ` (-> ${passiveInfo.upgradeInfo.farmingCoolDown})` : ''} */}</b> mins</span>
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
                                    <div className='farm-hoe'>
                                        {currentHoe.image !== undefined ?
                                            <>
                                                <div className='farm-img'>
                                                    <BonusBar info={currentInventory.bonuses} />
                                                    <BonusView icon={true} info={currentInventory.bonuses} />
                                                    <img src={currentHoe.image} />
                                                    {/* <img className={'farm-img ' + ((doingAction || (idDelegate != null && !delegationData.inventory)) ? 'notAllowed' : '')} src={currentHoe.image} onClick={() => onUpgradeHoeClick()} /> */}
                                                </div>
                                                <div className='farm-hoe-info'>
                                                    <span className='farm-name'>
                                                        {currentHoe.name != undefined ? currentHoe.name : '..'}
                                                        {(currentHoe.level != undefined && currentHoe.level >= 0) ? `+ ${currentHoe.level}` : null}
                                                        <br />
                                                        <b>Rarity: {currentHoe.rarity}</b>
                                                    </span>
                                                    <div className='durability'>
                                                        <div className='durability-info'>
                                                            <span className='durability-label'>Durability</span>
                                                            <div className='durability-bar'></div>
                                                        </div>
                                                        <span className='durability-text'> {
                                                            currentHoe.durability != undefined
                                                                ? currentHoe.durability == -1 ? ' ∞'
                                                                    : currentHoe.durability
                                                                : '..'
                                                        } </span>
                                                    </div>
                                                </div>
                                            </> :
                                            <div className='noEquippedText'>No Equipped Shovel</div>}
                                    </div>
                                    <div className='farm-action'>
                                        <Accordion
                                            expanded={openedActionPanel}
                                            onChange={() => onActionPanelChange()}
                                        >
                                            <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                                                <div className='setting-accordion-summary'>
                                                    <span>Show Actions</span>
                                                    {/* <span>Farmer Timer</span> */}
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className='details'>
                                                <div className='farm-action-button'>

                                                    <Button variant="outlined" color="success" onClick={(e) => !doingAction && onChangeHoeClick(e)}
                                                        id='ChangeHoeBtn'
                                                    >{currentHoe.image != undefined ? 'Change SHOVEL' : 'Equip SHOVEL'}</Button>

                                                    {(idDelegate == null || delegationData.hand) && <Button variant="outlined" color="success" onClick={() => !doingAction && onRepairHoeClick()}
                                                        id='repairHoeBtn'
                                                        disabled={!currentInventory?.isAvailable || currentInventory?.isAvailable.repair !== 1 ? true : false}
                                                        className={!currentInventory?.isAvailable || currentInventory?.isAvailable.repair !== 1 ? 'notAllowed' : ''}
                                                    > {'Repair Shovel'} </Button>}
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
                                                <div className='farm-timer'>
                                                    {/* ENDING TIMES */}
                                                    {farmingRemainingTime > 0 ?
                                                        <p className='remainingTime remainingTimeFarmer'>Next Farmer spot: <b>{
                                                            `${msToTime(farmingRemainingTime).hours}:${msToTime(farmingRemainingTime).minutes}:${msToTime(farmingRemainingTime).seconds}`
                                                        }</b> min</p>
                                                        : null}
                                                    {hoeRemainingTime > 0 ?
                                                        <p className='remainingTime remainingTimeHoe'>Equipped Shovel available in: <b>{
                                                            `${msToTime(hoeRemainingTime).hours}:${msToTime(hoeRemainingTime).minutes}:${msToTime(hoeRemainingTime).seconds}`
                                                        }</b> min</p>
                                                        : null}
                                                    {farmingRemainingTime <= 0 && hoeRemainingTime <= 0 && <p className='noFarmingText'>Available for farming</p>}
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    </div>
                                </div>
                                <div className="farm-items">
                                    {!passiveInfo.isPassive ?
                                        <div className='consumables'>
                                            {hasConsumables ?
                                                <>
                                                    <span className='desc'>Consumable</span>
                                                    <div
                                                        className={'consumableBtn'}
                                                        onClick={(e) => { onConsumableBtnClick(e, 'farm1') }}
                                                        id='farmConsumableBtn1'
                                                        aria-controls={consumableOpen == 'farm1' ? 'farmConsumableMenu1' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'farm1' ? 'true' : undefined}
                                                    >
                                                        {farmConsumables[0].id != undefined && <img className='consumable-image' src={farmConsumables[0].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='farmConsumableMenu1'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'farm1'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'farmConsumableBtn1',
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
                                                            consumable.id != farmConsumables[0].id && consumable.id != farmConsumables[1].id && consumable.id != farmConsumables[2].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('farm1', consumable)}>
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
                                                        onClick={(e) => { onConsumableBtnClick(e, 'farm2') }}
                                                        id='farmConsumableBtn2'
                                                        aria-controls={consumableOpen == 'farm2' ? 'farmConsumableMenu2' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'farm2' ? 'true' : undefined}
                                                    >
                                                        {farmConsumables[1].id != undefined && <img className='consumable-image' src={farmConsumables[1].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='farmConsumableMenu2'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'farm2'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'farmConsumableBtn2',
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
                                                            consumable.id != farmConsumables[0].id && consumable.id != farmConsumables[1].id && consumable.id != farmConsumables[2].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('farm2', consumable)}>
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
                                                        onClick={(e) => { onConsumableBtnClick(e, 'farm3') }}
                                                        id='farmConsumableBtn3'
                                                        aria-controls={consumableOpen == 'farm3' ? 'farmConsumableMenu3' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'farm3' ? 'true' : undefined}
                                                    >
                                                        {farmConsumables[2].id != undefined && <img className='consumable-image' src={farmConsumables[2].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='farmConsumableMenu3'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'farm3'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'farmConsumableBtn3',
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
                                                            consumable.id != farmConsumables[0].id && consumable.id != farmConsumables[1].id && consumable.id != farmConsumables[2].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('farm3', consumable)}>
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
                                                        <Button variant="contained" onClick={() => onResetConsumables('farm')}>
                                                            Reset
                                                        </Button>
                                                    </div>
                                                </> :
                                                <div className='noConsumableText'>
                                                    No Consumable
                                                </div>}
                                        </div> :
                                        <div className='seed-panel'>
                                            <div className='seed-info'>
                                                <div className='seed-left'>
                                                    <img className='seed-image' src={passiveInfo.seedData.image} />
                                                    <div className='seed-desc'>
                                                        You can use each <b>{passiveInfo.seedData.name}</b> to add <a>{passiveInfo.constant.actionCountPerFarmingSEED}</a> actions.<br />
                                                        <div className={'seed-quantity' + (Number(burnSeedCount) > passiveInfo.seedData.quantity ? ' missing' : '')}> x{passiveInfo.seedData.quantity - Number(burnSeedCount)}</div>
                                                    </div>
                                                </div>
                                                <div className='seed-right'>
                                                    <input className='burnSeedInput' type='number' value={burnSeedCount} onChange={(e) => {
                                                        var str = e.target.value
                                                        if (typeof str !== 'string' && typeof str !== 'number') {
                                                            setBurnSeedCount('')
                                                        } else {
                                                            let burnCount = Number(str)
                                                            if (burnCount == '') {
                                                                setBurnSeedCount('')
                                                            } else {
                                                                burnCount = Math.max(Math.min(burnCount, Math.floor((passiveInfo.maxStorableActions - passiveInfo.burntActions + passiveInfo.constant.actionCountPerFarmingSEED - 1) / passiveInfo.constant.actionCountPerFarmingSEED)), 0)
                                                                setBurnSeedCount(burnCount)
                                                            }
                                                        }
                                                    }} />
                                                    <Button variant="contained" className={'burnSeedBtn' + ((Number(burnSeedCount) > passiveInfo.seedData.quantity || Number(burnSeedCount) == 0) ? ' missing' : '')} onClick={onBurnSeedBtnClick}>
                                                        Burn
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='possibleActionCount'>
                                                Burnt Actions:<b>{passiveInfo.burntActions}</b>/{passiveInfo.maxStorableActions}<div>(After burn:<a>{Math.min(passiveInfo.burntActions + passiveInfo.constant.actionCountPerFarmingSEED * burnSeedCount, passiveInfo.maxStorableActions)}</a></div>)
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
                                                    {/* (Will cost<a>{passiveInfo.constant.ancienCostPerEachFarmingAction * passiveInfo.maxPerformableActions}</a> 
                            <img src={ANCIEN_IMAGE} />) */}
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {/* SEAS */}
                                    {
                                        fields.map((field, index) => (
                                            (field.always == 1 || passiveInfo.locked || !passiveInfo.isPassive) &&
                                            <div className={'farm-item' + (field.always == 0 ? ' special-field' : '')} style={(index === fields.length - 1) ? { marginBottom: '0px' } : {}} key={index}>
                                                <span className='farm-item-title'>{field.title}</span>
                                                <div className='farm-item-content'>
                                                    <div className="farm-item-text">
                                                        <div><span className='farm-item-description'>{field.description}</span></div>
                                                        <div><span className='farm-item-recipe'>Rarity Required {field.rarityRequired}</span></div>
                                                        {/* { !field.isAllowed && <div className="farm-item-warning">{field.messageNotAllowed}</div>} */}
                                                    </div>
                                                    <div className='farm-item-detail'>
                                                        <IconButton onClick={() => showFieldInfoHandler(index)}><InfoOutlinedIcon></InfoOutlinedIcon></IconButton>
                                                    </div>
                                                </div>
                                                <div className={'farm-item-btn' + (field.isAllowed ? '' : ' notAllowed')}>
                                                    {field.isAllowed ?
                                                        <Button variant="contained" color="success" onClick={() => !doingAction && onFarmClick(field)}>
                                                            {'Farm'}
                                                        </Button> :
                                                        <Button variant="contained" color="error">Farm</Button>
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
                    {openConfirmType == 'change' && <>{openConfirmType} Shovel</>}
                    {openConfirmType == 'repair' && <>{`Durability ${currentHoe.durability}` + ` -> ${currentInventory.durabilityTotal}`}</>}
                </DialogTitle>
                <DialogContent>
                    {openConfirmType == 'unlock' && <DialogContentText>Do you want to unlock?</DialogContentText>}
                    {openConfirmType == 'passive' && <DialogContentText>Do you want to Passive On?</DialogContentText>}
                    {openConfirmType == 'passiveUpgrade' && <DialogContentText>Do you want to upgrade to Lvl +{passiveInfo.upgradeInfo.passiveLevel}?</DialogContentText>}
                    {openConfirmType == 'active' && <DialogContentText>Do you want to Passive Off?<br />Store CoolDown will be reset.</DialogContentText>}
                    {openConfirmType == 'burn' && <DialogContentText>Do you want to use {burnSeedCount} seeds?</DialogContentText>}

                    {openConfirmType == 'farm' &&
                        <DialogContentText>
                            {(passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0) ? <>No performable actions</> : <> Are you sure you want to farm at {farmingField?.title}?
                                {farmingField.specialInfo && farmingField.specialInfo.burn == 1 && <><br />You will use {farmingField.specialInfo.type == 'item' ? `x` : ''}<span className='burnInventory'>{farmingField.specialInfo.type == 'item' ? `${farmingField.specialInfo.quantity}` : ''} {farmingField.specialInfo.name}{farmingField.specialInfo.type == 'tool' ? ` +${farmingField.specialInfo.level}` : ''}</span></>}
                                {farmConsumables[0].id != undefined && <><br />{farmConsumables[0].description}</>}
                                {farmConsumables[1].id != undefined && <><br />{farmConsumables[1].description}</>}
                                {farmConsumables[2].id != undefined && <><br />{farmConsumables[2].description}</>}
                            </>}
                        </DialogContentText>
                    }
                    {openConfirmType == 'change' &&
                        <div className='changeHoeMenu'>
                            {hoes.length == 0 && <span className='noHoeText'>You have no shovel yet.</span>}
                            {hoes.map((hoe, index) => (
                                <div
                                    onClick={() => onHoeMenuClick(hoe)}
                                    key={index}
                                    className={'ownedHoe ' + hoe.status}
                                >
                                    <BonusBar info={hoe.bonuses} />
                                    <div className='statusText'>
                                        {hoe.status == 'equipped' && <div className='hoeStatusText hoeEquipText'>EQUIPPED</div>}
                                        {hoe.status == 'not-available' && <div className='hoeStatusText hoeWarningText'>MISSING</div>}
                                        {hoe.isFarming == 1 && <div className='hoeStatusText hoeFarmingText'>FARMING</div>}
                                    </div>
                                    <img className='hoeImage' src={hoe.image} />
                                    <div className='hoeDesc'>
                                        <span className='hoeName'>{hoe.name}</span>
                                        <span className='hoeInfo'>{hoe.level >= 0 ? `LVL + ${hoe.level},` : null} Rarity {hoe.rarity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    {openConfirmType == 'changeConfirm' &&
                        <div className='hoeChangeConfirmText'>
                            Do you want to change your Shovel? You will lose all your stored actions.
                        </div>
                    }
                    {openConfirmType == 'info' &&
                        <div className="fieldInfoMenu">
                            {fields[fieldIndex].drop.map((drop, sIndex) => (
                                <div key={sIndex} className="ownedFieldInfo">
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
                {openConfirmType == 'farm' &&
                    <DialogActions>
                        <Button onClick={onDoAction} autoFocus> {(passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0) ? 'Ok' : 'Farm'} </Button>
                    </DialogActions>
                }
                {openConfirmType == 'changeConfirm' &&
                    <DialogActions>
                        <Button onClick={onHoeChange} autoFocus> Sure </Button>
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
                    {confirmActionType == 'farm' && (actionRes?.success ? "Success!" : 'Failed!')}
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
                            {confirmActionType == 'farm' &&
                                <div id="farmDropView">
                                    {actionRes?.data.drop.map((drop, index) => (
                                        <div className='drop' key={index}>
                                            <img className='drop-image' src={drop.image} />
                                            <div className={'drop-name drop-rarity-' + drop.rarity}>{drop.name}{drop.type == 'farm' && ` (${drop.experience} EXP)`}</div>
                                            {drop.type != 'farm' && <div className={'drop-desc drop-rarity-' + drop.rarity}>x {drop.quantity}</div>}
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

export default GameFarmer