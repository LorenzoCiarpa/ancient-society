import './rinventorypanel.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';
// import { remove } from 'winston';
import useSound from 'use-sound';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Badge,
  Button,
  CircularProgress,
  DialogContent,
  DialogContentText,
  Menu,
  MenuItem,
} from '@mui/material';

import { serverConfig } from '../../../../config/serverConfig';
import {
  format,
  isAddress,
  isColonyAddress,
  isENS,
  resolveENS,
  toFixed,
} from '../../../../utils/utils';
import PVPPoints from '../../assets/basic/PVPPoints.png';
import TestDropImg from '../../assets/inventory-panel/chest.png';
import TestUnitImg from '../../assets/inventory-panel/chest2.jpeg';
import RBackdrop from '../basic/backdrop/RBackdrop';
import RButton from '../basic/button/RButton';
import RInput from '../basic/input/RInput';
import RModal from '../basic/modal/RModal';
import RInventory from './inventory/RInventory';

const tabNames = ['All', 'Chest', 'Gear', 'Item', 'Recipe']
let totalInventories = []
function RInventoryPanel(props) {
  const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;
  const isMute = localStorage.getItem('isMute')
  const [play, { stop }] = useSound(
    `${ASSETS_PATH}/common/touch.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );
  const [playConfirm] = useSound(
    `${ASSETS_PATH}/common/confirm.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );
  // set loading bar
  const [loadingBar, setLoadingBar] = useState(false)

  // get all inventories
  const [toolList, setToolList] = useState([])
  const [inventories, setInventories] = useState([]);
  useEffect(() => {
    console.log('get all user inventories')
    getAllInventories()
  }, [])

  useEffect(() => {
    var newToolList = []
    for (var i = 0; i < inventories?.length; ++i) {
      if (inventories[i].type == 'gear') {
        newToolList.push(inventories[i])
      }
    }
    setToolList(newToolList)
  }, [inventories])

  // get all user inventories from server
  const getAllInventories = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getInventoryListPvp", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          let newInventories = JSON.parse(JSON.stringify(response.data.data))
          setInventories(newInventories)
          totalInventories = newInventories
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }
  // set onsumables params
  const [consumableOpen, setConsumableOpen] = useState('')
  const [consumableAnchorEl, setConsumableAnchorEL] = useState(null)
  const [repairConsumables, setRepairConsumables] = useState([{}, {}])
  const [upgradeConsumables, setUpgradeConsumables] = useState([{}, {}, {}])
  const [craftConsumables, setCraftConsumables] = useState([{}, {}])
  const onConsumableBtnClick = (e, type) => {
    setConsumableAnchorEL(e.currentTarget)
    setConsumableOpen(type)
  }
  const onCloseConsumable = () => {
    setConsumableOpen('')
  }
  const onConsumableClick = (consumType, pconsumable) => {
    onCloseConsumable()
    if (consumType == 'repair1') {
      setRepairConsumables(repairConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
    } else if (consumType == 'repair2') {
      setRepairConsumables(repairConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
    } else if (consumType == 'upgrade1') {
      setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
    } else if (consumType == 'upgrade2') {
      setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
    } else if (consumType == 'upgrade3') {
      setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 2 ? pconsumable : consumable)))
    } else if (consumType == 'craft1') {
      setCraftConsumables(craftConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
    } else if (consumType == 'craft2') {
      setCraftConsumables(craftConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
    }
  }
  const onResetConsumables = (consumType = '') => {
    if (consumType == '') {
      setRepairConsumables([{}, {}])
      setUpgradeConsumables([{}, {}, {}])
      setCraftConsumables([{}, {}])
    } else if (consumType == 'repair') {
      setRepairConsumables([{}, {}])
    } else if (consumType == 'upgrade') {
      setUpgradeConsumables([{}, {}, {}])
    } else if (consumType == 'craft') {
      setCraftConsumables([{}, {}])
    }
  }

  // basic attr className|style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // tab handling
  const [currentTabName, setCurrentTabName] = useState(tabNames[0])
  const onTabClick = (tabName) => {
    setCurrentTabName(tabName)
  }
  useEffect(() => {
    setInventories(inventories)
  }, [currentTabName])

  const tabFilter = (item) => {
    if (currentTabName == 'All')
      return true
    if (currentTabName == 'Chest') {
      return item?.isChest && item?.type == 'item'
    }
    if (currentTabName == 'Item') {
      return !item?.isChest && item?.type == 'item'
    }
    if (item?.type == currentTabName.toLowerCase())
      return true
    else
      return false
  }

  const getCountsGroupByTabName = (tabName) => {
    if (tabName == 'All')
      return inventories.length
    else if (tabName == 'Chest') {
      return inventories.filter(item => item?.isChest && item?.type == 'item').length
    }
    else if (tabName == 'Item') {
      return inventories.filter(item => !item?.isChest && item?.type == 'item').length
    }
    else {
      return inventories.filter(item => (tabName.toLowerCase() == item.type ? true : false)).length
    }
  }
  // detail view handling
  const [showDetail, setShowDetail] = useState(false)
  const [selectedInventoryData, setSelectedInventoryData] = useState({})
  useEffect(() => {
    // console.log(selectedInventoryData)
    if (selectedInventoryData?.type == 'recipe') {
      setConsumableSlots(new Array(selectedInventoryData.craft?.requirements?.length))
    }
    if (selectedInventoryData.length == 0) {
      setShowDetail(false)
    }
    setOpenQuantity(1)
    setCraftQuantity(1)
    setSendQuantity(1)
    setSendAddress('')
  }, [selectedInventoryData])

  const onShowDetail = (inventoryData) => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getInventoryInstancePvp", {
        address: props.metamask,
        idInventoryInstance: inventoryData.id,
        inventoryType: inventoryData.type
      })
      .then((response) => {
        // console.log('getInventoryData', response.data.data.upgrade.nextLevel)
        if (response.data.success) {
          // show selected inventory details
          setSelectedInventoryData(JSON.parse(JSON.stringify(response.data.data)))
          if (response.data.data.type == 'recipe') {
            setMaxPossibleCraftCount(response.data.data?.maxPossibleCraftCount)
            setConsumableSlots(new Array(response.data.data?.craft?.requirements.length))
          }
          openDetail()
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }
  const openDetail = () => {
    setShowDetail(true)

    // init send or sale or open params
    setSellDay(1)
    setSellHour(1)
    setSellPrice(1)
    setSellQuantity(1)
    sendQuantity(1)
    openQuantity(1)
  }
  const closeDetail = () => {
    setShowDetail(false)
  }

  // Inventory Actions Upgrade | Open | Craft
  const onUpgrade = () => {
    console.log(`${'upgrade'}`)
    playConfirm()
    let type = selectedInventoryData?.type
    if (type.toLocaleLowerCase() === 'item')
      onActionBtnClick('itemUpgrade')
    else if (type.toLocaleLowerCase() === 'gear')
      onActionBtnClick('gearUpgrade')
  }

  const [openQuantity, setOpenQuantity] = useState(1)
  const onOpenQuantityChange = (e) => {
    setOpenQuantity(Math.max(0, Math.min(/* selectedInventoryData.quantity,  */e.target.value, 100)))
  }
  const onOpenChest = () => {
    playConfirm()
    console.log('open chest', openQuantity)
    if (openQuantity == undefined || openQuantity <= 0) {
      notify('You must input at least 1 chest.')
      return
    }
    onActionBtnClick('Open')
  }

  const [craftQuantity, setCraftQuantity] = useState(1)
  const [maxPossibleCraftCount, setMaxPossibleCraftCount] = useState(1)
  const onCraftQuantityChange = (e) => {
    setCraftQuantity(Math.max(0, Math.min(/* selectedInventoryData.quantity,  */e.target.value, maxPossibleCraftCount)))
  }
  const onCraft = () => {
    playConfirm()
    console.log('craft', craftQuantity)
    if (craftQuantity == undefined || craftQuantity <= 0) {
      notify('You must input at least 1 recipe.')
      return
    }
    onActionBtnClick('Craft')
  }

  const [sendQuantity, setSendQuantity] = useState(1)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [sellPrice, setSellPrice] = useState(1)
  const [sellDay, setSellDay] = useState(1)
  const [sellHour, setSellHour] = useState(1)
  const [sendAddress, setSendAddress] = useState('')
  const [sendResolvedAddress, setSendResolvedAddress] = useState('')
  useEffect(() => {
    async function resolve() { setSendResolvedAddress(await resolveENS(sendAddress)) }
    resolve();
  }, [sendAddress])
  const onSendQuantityChange = (e) => {
    setSendQuantity(Math.max(0, Math.min(e.target.value, 10)))
  }
  const onSellQuantityChange = (e) => {
    setSellQuantity(Math.max(0, Math.min(e.target.value, 10)))
  }
  const onSellPriceChange = (e) => {
    setSellPrice(Math.max(0, Math.min(e.target.value, 10000000)))
  }
  const onSellDayChange = (e) => {
    setSellDay(Math.max(0, Math.min(e.target.value, 28)))
  }
  const onSellHourChange = (e) => {
    setSellHour(Math.max(0, Math.min(e.target.value, 23)))
  }
  const onSendAddressChange = (e) => {
    console.log(isENS(sendAddress))
    setSendAddress(e.target.value)
  }
  const onSendItem = () => {
    playConfirm()
    console.log('send item', sendQuantity)
    if (sendQuantity == undefined || sendQuantity <= 0) {
      notify('You must send at least 1 item.')
      return
    }
    if (sendResolvedAddress == '' || sendResolvedAddress == undefined) {
      notify('You must input receiver address.')
      return
    }

    if (isENS(sendAddress) && !isAddress(sendResolvedAddress)) {
      notify('You must input valid format address.')
      return
    }

    onActionBtnClick('Send')
  }

  const onSellItem = () => {
    playConfirm()
    console.log('sell item', sellQuantity)
    if (sellQuantity == undefined || sellQuantity <= 0) {
      notify('You must sell at least 1 item.')
      return
    }

    if (sellPrice == undefined || sellPrice <= 0) {
      notify('You must set the price.')
      return
    }

    onActionBtnClick('Sell')
  }
  // toast
  const loading = (message) => toast.loading(message);
  const notify = (error) => toast.error(error);
  const success = (message) => toast.success(message);

  // Confirm Modal handling
  const [actionType, setActionType] = useState(null)
  const [actionContent, setActionContent] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [onDoing, setOnDoing] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState(null)
  const onActionBtnClick = (type) => {
    setActionType(type)
    switch (type) {
      case 'gearUpgrade':
        setActionContent(<>upgrade the <a>Gear</a></>)
        setConfirmActionType('upgrade')
        break
      case 'itemUpgrade':
        setActionContent(<>upgrade the <a>Item</a></>)
        setConfirmActionType('upgrade')
        break
      case 'Open':
        setActionContent(<>open the <a>Chest</a></>)
        setConfirmActionType('open')
        break
      case 'Craft':
        setActionContent(<>craft the <a>Recipe</a></>)
        setConfirmActionType('craft')
        break
      case 'Send':
        setActionContent(<>send the <a>{selectedInventoryData?.type}</a></>)
        setConfirmActionType('send')
        break
      case 'Sell':
        setActionContent(<>sell the <a>{selectedInventoryData?.type}</a></>)
        setConfirmActionType('sell')
        break
    }
    setConfirmModalOpen(true)
    // setOnDoing(true)
  }

  const [burnToolList, setBurnToolList] = useState([])
  const [consumableSlots, setConsumableSlots] = useState([])
  const [slotNeed, setSlotNeed] = useState(true)
  const onCancelAction = () => {
    setConfirmModalOpen(false)
  }
  // click sure button
  const onSureAction = () => {
    switch (actionType) {
      case 'gearUpgrade':
      case 'itemUpgrade':
        onUpgradeAction()
        break
      case 'Open':
        onOpenAction()
        break
      case 'Craft':
        var newBurnToolList = []
        var requirements = selectedInventoryData.craft?.requirements, i
        for (i = 0; i < requirements.length; ++i) {
          if (requirements[i].burn) {
            if (consumableSlots[i] == undefined) {
              break
            }
            newBurnToolList.push(consumableSlots[i].id)
          }
        }
        if (i == requirements.length) {
          setBurnToolList(newBurnToolList)
          setSlotNeed(false)
        } else {
          setSlotNeed(true)
        }
        onCraftAction()
        break
      case 'Send':
        onSendAction()
        break
      case 'Sell':
        onSellAction()
        break
      default:
        break;
    }
  }

  const onConsumableSlotClick = (tool, index, type) => {
    var newConsumableSlots = JSON.parse(JSON.stringify(consumableSlots))
    newConsumableSlots[index] = { id: tool.id, image: tool.image, type: type, name: tool.name }
    setConsumableSlots(newConsumableSlots)
    onCloseConsumable()
  }
  const onCraftAction = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/craftPvp", {
        address: props.metamask,
        idRecipeInstance: selectedInventoryData?.id,
        burnGearIds: [...consumableSlots.filter((record) => record?.type == 'gear')?.map((item) => { return item.id })],
        burnCardIds: [...consumableSlots.filter((record) => record?.type == 'item')?.map((item) => { return item.id })],
        consumableIds: [craftConsumables[0].id, craftConsumables[1].id],
        craftCount: craftQuantity
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          if (response.data.data.data?.done) {
            success(response.data.data.data?.message)
            updateInventoryData(response.data.data)
            setConsumableSlots(new Array(selectedInventoryData?.craft.requirements?.length))
          }
          else {
            notify(response.data.data.data?.message)
          }
        }
        setLoadingBar(false)
        setConfirmModalOpen(false)
      })
      .catch((error) => {
        console.log(error)
        notify(error.response?.data.error.errorMessage);
        setLoadingBar(false)
        setConfirmModalOpen(false)
      });
  }

  // send action
  const onSendAction = () => {
    let sendUrl = ''
    let postData = {
      address: props.metamask,
      receiver: sendResolvedAddress,
    }
    switch (selectedInventoryData?.type) {
      case 'gear':
        sendUrl = '/api/m1/pvp/sendGear'
        postData.idGearInstance = selectedInventoryData?.id
        break
      case 'item':
        sendUrl = '/api/m1/pvp/sendItem'
        postData.idItemInstance = selectedInventoryData?.id
        postData.quantity = sendQuantity
        break
      case 'recipe':
        sendUrl = '/api/m1/pvp/sendRecipe'
        postData.idRecipeInstance = selectedInventoryData?.id
        postData.quantity = sendQuantity
        break
      case 'NPC':
        sendUrl = '/api/m1/pvp/sendNPC'
        postData.idNPCInstance = selectedInventoryData?.id
        postData.quantity = sendQuantity
        break
    }

    if (sendUrl != '') {
      axios
        .post(sendUrl, postData)
        .then((response) => {
          if (response.data.success) {
            // set user inventories from server
            if (response.data?.data.done) {
              success('You sent the ' + selectedInventoryData?.type + ' to ' + sendResolvedAddress + ' successfully.')
              updateInventoryData(response.data)
            }
            else {
              notify(response.data?.data.message)
            }
          }
          setLoadingBar(false)
          setConfirmModalOpen(false)
        })
        .catch((error) => {
          console.log(error)
          notify(error.response?.data.error.errorMessage);
          setLoadingBar(false)
          setConfirmModalOpen(false)
        });
    }
  }

  // sell action
  const onSellAction = () => {
    let postData = {
      address: props.metamask,
      inventoryType: selectedInventoryData?.type,
      id: selectedInventoryData?.id,
      level: selectedInventoryData?.level ? selectedInventoryData?.level : 0,
      isPvp: true,
      quantity: sellQuantity,
      price: sellPrice,
      duration: (sellDay * 24 * 3600 + sellHour * 3600)
    }
    let sendUrl = '/api/m1/marketplaceInventory/createAd'
    if (sendUrl != '') {
      axios
        .post(sendUrl, postData)
        .then((response) => {
          if (response.data.success) {
            // set user inventories from server
            if (response.data?.data.done){
              success("You sold this inventory successfully.")
              updateInventoryData(response.data)
            }
            else{
              notify("You can't sell this inventory.");
            }
          }
          else{
            notify("You can't sell this inventory.");
          }
          setLoadingBar(false)
          setConfirmModalOpen(false)
        })
        .catch((error) => {
          console.log(error)
          notify("You can't sell this inventory.");
          setLoadingBar(false)
          setConfirmModalOpen(false)
        });
    }
  }

  const onUpgradeAction = () => {
    // setLoadingBar(true)
    axios
      .post("/api/m1/pvp/upgradeGear", {
        address: props.metamask,
        idGearInstance: selectedInventoryData?.id,
        consumableIds: [upgradeConsumables[0].id, upgradeConsumables[1].id, upgradeConsumables[2].id]
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          if (response.data.data.done) {
            success(response.data.data.message)
            updateInventoryData(response.data)
          }
          else {
            if (selectedInventoryData?.level == 1) {
              notify('Upgrade failed.')
            }
            else {
              notify(response.data.data.message)
            }
          }
        }
        setLoadingBar(false)
        setConfirmModalOpen(false)
      })
      .catch((error) => {
        console.log(error)
        notify(error.response?.data.error.errorMessage);
        setLoadingBar(false)
        setConfirmModalOpen(false)
      });
  }

  const onOpenAction = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/openChestPvp", {
        address: props.metamask,
        idItemInstance: selectedInventoryData?.id,
        openCount: openQuantity
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          if (response.data.data.done) {
            success(response.data.data.message)
            updateInventoryData(response.data)
          }
          else {
            notify(response.data.data.message)
          }
        }
        else {
          notify('Server connection error! Please retry.')
        }
        setLoadingBar(false)
        setConfirmModalOpen(false)
      })
      .catch((error) => {
        notify('Server connection error! Please retry.')
        setLoadingBar(false)
        setConfirmModalOpen(false)
      });
  }
  const updateInventoryData = (data) => {
    if (data.success && data.data?.inventory != undefined) {
      let orgInventoryData = JSON.parse(JSON.stringify(inventories))
      let orgCurrentInventory = JSON.parse(JSON.stringify(selectedInventoryData))
      const inventory = data.data?.inventory
      for (let i = 0; i < inventory.length; ++i) {
        const elements = inventory[i].elements
        for (let j = 0; j < elements.length; ++j) {
          const action = inventory[i].action, element = elements[j]
          if (action == 'edit') {
            editInventory(element, orgInventoryData, orgCurrentInventory)
          } else if (action == 'add') {
            if (element.type != 'card') {
              addInventory(element, orgInventoryData)
            }
          } else if (action == 'remove') {
            removeInventory(element, orgInventoryData)
          }
        }
      }
      let isCurrentInventoryEmpty = true
      for (let x in selectedInventoryData) {
        if (x != undefined && x != null) {
          isCurrentInventoryEmpty = false
          break
        }
      }
      if (!isCurrentInventoryEmpty) {
        setSelectedInventoryData(orgCurrentInventory)
      }

      var newInventoryData = []
      for (let i = 0; i < orgInventoryData.length; ++i) {
        if (orgInventoryData[i].remove) {
          continue
        }
        newInventoryData.push(orgInventoryData[i])
      }
      setInventories(JSON.parse(JSON.stringify(newInventoryData)))
      setCurrentTabName(currentTabName)
      // onShowDetail(selectedInventoryData)
    }

    if (data.success && data.data?.storage != undefined) {
      let storage = data.data?.storage
      if (storage.pvpPoints) {
        let userData = props.userdata
        userData.pvpPoints = storage.pvpPoints
        props.setUserData(userData, 'pvpPoints', storage.pvpPoints)
      }
      if (storage.warPoints) {
        let userData = props.userdata
        userData.warPoints = storage.warPoints
        props.setUserData(userData, 'warPoints', storage.warPoints)
      }
    }
  }

  const editInventory = (inventory, orgInventoryData, orgCurrentInventory) => {
    if (inventory.id == orgCurrentInventory.id && inventory.type == orgCurrentInventory.type) {
      for (let x in inventory) {
        orgCurrentInventory[x] = inventory[x]
        orgCurrentInventory[x] = inventory[x]
      }
      setMaxPossibleCraftCount(orgCurrentInventory.maxPossibleCraftCount)
    }
    for (let i = 0; i < orgInventoryData.length; ++i) {
      if (orgInventoryData[i].id == inventory.id && orgInventoryData[i].type == inventory.type) {
        for (let x in orgInventoryData[i]) {
          orgInventoryData[i][x] = inventory[x] != undefined ? inventory[x] : orgInventoryData[i][x]
        }
      }
    }
  }
  const addInventory = (inventory, orgInventoryData) => {
    orgInventoryData.push(inventory)
  }
  const removeInventory = (inventory, orgInventoryData) => {
    for (let i = 0; i < orgInventoryData.length; ++i) {
      if (orgInventoryData[i].id == inventory.id && orgInventoryData[i].type == inventory.type) {
        orgInventoryData[i].remove = true
      }
    }
    if (inventory.id == selectedInventoryData.id && inventory.type == selectedInventoryData.type) {
      setSelectedInventoryData({})
      setShowDetail(false)
    }
  }
  const changeInventoryAfterAction = (changeData) => {
    let afterInventories = inventories;
    for (let data of changeData) {
      switch (data.action) {
        case 'remove':
          afterInventories = afterInventories.filter((record) => data.elements?.filter((remove) => remove.id == record.id && remove.type == record.type).length == 0)
          break
        case 'edit':
          afterInventories = [...afterInventories.map((record) => record.quantity = data.elements?.filter((edit) => edit.id == record.id && edit.type == record.type)[0]?.quantity)]
          break
        case 'add':
          afterInventories = [...afterInventories, ...data.elements]
          break
      }
    }
    setInventories(afterInventories)
  }

  return (<>
    <div className={`rinventorypanel ${className || ""}`} style={style || {}}>
      <RBackdrop
        open={loadingBar}
        loadingBar={<>
          <CircularProgress color="inherit" />
        </>}
        textContent={<>
          Loading.. It will take a few seconds. :)
        </>}
      />
      {!showDetail ? <>
        <div className='panel-tabs'>
          {tabNames.map((tabName, index) => (
            <div key={index} className={`panel-tab ${tabName == currentTabName ? 'selected' : ''}`} onClick={() => { onTabClick(tabName) }}>
              {getCountsGroupByTabName(tabName) > 0 ?
                <Badge badgeContent={getCountsGroupByTabName(tabName) == 0 ? '' : getCountsGroupByTabName(tabName)} color="warning">
                  {tabName}
                </Badge>
                :
                <>{tabName}</>
              }
            </div>
          ))}
        </div>
        <div className='inventory-list'>
          {inventories.filter(tabFilter).length == 0 ? <><div className='error-inventory'>You have no inventory.</div></> : inventories.filter(tabFilter).map((data, index) => (
            <RInventory key={index} data={data} onShowDetail={() => [play(), onShowDetail(data)]} />
          ))}
        </div>
      </> :
        <>
          <div className='detail-view'>
            {/* back btn */}
            <div className='backBtn' onClick={closeDetail}>
              <KeyboardBackspaceIcon />
            </div>

            <div className='left-panel'>
              <div className='inventory-img'>
                <img src={selectedInventoryData?.image || TestUnitImg} alt={'inventory'} />
                {
                  selectedInventoryData?.type == 'gear' ?
                    <div className='inventory-category'>
                      {selectedInventoryData?.gType.toUpperCase()}
                    </div> : <></>
                }
              </div>
              <div className='inventory-info'>
                <div className='inventory-name'>
                  {selectedInventoryData?.name || 'Test Inventory Name'}
                </div>
                <div className='inventory-quantity'>
                  x {selectedInventoryData?.quantity || 1}
                </div>
              </div>
              <div className='inventory-description'>
                {selectedInventoryData?.description || 'Test Inventory Description Here, you could see the detailed description of the Inventory(Chest)'}
              </div>
            </div>

            <div className='right-panel'>
              {/* upgrade */}
              {(selectedInventoryData?.type == 'gear' || (selectedInventoryData?.type == 'item' && selectedInventoryData?.isAvailable != null)) && selectedInventoryData?.isAvailable ?
                <>
                  <div className='inventory-upgrade-text'>
                    {selectedInventoryData?.upgrade?.isAllowed ?
                      <>You can upgrade the {selectedInventoryData?.type} from <a>{selectedInventoryData?.level}</a> -&gt; <a>{selectedInventoryData?.level + 1}</a></>
                      : <>You can't upgrade the {selectedInventoryData?.type}.  Current level <a>{selectedInventoryData?.level}</a>.</>
                    }
                  </div>
                  <div className='inventory-upgrade-description'>
                    {selectedInventoryData?.type == 'gear' && selectedInventoryData?.gType.toLowerCase() == 'weapon' ?
                      <div className='improvement'>
                        <a>
                          ATK
                        </a>
                        <a>
                          {
                            selectedInventoryData?.flatBuff ?
                              selectedInventoryData?.flatBuff :
                              selectedInventoryData?.percentageBuff + '%'
                          }
                        </a>
                        -&gt;
                        <a>
                          {
                            Object.keys(selectedInventoryData?.upgrade?.nextLevel).length > 0 ?
                              (selectedInventoryData?.upgrade?.nextLevel?.flatBuff ? selectedInventoryData?.upgrade?.nextLevel?.flatBuff : selectedInventoryData?.upgrade?.nextLevel?.percentageBuff + '%') : "?"
                          }
                        </a>
                      </div> : <></>
                    }
                    {selectedInventoryData?.type == 'gear' && selectedInventoryData?.gType.toLowerCase() == 'shield' ?
                      <div className='improvement'>
                        <a>
                          HP
                        </a>
                        <a>
                          {
                            selectedInventoryData?.flatBuff ?
                              selectedInventoryData?.flatBuff : selectedInventoryData?.percentageBuff + '%'}
                        </a>
                        -&gt;
                        <a>
                          {
                            Object.keys(selectedInventoryData?.upgrade?.nextLevel).length > 0 ?
                              (selectedInventoryData?.upgrade?.nextLevel?.flatBuff ?
                                selectedInventoryData?.upgrade?.nextLevel?.flatBuff : selectedInventoryData?.upgrade?.nextLevel?.percentageBuff + '%') : "?"
                          }
                        </a>
                      </div> : <></>
                    }
                    {selectedInventoryData?.type == 'gear' && selectedInventoryData?.gType.toLowerCase() == 'talisman' ?
                      <div className='improvement'>
                        <a>
                          {
                            selectedInventoryData?.buffAttribute}
                        </a>
                        <a>
                          {
                            selectedInventoryData?.flatBuff ?
                              selectedInventoryData?.flatBuff : selectedInventoryData?.percentageBuff + '%'}
                        </a>
                        -&gt;
                        <a>
                          {
                            Object.keys(selectedInventoryData?.upgrade?.nextLevel).length > 0 ?
                              (selectedInventoryData?.upgrade?.nextLevel?.flatBuff ? selectedInventoryData?.upgrade?.nextLevel?.flatBuff : selectedInventoryData?.upgrade?.nextLevel?.percentageBuff + '%') : "?"
                          }
                        </a>
                      </div> : <></>
                    }
                  </div>
                  {selectedInventoryData?.upgrade?.requirements && selectedInventoryData?.upgrade?.requirements.length > 0 ?
                    <>
                      <div className='inventory-cost-text'>
                        Requirements
                      </div>
                      <div className='inventory-costs'>
                        {(selectedInventoryData?.upgrade?.requirements || [0, 1, 2]).map((cost, index) => (
                          <div key={index} className={'inventory-cost' + (cost.isAllowed ? '' : ' notAllowed')} title={cost?.name || 'Drop'}>
                            <div className='inventory-cost-img'>
                              {cost?.name.toLowerCase() == 'pvppoints' ?
                                <img src={PVPPoints} alt={'cost'} />
                                :
                                <img src={cost?.image || TestDropImg} alt={'cost'} />
                              }
                            </div>
                            <div className='inventory-cost-info'>
                              <div className='inventory-cost-name'>
                                {cost?.name || 'Drop'}
                              </div>
                              <div className='inventory-cost-quantity'>
                                x {cost?.quantity || 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </> : ''
                  }
                  <div className='consumables'>
                    {selectedInventoryData.upgrade?.hasConsumables ?
                      <><span className='desc'>Consumable</span>
                        <div className='consumable-panel'>
                          <div
                            className={'consumableBtn' + (selectedInventoryData.upgrade?.isAllowed ? '' : ' notAllowed')}
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
                            {selectedInventoryData.upgrade?.consumables.map((consumable, index) => (
                              consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id && consumable.id != upgradeConsumables[2].id &&
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
                            className={'consumableBtn' + (selectedInventoryData.upgrade?.isAllowed ? '' : ' notAllowed')}
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
                            {selectedInventoryData.upgrade?.consumables.map((consumable, index) => (
                              consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id && consumable.id != upgradeConsumables[2].id &&
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
                          <div
                            className={'consumableBtn' + (selectedInventoryData.upgrade?.isAllowed ? '' : ' notAllowed')}
                            onClick={(e) => { onConsumableBtnClick(e, 'upgrade3') }}
                            id='upgradeConsumableBtn3'
                            aria-controls={consumableOpen == 'upgrade3' ? 'upgradeConsumableMenu3' : undefined}
                            aria-haspopup="true"
                            aria-expanded={consumableOpen == 'upgrade3' ? 'true' : undefined}
                          >
                            {upgradeConsumables[2].id != undefined && <img className='consumable-image' src={upgradeConsumables[2].image}></img>}
                          </div>
                          <Menu
                            id='upgradeConsumableMenu3'
                            anchorEl={consumableAnchorEl}
                            open={consumableOpen == 'upgrade3'}
                            onClose={onCloseConsumable}
                            MenuListProps={{
                              'aria-labelledby': 'upgradeConsumableBtn3',
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
                            {selectedInventoryData.upgrade?.consumables.map((consumable, index) => (
                              consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id && consumable.id != upgradeConsumables[2].id &&
                              <MenuItem key={index} onClick={() => onConsumableClick('upgrade3', consumable)}>
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
                  <div className='inventory-upgrade-action'>
                    <RButton className={`upgradeBtn ${selectedInventoryData?.upgrade?.isAllowed ? '' : 'notAllowed'}`} onClick={onUpgrade}>Upgrade ({`${parseInt(selectedInventoryData?.upgrade?.probability)}`}%)</RButton>
                  </div>

                  <div className='separator'></div>
                </>
                : ''
              }

              {/* craft */}
              {selectedInventoryData?.type == 'recipe' ?
                <>
                  <div className='inventory-drop-text'>
                    What you get
                  </div>
                  <div className='inventory-drops'>
                    {([selectedInventoryData?.craft?.product] || [0, 1, 2]).map((drop, index) => (
                      <div key={index} className='inventory-drop' title={drop?.name || 'Drop'}>
                        <div className='inventory-drop-img'>
                          {drop?.name.toLowerCase() == 'pvppoints' ?
                            <img src={PVPPoints} alt={'cost'} />
                            :
                            <img src={drop?.image || TestDropImg} alt={'drop'} />
                          }
                        </div>
                        <div className='inventory-drop-info'>
                          <div className='inventory-drop-name'>
                            {drop?.name || 'Drop'}
                          </div>
                          <div className='inventory-drop-quantity'>
                            x {drop?.quantity || 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedInventoryData?.craft.requirements && selectedInventoryData?.craft.requirements?.length > 0 ?
                    <>
                      <div className='inventory-cost-text'>
                        Requirements
                      </div>
                      <div className='inventory-costs'>
                        {selectedInventoryData?.craft?.requirements.map((cost, index) => (
                          <div key={index} className={'inventory-cost' + (cost?.isAllowed ? '' : ' notAllowed')} title={(cost?.burn ? consumableSlots[index]?.name : cost?.name) || 'no selected'}>
                            {cost?.burn != 1 && <div className='inventory-cost-img'>
                              {cost?.name.toLowerCase() != "pvppoints" ?
                                < img src={cost?.image || TestDropImg} alt={'cost'} />
                                :
                                < img src={PVPPoints} alt={'cost'} />
                              }
                            </div>}
                            {cost?.burn == 1 &&
                              <>
                                <div
                                  className={'consumableBtn'}
                                  onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + index) }}
                                  id={'consumableSlot' + index}
                                  aria-controls={consumableOpen == 'consumableSlot' + index ? 'consumableSlotMenu' + index : undefined}
                                  aria-haspopup="true"
                                  aria-expanded={consumableOpen == 'consumableSlot' + index ? 'true' : undefined}
                                >
                                  {consumableSlots[index] != undefined && <img className='consumable-image' src={consumableSlots[index].image || TestDropImg}></img>}
                                </div>
                                <Menu
                                  id={'consumableSlotMenu' + index}
                                  anchorEl={consumableAnchorEl}
                                  open={consumableOpen == 'consumableSlot' + index}
                                  onClose={onCloseConsumable}
                                  MenuListProps={{
                                    'aria-labelledby': 'craftConsumableBtn',
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
                                    No More Tools
                                  </div>
                                  {toolList?.filter((record) => record.type == cost?.type).map((tool, tIndex) => (
                                    (consumableSlots[index] == undefined || consumableSlots[index].id != tool.id) && tool.idGearLevel == cost.idToolLevel && tool.level == cost.level &&
                                    <MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, index, tool.type)}>
                                      <img className='consumableImage' src={tool.image || TestDropImg}></img>
                                      <div className='consumableDesc'>
                                        {/* <BonusBar info={tool.bonuses} /> */}
                                        <span className='slotDurability'>{tool.name}</span>
                                        <span className={'slotName' + tool.rarity}>x {cost.quantity}</span>
                                      </div>
                                    </MenuItem>
                                  ))}
                                </Menu>
                              </>
                            }
                            <div className='inventory-cost-info'>
                              <div className='inventory-cost-name'>
                                {(cost?.burn ? consumableSlots[index]?.name : cost?.name) || 'no selected'}
                              </div>
                              <div className='inventory-cost-quantity'>
                                x {cost?.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </> : ''
                  }
                  <div className='consumables'>
                    {selectedInventoryData.craft.hasConsumables ?
                      <><span className='desc'>Consumable</span>
                        <div className='consumable-panel'>
                          <div
                            className={'consumableBtn' + (selectedInventoryData.craft.isAllowed ? '' : ' notAllowed')}
                            onClick={(e) => { onConsumableBtnClick(e, 'craft1') }}
                            id='craftConsumableBtn1'
                            aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu1' : undefined}
                            aria-haspopup="true"
                            aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                          >
                            {craftConsumables[0].id != undefined && <img className='consumable-image' src={craftConsumables[0].image}></img>}
                          </div>
                          <Menu
                            id='craftConsumableMenu1'
                            anchorEl={consumableAnchorEl}
                            open={consumableOpen == 'craft1'}
                            onClose={onCloseConsumable}
                            MenuListProps={{
                              'aria-labelledby': 'craftConsumableBtn1',
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
                            {selectedInventoryData.craft.consumables.map((consumable, index) => (
                              consumable.id != craftConsumables[0].id && consumable.id != craftConsumables[1].id &&
                              <MenuItem key={index} onClick={() => onConsumableClick('craft1', consumable)}>
                                <img className='consumableImage' src={consumable.image}></img>
                                <div className='consumableDesc'>
                                  <span className='consumableQuantity'>x {consumable.quantity}</span>
                                  <span className='consumableName'>{consumable.name}</span>
                                  <span className='consumableDescription'>{consumable.description}</span>
                                </div>
                              </MenuItem>
                            ))}
                          </Menu>
                          <div
                            className={'consumableBtn' + (selectedInventoryData.craft.isAllowed ? '' : ' notAllowed')}
                            onClick={(e) => { onConsumableBtnClick(e, 'craft2') }}
                            id='craftConsumableBtn2'
                            aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu2' : undefined}
                            aria-haspopup="true"
                            aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                          >
                            {craftConsumables[1].id != undefined && <img className='consumable-image' src={craftConsumables[1].image}></img>}
                          </div>
                          <Menu
                            id='craftConsumableMenu2'
                            anchorEl={consumableAnchorEl}
                            open={consumableOpen == 'craft2'}
                            onClose={onCloseConsumable}
                            MenuListProps={{
                              'aria-labelledby': 'craftConsumableBtn2',
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
                            {selectedInventoryData.craft.consumables.map((consumable, index) => (
                              consumable.id != craftConsumables[0].id && consumable.id != craftConsumables[1].id &&
                              <MenuItem key={index} onClick={() => onConsumableClick('craft2', consumable)}>
                                <img className='consumableImage' src={consumable.image}></img>
                                <div className='consumableDesc'>
                                  <span className='consumableQuantity'>x {consumable.quantity}</span>
                                  <span className='consumableName'>{consumable.name}</span>
                                  <span className='consumableDescription'>{consumable.description}</span>
                                </div>
                              </MenuItem>
                            ))}
                          </Menu>
                        </div>
                        <div className='resetBtn'>
                          <Button variant="contained" onClick={() => onResetConsumables('craft')}>
                            Reset
                          </Button>
                        </div></> :
                      <div className='noConsumableText'>
                        No Consumable
                      </div>}
                  </div>
                  <div className='inventory-craft-text'>
                    You can craft max {maxPossibleCraftCount} recipes at a time.
                  </div>
                  <div className='inventory-craft-action'>
                    <RInput className={`craftQuantityInput ${selectedInventoryData?.craft.isAllowed ? '' : 'notAllowed'}`} type={'number'} placeholder={'Ex: 1'} value={craftQuantity} onChange={onCraftQuantityChange} />
                    <RButton className={`craftBtn ${craftQuantity <= 0 || !selectedInventoryData?.craft.isAllowed ? 'notAllowed' : ''}`} disabled={craftQuantity <= 0} onClick={onCraft}>Craft ({`${parseInt(selectedInventoryData?.craft?.probability)}`}%)</RButton>
                  </div>

                  <div className='separator'></div>
                </>
                : ''
              }

              {/* open chest */}
              {selectedInventoryData?.type == 'item' && selectedInventoryData.isChest ?
                <>
                  <div className='inventory-drop-text'>
                    What you get
                  </div>
                  <div className='inventory-drops'>
                    {(selectedInventoryData?.chest.loots || [0, 1, 2]).map((drop, index) => (
                      <div key={index} className='inventory-drop' title={drop?.name || 'Drop'}>
                        <div className='inventory-drop-img'>
                          <img src={drop?.image || TestDropImg} alt={'drop'} />
                        </div>
                        <div className='inventory-drop-info'>
                          <div className='inventory-drop-name'>
                            {drop?.name || 'Drop'}
                          </div>
                          <div className='inventory-drop-quantity'>
                            x {drop?.quantity || 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedInventoryData?.chest.requirements && selectedInventoryData?.chest.requirements.length > 0 ?
                    <>
                      <div className='inventory-cost-text'>
                        Requirements
                      </div>
                      <div className='inventory-costs'>
                        {(selectedInventoryData?.chest.requirements || [0, 1, 2]).map((cost, index) => (
                          <div key={index} className={'inventory-cost' + (cost?.isAllowed ? '' : ' notAllowed')} title={cost?.name || 'Drop'}>
                            <div className='inventory-cost-img'>
                              <img src={cost?.image} alt={'cost'} />
                            </div>
                            <div className='inventory-cost-info'>
                              <div className='inventory-cost-name'>
                                {cost?.name || 'Drop'}
                              </div>
                              <div className='inventory-cost-quantity'>
                                x {cost?.quantity || 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </> : ''
                  }
                  <div className='inventory-open-text'>
                    You can open max min {selectedInventoryData?.chest.minDrops} (max {selectedInventoryData?.chest.maxDrops}) chests at a time.
                  </div>
                  <div className='inventory-open-action'>
                    <RInput className='openQuantityInput' type={'number'} placeholder={'Ex: 1'} value={openQuantity} onChange={onOpenQuantityChange} />
                    <RButton className={`openChestBtn ${openQuantity <= 0 ? 'notAllowed' : ''}`} disabled={openQuantity <= 0} onClick={onOpenChest}>Open</RButton>
                  </div>

                  <div className='separator'></div>
                </>
                : ''
              }

              {/* send */}
              {selectedInventoryData?.menu?.send ?
                <>
                  <div className='inventory-send-text'>
                    Do you want to send this item?
                  </div>
                  <div className='inventory-send-description'>
                    You can send max <a>10</a> items at a once.
                  </div>
                  <div className='inventory-send-action'>
                    <RInput className='sendAddressInput' type={'text'} placeholder={'0x000000 / ens.eth'} value={sendAddress} onChange={onSendAddressChange} />
                    {selectedInventoryData?.type != 'gear' ?
                      <RInput min='1' className={`sendQuantityInput `} type={'number'} placeholder={'Ex: 1'} value={sendQuantity} onChange={onSendQuantityChange} />
                      : ''
                    }
                    <RButton className={`sendChestBtn ${(sendQuantity <= 0) || sendAddress == '' || !(isAddress(sendAddress) || isColonyAddress(sendAddress) || isENS(sendAddress)) ? 'notAllowed' : ''}`} disabled={(sendQuantity <= 0) || sendAddress == '' || !(isAddress(sendAddress) || isColonyAddress(sendAddress) || isENS(sendAddress))} onClick={onSendItem}>Send</RButton>
                  </div>
                  <div className="separator"></div>
                </>
                :
                ""
              }

              {/* sell */}
              {selectedInventoryData?.menu?.sell ?
                <>
                  <div className='inventory-sell-text'>
                    Do you want to sell this item?
                  </div>
                  <div className='inventory-sell-description'>
                    {/* You can send max <a>10</a> items at a once. */}
                  </div>
                  <div className='inventory-sell-action'>
                    <div className='sell-input-item'>
                      <span style={{ width: '90px' }}>Price per unit : </span><RInput className='sellPriceInput' type={'number'} placeholder={'Price per unit'} value={sellPrice} onChange={onSellPriceChange} title={'price'} />
                    </div>
                    {selectedInventoryData?.type != 'gear' ?
                      <>
                        <div className='sell-input-item'>
                          <span style={{ width: '80px' }}>Quantity : </span>
                          <RInput min='1' className={`sellQuantityInput `} type={'number'} placeholder={'Ex: 1'} value={sellQuantity} onChange={onSellQuantityChange} />
                        </div>
                      </>
                      : ''
                    }
                    <div className='sell-input-item'>
                      <span style={{ width: '60px' }}>Day : </span><RInput className='sellDayInput' type={'number'} placeholder={'Day'} value={sellDay} onChange={onSellDayChange} title={'day'} />
                    </div>
                    <div className='sell-input-item'>
                      <span style={{ width: '60px' }}>Hour : </span><RInput className='sellHourInput' type={'number'} placeholder={'Hour'} value={sellHour} onChange={onSellHourChange} title={'day'} />
                    </div>
                    <RButton className={`sellChestBtn ${(sellQuantity <= 0) || sellPrice <= 0 || (sellDay * 24 * 3600 + sellHour * 3600) <= 0 ? 'notAllowed' : ''}`} disabled={(sellQuantity <= 0) || sellPrice <= 0 || sellDay <= 0 || sellHour <= 0} onClick={onSellItem}>Sell</RButton>
                  </div>
                  <div className="separator"></div>
                </>
                :
                ""
              }
            </div>
          </div>
        </>}
    </div>
    <RModal
      className={'inventoryConfirmModal'}
      style={''}
      open={confirmModalOpen}
      title={actionType}
      content={<>
        {onDoing ?
          <div className='api-loading' style={{ 'position': 'relative' }}>
            {<span className='apiCallLoading'></span>}
            <span className={'loader ' + confirmActionType + '-loader'}></span>
          </div> : ''
        }
        <div className='upgrade-confirm-text'>
          {
            confirmActionType == 'upgrade' ? <>
              Are you sure you want to upgrade?<br />
              {upgradeConsumables[0].id == 1 || upgradeConsumables[1].id == 1 ? 'The upgrade can fail but the tool will never downgrade.' : 'The upgrade can fail and the tool could be downgraded.'}
              <br />
              Probability of Success: <a>{Math.min((upgradeConsumables[0].id == 2 || upgradeConsumables[1].id == 2 ? 10 : 0) + (upgradeConsumables[0].id == 6 || upgradeConsumables[1].id == 6 ? 5 : 0) + (upgradeConsumables[0].id == 7 || upgradeConsumables[1].id == 7 ? 15 : 0) + selectedInventoryData.upgrade?.probability, 100)}%</a>
            </> :
              confirmActionType == 'craft' ? (slotNeed ? 'You should select the tools to be burnt.' : <>
                Do you want to craft <a>{craftQuantity}</a> recipes? Crafting recipe could fail.<br />
                Probability of Success: <a>{selectedInventoryData.craft?.probability}%</a><br />
                Multiple crafting could take some time, max a few minutes.
              </>) :
                confirmActionType == 'sell' ? <>
                  Do you want to sell <a>{sellQuantity} {selectedInventoryData.name}</a> for <a>{toFixed(sellQuantity * sellPrice)} Ancien</a>?
                  {serverConfig?.features.fee.marketplaceFee &&
                    <>
                      <br />
                      You will pay a <a>{serverConfig?.features.fee.marketplaceFeeValue * 100}%</a> (<a style={{ margin: "0px 3px", color: "lime", fontSize: "1.3rem" }}>{format(toFixed(sellQuantity * sellPrice * serverConfig?.features.fee.marketplaceFeeValue))}</a>) fee on your sale.
                    </>}
                </> :
                  confirmActionType == 'send' ? <>Do you want to send <a>{sendQuantity} {selectedInventoryData.name}</a>  to <a>{
                    isENS(sendAddress)
                      ? !isAddress(sendResolvedAddress) ? <CircularProgress size={20} sx={{ color: "white" }} /> : sendResolvedAddress
                      : sendAddress
                  }</a>
                    ?</>
                    :
                    confirmActionType == 'open' ? <>Do you want to send <a>{selectedInventoryData.name}</a> Chest?
                    </>
                      : ''
          }
        </div>

      </>}
      actions={<>
        <RButton onClick={onSureAction}>Sure</RButton>
      </>}
      onClose={onCancelAction}
    />
    <DialogContent>
      <DialogContentText>
        {
          confirmActionType == 'upgrade' ? <>
            Are you sure you want to upgrade?<br />
            {upgradeConsumables[0].id == 1 || upgradeConsumables[1].id == 1 ? 'The upgrade can fail but the tool will never downgrade.' : 'The upgrade can fail and the tool could be downgraded.'}
            <br />
            Probability of Success: {Math.min((upgradeConsumables[0].id == 2 || upgradeConsumables[1].id == 2 ? 10 : 0) + (upgradeConsumables[0].id == 6 || upgradeConsumables[1].id == 6 ? 5 : 0) + (upgradeConsumables[0].id == 7 || upgradeConsumables[1].id == 7 ? 15 : 0) + selectedInventoryData.upgrade?.probability, 100)}%
          </> :
            confirmActionType == 'craft' ? (slotNeed ? 'You should select the tools to be burnt' : <>
              Do you want to craft {craftQuantity} recipes? Crafting recipe could fail.<br />
              Probability of Success: {selectedInventoryData.craft?.probability}%<br />
              Multiple crafting could take some time, max a few minutes.
            </>) :
              confirmActionType == 'sell' ? <>
                Do you want to sell {sellQuantity} {selectedInventoryData.name} for {toFixed(sellQuantity * sellPrice)} Ancien?
                {serverConfig?.features.fee.marketplaceFee &&
                  <>
                    <br />
                    You will pay a {serverConfig?.features.fee.marketplaceFeeValue * 100}% (<a style={{ margin: "0px 3px", color: "lime", fontSize: "1.3rem" }}>{format(toFixed(sellQuantity * sellPrice * serverConfig?.features.fee.marketplaceFeeValue))}</a>) fee on your sale
                  </>}
              </> :
                confirmActionType == 'send' ? <>Do you want to send {sendQuantity} {selectedInventoryData.name}  to {
                  isENS(sendAddress)
                    ? !isAddress(sendResolvedAddress) ? <CircularProgress size={20} sx={{ color: "white" }} /> : sendResolvedAddress
                    : sendAddress
                }
                  ?</>
                  : ''
        }
      </DialogContentText>
    </DialogContent>
  </>)
}

export default RInventoryPanel