import './rcardpanel.scss';
import '../../../game/game.scss';
import './modal/equipmodal.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';
import useSound from 'use-sound';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SellIcon from '@mui/icons-material/SellOutlined';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import {
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  animated,
  useSpring,
} from '@react-spring/web';
import { warning } from '@remix-run/router';

import { serverConfig } from '../../../../config/serverConfig';
import { playSound } from '../../../../utils/sounds';
import {
  format,
  toFixed,
} from '../../../../utils/utils';
import PVPPoints from '../../assets/basic/PVPPoints.png';
import shield_back_img from '../../assets/card-panel/shield_back.jpg';
import talisman_back_img from '../../assets/card-panel/talisman_back.jpg';
import weapon_back_img from '../../assets/card-panel/weapon_back.jpg';
import TestUnitImg from '../../assets/dashboard/cards-menu.png';
import TestDropImg from '../../assets/inventory-panel/chest.png';
import RBackdrop from '../basic/backdrop/RBackdrop';
import RButton from '../basic/button/RButton';
import RInput from '../basic/input/RInput';
import RModal from '../basic/modal/RModal';
import RSelector from '../basic/selector/RSelector';
import RPaginationPanel from '../basic/table/RPaginationPanel';
import RCard from './card/RCard';

function RCardPanel(props) {
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
  // basic attr className|style
  const [className, setClassName] = useState(props.className)
  const [progress, setProgress] = useState({ width: '0%' })
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  // spring animation
  const [styles, api] = useSpring(
    () => ({
      x: 0,
      y: 0,
      rotateZ: 0,
      opacity: 0,
    }),
    []
  );


  const [startAnimation, setStartAnimation] = useState(false)

  useEffect(() => {
    startAnimation ?
      api.start({
        to: [{ opacity: 1, rotateZ: 0 }]
      })
      :
      api.start({
        to: [{ opacity: 1, rotateZ: 0 }]
      })
    if (!startAnimation) {
      setTimeout(() => { setStartAnimation(true) }, 800)
    }
  }, [startAnimation])

  // open or close modal
  const [onDoing, setOnDoing] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [sellModal, setSellModal] = useState(false)
  const [filterValue, setFilterValue] = useState('level')
  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])
  const [confirmActionType, setConfirmActionType] = useState(null)
  const onSellModalShow = () => {
    setSellModal(true)
    setModalTitle('Sell')
    setConfirmActionType('sell')
    setSellDay(1)
    setSellHour(1)
    setSellPrice(1)
  }

  const onSellCancelAction = () => {
    setSellModal(false)
  }

  const onSellAction = () => {
    setConfirmModalOpen(true);
  }

  // sort by
  const onCardViewSelectorChange = async (value) => {
    await setFilterValue(value)
    setStartAnimation(false)
    let newCards = (value == 'level') ? cards.sort((curr, next) => { return next.level - curr.level }) : cards.sort((curr, next) => { return curr.category < next.category ? 1 : -1 })
    newCards = (value == 'rarity') ? [...cards.filter(item => item.rarity.toLowerCase() == 'legendary'), ...cards.filter(item => item.rarity.toLowerCase() == 'epic'), ...cards.filter(item => item.rarity.toLowerCase() == 'rare'), ...cards.filter(item => item.rarity.toLowerCase() == 'normal')] : newCards
    setCards([...newCards])
  }
  // cards
  const [loadingBar, setLoadingBar] = useState(false)
  const [cards, setCards] = useState([]);
  useEffect(() => {
    console.log('get all cards')
    getAllCards()
    setMaxRowAndColumn()
  }, [])

  useEffect(() => {
    setAllCardAffect(cards)
  }, [cards])

  const setAllCardAffect = (cards) => {
    let affectAll = []

    for (let i = 0; i < cards.length; i++) {
      let affects = [0, 0, 0, 0]

      if (cards[i]?.shield) {
        affects[1] += cards[i]?.shield.percentageBuff ? cards[i]?.hp * cards[i]?.shield.percentageBuff / 100 : (cards[i]?.shield.flatBuff != null ? cards[i]?.shield.flatBuff : 0)
      }
      if (cards[i]?.weapon) {
        affects[0] += cards[i]?.weapon.percentageBuff ? cards[i]?.attack * cards[i]?.weapon.percentageBuff / 100 : (cards[i]?.weapon.flatBuff != null ? cards[i]?.weapon.flatBuff : 0)
      }
      if (cards[i]?.talisman) {
        if (cards[i]?.talisman.buffAttribute == 'ATK') {
          affects[0] += cards[i]?.talisman.percentageBuff ? cards[i]?.attack * cards[i]?.talisman.percentageBuff / 100 : (cards[i]?.talisman.flatBuff != null ? cards[i]?.talisman.flatBuff : 0)
        }
        if (cards[i]?.talisman.buffAttribute == 'HP') {
          affects[1] += cards[i]?.talisman.percentageBuff ? cards[i]?.hp * cards[i]?.talisman.percentageBuff / 100 : (cards[i]?.talisman.flatBuff != null ? cards[i]?.talisman.flatBuff : 0)
        }
        if (cards[i]?.talisman.buffAttribute == 'SPEED') {
          affects[2] += cards[i]?.talisman.percentageBuff ? cards[i]?.speed * cards[i]?.talisman.percentageBuff / 100 : (cards[i]?.talisman.flatBuff != null ? cards[i]?.talisman.flatBuff : 0)
        }
        if (cards[i]?.talisman.buffAttribute == 'RANGE') {
          affects[3] += cards[i]?.talisman.percentageBuff ? cards[i]?.range * cards[i]?.talisman.percentageBuff / 100 : (cards[i]?.talisman.flatBuff != null ? cards[i]?.talisman.flatBuff : 0)
        }
      }
      affectAll[cards[i].id] = affects.map(aff => Math.ceil(aff))
    }
    setAffectAll(affectAll)
  }

  window.addEventListener('resize', function () {
    setMaxRowAndColumn()
    setPage(1)
  }, true)

  const getAllCards = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getCardList", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          let newCards = JSON.parse(JSON.stringify(response.data.data))
          newCards.sort((curr, next) => { return next.level - curr.level })
          setCards(newCards)
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }
  // detail view handling
  const [showDetail, setShowDetail] = useState(false)
  const [selectedCardData, setSelectedCardData] = useState({})
  const onShowDetail = (cardData) => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getCardInstance", {
        address: props.metamask,
        idCardInstance: cardData.id || cardData.idCardInstance,
      })
      .then((response) => {
        if (response.data.success) {
          // show selected inventory details
          setSelectedCardData(JSON.parse(JSON.stringify(response.data.data.data)))
          if (response.data.data?.data?.chanceUpgrade != null) {
            setProgress({ width: response.data.data.data.chanceUpgrade + '%' })
          }
          else {
            setProgress({ width: '0%' })
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

  useEffect(() => {
    let affects = [0, 0, 0, 0]
    if (selectedCardData?.shieldSlot) {
      affects[1] += selectedCardData?.shieldSlot.percentageBuff ? selectedCardData?.hp * selectedCardData?.shieldSlot.percentageBuff / 100 : (selectedCardData?.shieldSlot.flatBuff != null ? selectedCardData?.shieldSlot.flatBuff : 0)
    }
    if (selectedCardData?.weaponSlot) {
      affects[0] += selectedCardData?.weaponSlot.percentageBuff ? selectedCardData?.attack * selectedCardData?.weaponSlot.percentageBuff / 100 : (selectedCardData?.weaponSlot.flatBuff != null ? selectedCardData?.weaponSlot.flatBuff : 0)
    }
    if (selectedCardData?.talismanSlot) {
      if (selectedCardData?.talismanSlot.buffAttribute == 'ATK') {
        affects[0] += selectedCardData?.talismanSlot.percentageBuff ? selectedCardData?.attack * selectedCardData?.talismanSlot.percentageBuff / 100 : (selectedCardData?.talismanSlot.flatBuff != null ? selectedCardData?.talismanSlot.flatBuff : 0)
      }
      if (selectedCardData?.talismanSlot.buffAttribute == 'HP') {
        affects[1] += selectedCardData?.talismanSlot.percentageBuff ? selectedCardData?.hp * selectedCardData?.talismanSlot.percentageBuff / 100 : (selectedCardData?.talismanSlot.flatBuff != null ? selectedCardData?.talismanSlot.flatBuff : 0)
      }
      if (selectedCardData?.talismanSlot.buffAttribute == 'SPEED') {
        affects[2] += selectedCardData?.talismanSlot.percentageBuff ? selectedCardData?.speed * selectedCardData?.talismanSlot.percentageBuff / 100 : (selectedCardData?.talismanSlot.flatBuff != null ? selectedCardData?.talismanSlot.flatBuff : 0)
      }
      if (selectedCardData?.talismanSlot.buffAttribute == 'RANGE') {
        affects[3] += selectedCardData?.talismanSlot.percentageBuff ? selectedCardData?.range * selectedCardData?.talismanSlot.percentageBuff / 100 : (selectedCardData?.talismanSlot.flatBuff != null ? selectedCardData?.talismanSlot.flatBuff : 0)
      }
    }
    setAffect(affects.map(aff => Math.ceil(aff)))
  }, [selectedCardData])

  const openDetail = () => {
    setShowDetail(true)
  }
  const closeDetail = () => {
    setShowDetail(false)
  }

  const onUpgradeMacro = () => {
    setConfirmActionType('upgrade')
    setConfirmModalOpen(true)
  }

  const onSureAction = () => {
    setOnDoing(true)
    setOnLoading(true)
    if (confirmActionType == 'upgrade') {
      axios
        .post("/api/m1/pvp/upgradeCard", {
          address: props.metamask,
          idCardInstance: selectedCardData?.idCardInstance,
          consumableIds: []
        })
        .then((response) => {
          if (response.data.success) {
            // set user inventories from server
            if (response.data.data.done) {
              success(response.data.data.message)
              onShowDetail(selectedCardData)
              // let changeCardData = cards.filter(card => card.id == selectedCardData.idCardInstance)[0]
              // changeCardData.level++
              // let datas = [...cards.filter(card => card.id == selectedCardData.idCardInstance ? card = changeCardData : card)]
              updateCards(response.data.data)
              // onCardViewSelectorChange(filterValue)
            }
            else {
              notify(response.data.data.message)
            }
          }
          else {
            notify('Upgrade failed. Please retury.')
          }
          setOnDoing(false)
          setOnLoading(false)
          setConfirmModalOpen(false)
        })
        .catch((error) => {
          console.log(error)
          setOnDoing(false)
          setConfirmModalOpen(false)
          setOnLoading(false)
        });
    }
    else if (confirmActionType == 'sell') {
      axios.post('/api/m1/marketplaceInventory/createAd', {
        address: props.metamask,
        inventoryType: 'card',
        id: selectedCardData?.idCardInstance,
        level: selectedCardData?.level,
        isPvp: true,
        quantity: 1,
        price: sellPrice,
        duration: (sellDay * 24 * 3600 + sellHour * 3600)
      })
        .then(response => {
          if (response.data.success) {
            if (response.data?.data.done) {
              success('You sold this card successfully.')
              setShowDetail(false);
              setConfirmModalOpen(false);
              setSellModal(false)
              getAllCards()
            }
            else {
              warning("You can't sell this card.")
            }
          }
          else {
            warning("You can't sell this card.")
          }
          setOnDoing(false)
        })
        .catch(error => {
          setOnDoing(false)
          warning("You can't sell this card.")
        })
    }
  }

  const updateCards = async (data) => {
    if (data.done && data.inventory) {
      let orgCardData = JSON.parse(JSON.stringify(cards))
      let orgCurrentCard = JSON.parse(JSON.stringify(selectedCardData))
      const inventory = data.inventory
      for (let i = 0; i < inventory.length; ++i) {
        const elements = inventory[i].elements
        for (let j = 0; j < elements.length; ++j) {
          const action = inventory[i].action, element = elements[j]
          if (action == 'edit') {
            if (element.type == 'card') {
              editCard(element, orgCardData, orgCurrentCard)
            }
          } else if (action == 'add') {
            if (element.type == 'card') {
              addCard(element, orgCardData)
            }
          } else if (action == 'remove') {
            if (element.type == 'card') {
              removeCard(element, orgCardData)
            }
          }
        }
      }
      var newCardData = []
      for (let i = 0; i < orgCardData.length; ++i) {
        if (orgCardData[i].remove) {
          continue
        }
        newCardData.push(orgCardData[i])
      }
      await setCards(orgCardData)
    }


    if (data.done && data.storage) {
      let storage = data.storage
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

  const editCard = (card, orgCardData, orgCurrentCard) => {
    let temp
    for (let i = 0; i < orgCardData.length; i++) {
      if (orgCardData[i].id == card.idCardInstance) {
        temp = orgCardData[i]
        temp.attack = card.attack
        temp.speed = card.speed
        temp.range = card.range
        temp.hp = card.hp
        temp.level = card.level
      }
    }
    orgCardData = [...orgCardData.filter(c => { return c.id == card.idCardInstance ? c : temp })]
  }

  const addCard = (card, orgCardData) => {
    // if (orgCardData.filter(old => old.id === card.idCardInstance).length == 0) {

    // }
  }

  const removeInventory = (card, orgCardData) => {
    for (let i = 0; i < orgCardData.length; ++i) {
      if (orgCardData[i].id == card.idCardInstance) {
        orgCardData[i].remove = true
      }
    }
    if (card.idCardInstance == selectedCardData?.id) {
      setSelectedCardData({})
      setShowDetail(false)
    }
  }

  const onCancelAction = () => {
    setEquipShow(false)
    setConfirmModalOpen(false)
    setOnDoing(false)
  }

  const notify = (error) => toast.error(error);
  const success = (message) => toast.success(message);

  // equip modal
  const [equipShow, setEquipShow] = useState(false)
  const [equipData, setEquipData] = useState([])
  const [equipType, setEquipType] = useState('')
  const [activeItem, setActiveItem] = useState(0)
  const [activeItemImg, setActiveItemImg] = useState(null)
  const [activeSlotID, setActiveSlotID] = useState(0)
  const [modalTitle, setModalTitle] = useState('')
  const showEquipModal = (type) => {
    setEquipType(type)
    setPage(1)
    let tmp = []
    let title = ''
    let tmp_activeitem = 0
    switch (type) {
      case 'shield':
        tmp = selectedCardData?.shieldsAvailable
        title = "Equip Shield"
        tmp_activeitem = tmp.filter((item) => item.idGearInstance == selectedCardData?.shieldSlot?.idGearInstance).length > 0 ? selectedCardData?.shieldSlot.idGearInstance : 0
        break;
      case 'talisman':
        tmp = selectedCardData?.talismansAvailable
        title = "Equip talisman"
        tmp_activeitem = tmp.filter((item) => item.idGearInstance == selectedCardData?.talismanSlot?.idGearInstance).length > 0 ? selectedCardData?.talismanSlot.idGearInstance : 0
        break;
      case 'weapon':
        tmp = selectedCardData?.weaponsAvailable
        title = "Equip Weapon"
        tmp_activeitem = tmp.filter((item) => item.idGearInstance == selectedCardData?.weaponSlot?.idGearInstance).length > 0 ? selectedCardData?.weaponSlot.idGearInstance : 0
        break;
    }
    setModalTitle(title)
    setEquipShow(true)
    setOnLoading(false)
    setApiLoading(false)
    setEquipData(tmp)
    setActiveItem(tmp_activeitem)
    setActiveSlotID(tmp_activeitem)
  }

  // loading bar
  const [onLoading, setOnLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)

  const [pageSize, setPageSize] = useState(8)
  const [page, setPage] = useState(1)
  const goToPrevPage = () => {
    playSound('button')
    if (page > 1) {
      setPage(page - 1)
    }
  }
  const goToNextPage = () => {
    playSound('button')
    var inventoryCount = 0
    for (var i = 0; i < equipData.length; ++i) {
      ++inventoryCount
    }
    if (page * pageSize < inventoryCount) {
      setPage(page + 1)
    }
  }

  const clickEquipData = (data) => {
    setActiveItem(data?.idGearInstance)
    setActiveItemImg(data?.image)
    playSound('button')
  }

  const onEquipItem = () => {
    playSound('confirm')
    setApiLoading(true)
    axios
      .post("/api/m1/pvp/changeGear", {
        address: props.metamask,
        idCardInstance: selectedCardData?.idCardInstance,
        idGearInstance: activeItem,
        slot: equipType,
      })
      .then((response) => {
        if (response.data.success) {
          if (response.data.data.done) {
            success('The gear is successfully equiped')
            onShowDetail(selectedCardData)
            let changeCardData = cards.filter(card => card.id == selectedCardData.idCardInstance)[0]
            if (equipType == 'weapon') {
              changeCardData.weapon ? changeCardData.weapon.image = null : changeCardData.weapon = {}
              changeCardData.weapon.image = activeItemImg
            }
            if (equipType == 'talisman') {
              changeCardData.talisman ? changeCardData.talisman.image = null : changeCardData.talisman = {}
              changeCardData.talisman.image = activeItemImg
            }
            if (equipType == 'shield') {
              changeCardData.shield ? changeCardData.shield.image = null : changeCardData.shield = {}
              changeCardData.shield.image = activeItemImg
            }
            setCards([...cards.filter(card => card.id == selectedCardData.idCardInstance ? card = changeCardData : card)])
          }
          else {
            notify('Equip the gear is failed')
          }
        }
        else {
          notify(response.data.error?.errorMessage)
        }
        setEquipShow(false)
        setApiLoading(false)
        setOnDoing(false)
      })
      .catch((error) => {
        notify(error.response?.data.error?.errorMessage)
        console.log(error)
        setApiLoading(false)
        setOnDoing(false)
        setEquipShow(false)
      });
  }
  const onUnEquipItem = () => {
    playSound('confirm')
    setApiLoading(true)
    axios
      .post("/api/m1/pvp/unequipGear", {
        address: props.metamask,
        idCardInstance: selectedCardData?.idCardInstance,
        idGearInstance: activeItem,
      })
      .then((response) => {
        if (response.data.success) {
          if (response.data.data.done) {
            success('The gear is successfully unequiped')
            onShowDetail(selectedCardData)
            let changeCardData = cards.filter(card => card.id == selectedCardData.idCardInstance)[0]
            if (equipType == 'weapon')
              changeCardData.weapon.image = null
            if (equipType == 'talisman')
              changeCardData.talisman.image = null
            if (equipType == 'shield')
              changeCardData.shield.image = null

            setCards([...cards.filter(card => card.id == selectedCardData.idCardInstance ? card = changeCardData : card)])
          }
          else {
            notify('Unequip the gear is failed')
          }
        }
        else {
          notify(response.data.error?.errorMessage)
        }
        setEquipShow(false)
        setApiLoading(false)
        setOnDoing(false)
      })
      .catch((error) => {
        notify(error.response?.data?.error?.errorMessage)
        console.log(error)
        setApiLoading(false)
        setOnDoing(false)
        setEquipShow(false)
      });
  }

  // affects of the equipments ["Attack", "Hp", "Speed", "Range"]
  const [affect, setAffect] = useState([0, 0, 0, 0]) /* selected card affect */
  const [affectAll, setAffectAll] = useState([]) /* all cards affect */

  // sell options
  const [sellQuantity, setSellQuantity] = useState(1)
  const [sellPrice, setSellPrice] = useState(1)
  const [sellDay, setSellDay] = useState(1)
  const [sellHour, setSellHour] = useState(1)

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

  useEffect(() => {
    if (affectAll) {
      let data = affectAll
      if (data[selectedCardData?.idCardInstance]) {
        data[selectedCardData?.idCardInstance] = affect
        setAffectAll(data)
      }
    }
  }, [affect])

  const setMaxRowAndColumn = () => {
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight

    if (width <= 800) setPageSize(4)
    else setPageSize(8)
  }

  return (<>
    <div className={`rcardpanel ${className || ""}`} style={style || {}}>
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
        <div className='card-selector'>
          <RSelector
            id='card-view-selector'
            label={'View by'}
            value={filterValue}
            menus={[
              { name: 'Levels', value: 'level' },
              { name: 'Types', value: 'type' },
              { name: 'Rarity', value: 'rarity' },
            ]}
            onChange={onCardViewSelectorChange}
          />
        </div>
        <div className='card-list'>
          {cards.length == 0 ? <><div className='error-inventory'>You have no card.</div></> : cards.map((data, index) => (
            <animated.div
              className="animation-slots"
              style={{
                ...styles,
                cursor: "pointer",
              }}
              key={index}
            >
              <RCard className={data?.rarity == "LEGENDARY" ? 'legendary' : data?.rarity.toLowerCase()} key={index} data={data} requirements={''} quantity={data?.quantity} onShowDetail={() => [play(), onShowDetail(data)]} affect={affectAll[data.id] ? affectAll[data.id] : [0, 0, 0, 0]} />
            </animated.div>
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
              <div className='card-img'>
                <div className={`unit-back-img  ${selectedCardData?.category?.toLowerCase()}`}></div>
                <img src={selectedCardData?.image || TestUnitImg} alt={'card'} />
                <div className='card-category'>
                  {selectedCardData?.category.toUpperCase()}
                </div>
              </div>
              <div className='card-info'>
                <div className='card-name'>
                  {selectedCardData?.name || 'Test Card Name'}
                </div>
              </div>
              <div className='card-detail-info'>
                <div className='unit-info'>
                  {selectedCardData?.buffPercentage ?
                    <>
                      <span className='buff'>{selectedCardData?.buffCategory}</span>
                      <span className='buff'>{selectedCardData?.buffAttribute}</span>
                      <span className='buff'>+ {selectedCardData?.buffPercentage}%</span>
                    </>
                    :
                    <>
                      <div className='unit-attr'>
                        <FavoriteIcon style={{ 'color': '#ff0000b3' }} />
                        <a>{selectedCardData?.hp}</a>
                        <div className='bonus-info'>
                          {
                            affect[1] != 0 ?
                              <>+{<a>{affect[1]}</a>}</>
                              :
                              <></>
                          }
                        </div>
                      </div>
                      <div className='unit-attr'>
                        <CancelIcon style={{ 'color': "#ffb13b" }} />
                        <a>{selectedCardData?.attack}</a>
                        <div className='bonus-info'>
                          {
                            affect[0] != 0 ?
                              <>+{<a>{affect[0]}</a>}</>
                              :
                              <></>
                          }
                        </div>
                      </div>
                      <div className='unit-attr'>
                        <BoltIcon style={{ 'color': '#00afff' }} />
                        <a>{selectedCardData?.speed}</a>
                        <div className='bonus-info'>
                          {
                            affect[2] != 0 ?
                              <>+{<a>{affect[2]}</a>}</>
                              :
                              <></>
                          }
                        </div>
                      </div>
                      <div className='unit-attr'>
                        <CrisisAlertIcon style={{ 'color': '#00c800' }} />
                        <a>{selectedCardData?.range}</a>
                        <div className='bonus-info'>
                          {
                            affect[3] != 0 ?
                              <>+{<a>{affect[3]}</a>}</>
                              :
                              <></>
                          }
                        </div>
                      </div>
                    </>
                  }
                </div>
                <div className='card-description'>
                  {selectedCardData?.description || 'Test Card Description Here, you could see the detailed description of the Card(Soilder)'}
                </div>
              </div>
            </div>

            <div className='right-panel'>
              <div className='tool-panel'>
                <div className='panel-name'>
                  <AutoFixHighIcon /> Equip
                </div>
                {selectedCardData?.rarity == 'LEGENDARY' ?
                  <>
                    <span className='empty-equip'>You can't equip any gear to Legendary Card.</span>
                  </>
                  :
                  <>
                    <div className='tool-section'>
                      <div className='tool-slot' onClick={() => showEquipModal('weapon')}>
                        {selectedCardData?.weaponSlot ?
                          <img src={selectedCardData?.weaponSlot?.image} alt={'slot'} />
                          : <img className='solt-back-img' src={weapon_back_img} alt={'slot'} />
                        }
                      </div>
                      <div className={`tool-name` + (selectedCardData?.weaponSlot ? '' : ' empty')}>
                        {selectedCardData?.weaponSlot?.name || 'WEAPON'}
                      </div>
                      <div className='tool-effect'>
                        {selectedCardData?.weaponSlot?.name ? (selectedCardData?.weaponSlot?.percentageBuff ? <><a>ATK</a> : <a>+ {selectedCardData?.weaponSlot?.percentageBuff}</a>%</> : <><a>ATK</a> : <a>+{selectedCardData?.weaponSlot?.flatBuff}</a></>) : ''}
                      </div>
                    </div>
                    <div className='tool-section'>
                      <div className='tool-slot' onClick={() => showEquipModal('shield')}>
                        {selectedCardData?.shieldSlot ?
                          <img src={selectedCardData?.shieldSlot?.image} alt={'slot'} />
                          : <img className='solt-back-img' src={shield_back_img} alt={'slot'} />
                        }
                      </div>
                      <div className={`tool-name` + (selectedCardData?.shieldSlot ? '' : ' empty')}>
                        {selectedCardData?.shieldSlot?.name || 'SHIELD'}
                      </div>
                      <div className='tool-effect'>
                        {selectedCardData?.shieldSlot?.name ? (selectedCardData?.shieldSlot?.percentageBuff ? <><a>HP</a> : <a>+ {selectedCardData?.shieldSlot?.percentageBuff}</a>%</> : <><a>HP</a> : <a>+ {selectedCardData?.shieldSlot?.flatBuff}</a></>) : ''}
                      </div>
                    </div>
                    <div className='tool-section'>
                      <div className='tool-slot' onClick={() => showEquipModal('talisman')}>
                        {selectedCardData?.talismanSlot ?
                          <img src={selectedCardData?.talismanSlot?.image} alt={'slot'} />
                          : <img className='solt-back-img' src={talisman_back_img} alt={'slot'} />
                        }
                      </div>
                      <div className={`tool-name` + (selectedCardData?.talismanSlot ? '' : ' empty')}>
                        {selectedCardData?.talismanSlot?.name || 'TALISMAN'}
                      </div>
                      <div className='tool-effect'>
                        {selectedCardData?.talismanSlot?.name ? (selectedCardData?.talismanSlot?.percentageBuff ? <><a>{selectedCardData?.talismanSlot?.buffAttribute}</a> : <a>+ {selectedCardData?.talismanSlot?.percentageBuff}</a>%</> : <><a>{selectedCardData?.talismanSlot?.buffAttribute}</a> : <a>+ {selectedCardData?.talismanSlot?.flatBuff}</a></>) : ''}
                      </div>
                    </div>
                  </>
                }
              </div>
              <div className='macro-panel'>
                <div className='panel-name'>
                  <SwitchAccessShortcutIcon /> Lvl <a>+{selectedCardData.level + 1}</a>
                </div>
                <div className='panel-left-panel'>
                  {selectedCardData?.isUpgradable ?
                    (selectedCardData?.buffPercentage ?
                      <>
                        {/* <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.buffCategory}</a>}
                          </div>
                        </div>
                        <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.buffAttribute}</a>}
                          </div>
                        </div> */}
                        <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.nextLevel?.buffPercentage}</a>}
                          </div>
                          <a> {'->'} </a>
                          <div className='next-m-info'>
                            {<a>{selectedCardData?.buffPercentage}+{selectedCardData?.nextLevel?.buffPercentage - selectedCardData?.buffPercentage}</a>}
                          </div>
                          <a>%</a>
                        </div>
                      </>
                      :
                      <>
                        <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.nextLevel?.hp}</a>}
                          </div>
                          <a> {'->'} </a>
                          <div className='next-m-info'>
                            {<a>{selectedCardData?.hp}+{selectedCardData?.nextLevel?.hp - selectedCardData?.hp}</a>}
                          </div>
                          <FavoriteIcon style={{ 'color': '#ff0000b3' }} />
                          <a>Hp</a>
                        </div>
                        <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.nextLevel?.attack}</a>}
                          </div>
                          <a> {'->'} </a>
                          <div className='next-m-info'>
                            {<a>{selectedCardData?.attack}+{selectedCardData?.nextLevel?.attack - selectedCardData?.attack}</a>}
                          </div>
                          <CancelIcon style={{ 'color': "#ffb13b" }} />
                          <a>Attack</a>
                        </div>
                        <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.nextLevel?.speed}</a>}
                          </div>
                          <a> {'->'} </a>
                          <div className='next-m-info'>
                            {<a>{selectedCardData?.speed}+{selectedCardData?.nextLevel?.speed - selectedCardData?.speed}</a>}
                          </div>
                          <BoltIcon style={{ 'color': '#00afff' }} />
                          <a>Speed</a>
                        </div>
                        <div className='m-info'>
                          <div className='prev-m-info'>
                            {<a>{selectedCardData?.nextLevel?.range}</a>}
                          </div>
                          <a> {'->'} </a>
                          <div className='next-m-info'>
                            {<a>{selectedCardData?.range}+{selectedCardData?.nextLevel?.range - selectedCardData?.range}</a>}
                          </div>
                          <CrisisAlertIcon style={{ 'color': '#00c800' }} />
                          <a>Range</a>
                        </div>
                      </>)
                    :
                    <div className='card-upgrade-description'>You can't upgrade this card.</div>
                  }
                </div>
                <div className='panel-right-panel'>
                  <div className='fragment'>
                    <div className='fragment-status-progress-bar'>
                      <div className='progress-bar-fill' style={progress}>{selectedCardData?.chanceUpgrade ? 'Chance : ' + selectedCardData?.chanceUpgrade + '%' : ''}</div>
                    </div>

                    <div className='fragment-status'>
                      <div className={`fragment-upgrade-btn + ${selectedCardData?.isUpgradable ? '' : ' notAllowed'}`} onClick={onUpgradeMacro}>
                        <UpgradeIcon />
                        <a>Upgrade</a>
                      </div>
                      <div className='fragment-sell-btn' onClick={onSellModalShow}>
                        <SellIcon style={{ width: '22px', marginLeft: '2px' }} />
                        <a>Sell</a>
                      </div>
                      <div className='fragment-info'>
                        <a>
                          {/* {cards.filter((record) => record.id == selectedCardData.idCardInstance)[0]?.quantity}</a>/<a>{cards.filter((record) => record.id == selectedCardData.idCardInstance)[0]?.upgradeRequirements.cardQuantity || '?'} */}
                        </a>
                      </div>
                    </div>
                  </div>
                  {selectedCardData?.upgradeRequirements && selectedCardData?.upgradeRequirements?.length > 0 ?
                    <>
                      <div className='inventory-cost-text'>
                        Requirements
                      </div>
                      <div className='inventory-costs'>
                        {(selectedCardData?.upgradeRequirements).map((cost, index) => {
                          if (index == 0) {
                            return <div key={index} className={'inventory-cost'} title={'pvpPoints'}>
                              <div className='inventory-cost-img'>
                                <img src={PVPPoints} alt={'cost'} />
                              </div>
                              <div className='inventory-cost-info'>
                                <div className='inventory-cost-name'>
                                  {'pvpPoints'}
                                </div>
                                <div className='inventory-cost-quantity'>
                                  x {cost['pvpPoints'] || '?'}
                                </div>
                              </div>
                            </div>
                          }
                        })}
                        {selectedCardData?.upgradeRequirements[2] && selectedCardData?.upgradeRequirements[2].length > 0 ?
                          <div className='inventory-cost-item-text'>
                            Items
                          </div>
                          :
                          ''
                        }
                        {(selectedCardData?.upgradeRequirements[1] && selectedCardData?.upgradeRequirements[1].length > 0) ? selectedCardData?.upgradeRequirements[1].map((item, i) => {
                          return <div key={i} className={'inventory-cost-item'} title={item?.name || 'item name'}>
                            <div className='inventory-cost-img'>
                              <img src={item?.image || TestDropImg} alt={'cost'} />
                            </div>
                            <div className='inventory-cost-info'>
                              <div className='inventory-cost-name'>
                                {item?.name || 'item name'}
                              </div>
                              <div className='inventory-cost-quantity'>
                                {'x ' + item?.upgradeItemQuantity || ' ?'}
                              </div>
                            </div>
                          </div>
                        }) : ''}
                      </div>
                    </> : ''
                  }
                </div>
              </div>
            </div>
          </div>
        </>}
    </div>

    <RModal
      className={'equipSelectModal'}
      style={''}
      open={equipShow}
      title={modalTitle}
      content={<>
        <div className='scroll-content equip-modal' style={{ 'height': '420px', 'position': 'relative' }}>
          {(onDoing) ? <div className='api-loading'>
            <span className='apiCallLoading'></span>
            <span className={'loader -loader'}></span>
          </div>
            :
            <>
              <div className='page-content'>
                {<div className='craft-items'>
                  {equipData.map((data, index) => (
                    index >= pageSize * (page - 1) && index < pageSize * page &&
                    <div key={index} className='craft-item-wrapper'>
                      <div
                        className={`craft-item equip-item` + (activeItem == data?.idGearInstance ? ' active' : '')} onClick={() => clickEquipData(data)}>
                        <Fade in={true} style={{ 'transformOrigin': '0 0 0' }}>
                          {/* <img className='craft-item-background' src={inventory_item_back} /> */}
                          <div className={`equip-item-container`}>
                            <div className='equip-item-info'>
                              <div className='equip-item-info-img'>
                                <img className='craft-item-img' src={data?.image || TestUnitImg} alt={data?.name}></img>
                              </div>
                              <div className='equip-item-info-des'>
                                {equipType == 'weapon' ?
                                  <><span>Attack </span><a>+ {data?.percentageBuff ? (data?.percentageBuff + '%') : data?.flatBuff}</a></>
                                  : equipType == 'shield' ?
                                    <><span>Hp </span><a>+ {data?.percentageBuff ? (data?.percentageBuff + '%') : data?.flatBuff}</a></>
                                    : <><span>{data?.buffAttribute} </span><a>+ {data?.percentageBuff ? (data?.percentageBuff + '%') : data?.flatBuff}</a></>}
                              </div>
                            </div>
                            <div className='craft-item-name'><span>{data?.name}</span></div>
                          </div>
                        </Fade>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
              <RPaginationPanel canPreviousPage={page > 1} canNextPage={page < equipData.length / pageSize} onNext={goToNextPage} onPrev={goToPrevPage} totalCount={equipData.length} pageIndex={page - 1} pageSize={pageSize} />
            </>}
        </div>

      </>}
      actions={<>
        <RButton className={`${(!onDoing && (activeItem != 0) ? '' : ' notAllowed')}`} onClick={() => [playConfirm(), onEquipItem()]}>Equip</RButton>
        <RButton className={`${(!onDoing && (activeSlotID != 0) ? '' : ' notAllowed')}`} onClick={() => [playConfirm(), onUnEquipItem()]}>Unequip</RButton>
      </>}
      onClose={onCancelAction}
    />

    <RModal
      className={'inventoryConfirmModal'}
      style={''}
      open={sellModal}
      title={modalTitle}
      content={<>
        <div className='scroll-content equip-modal' style={{ 'height': '320px', 'position': 'relative' }}>
          {(onDoing) ? <div className='api-loading custom-loading'>
            <span className='apiCallLoading'></span>
          </div>
            :
            <>
              <div className='page-content sell-modal'>
                <div className='sell-modal-img'>
                  <img src={selectedCardData?.image}></img>
                </div>
                <div className='sell-modal-input'>
                  <div className='sell-input-item'>
                    <span style={{ width: '150px' }}>Price per unit : </span><RInput step="1" className='sellPriceInput' type={'number'} placeholder={'Price per unit'} value={sellPrice} onChange={onSellPriceChange} title={'price'} />
                  </div>
                  <div className='sell-input-item'>
                    <span style={{ width: '150px' }}>Day : </span><RInput className='sellDayInput' type={'number'} placeholder={'Day'} value={sellDay} onChange={onSellDayChange} title={'day'} />
                  </div>
                  <div className='sell-input-item'>
                    <span style={{ width: '150px' }}>Hour : </span><RInput className='sellHourInput' type={'number'} placeholder={'Hour'} value={sellHour} onChange={onSellHourChange} title={'day'} />
                  </div>
                </div>
              </div>
            </>}
        </div>

      </>}
      actions={<>
        <RButton className={`${(onDoing || (sellDay * 24 * 3600 + sellHour * 3600) <= 0 || (sellPrice <= 0) ? 'notAllowed' : ' ')}`} onClick={() => [playConfirm(), onSellAction()]}>Sell</RButton>
        <RButton className={``} onClick={() => [playConfirm(), onSellCancelAction()]}>Cancel</RButton>
      </>}
      onClose={onSellCancelAction}
    />

    <RModal
      className={'inventoryConfirmModal'}
      style={''}
      open={confirmModalOpen}
      title={confirmActionType}
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
              Are you sure you want to upgrade this <a>Card</a>?<br />
              <br></br>
              Probability of Success: <a>{selectedCardData?.chanceUpgrade}%</a>
            </> :
              confirmActionType == 'sell' ? <>
                Do you want to sell <a>{selectedCardData.name}</a> for <a>{toFixed(sellQuantity * sellPrice)} Ancien</a>?
                {serverConfig?.features.fee.marketplaceFee &&
                  <>
                    <br />
                    You will pay a <a>{serverConfig?.features.fee.marketplaceFeeValue * 100}%</a> (<a style={{ margin: "0px 3px", color: "lime", fontSize: "1.3rem" }}>{format(toFixed(sellQuantity * sellPrice * serverConfig?.features.fee.marketplaceFeeValue))}</a>) fee on your sale.
                  </>}
              </> : ''
          }
        </div>

      </>}
      actions={<>
        <RButton className={`${(!onDoing ? '' : ' notAllowed')}`} onClick={onSureAction}>Sure</RButton>
      </>}
      onClose={onCancelAction}
    />
  </>)
}

export default RCardPanel