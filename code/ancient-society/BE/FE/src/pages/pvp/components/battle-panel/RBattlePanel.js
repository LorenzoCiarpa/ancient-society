import './rbattlepanel.scss';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// import SoundEffect from '../../../../utils/sounds';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  MouseTransition,
  MultiBackend,
  TouchTransition,
} from 'react-dnd-multi-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { toast } from 'react-toastify';
import useSound from 'use-sound';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { CircularProgress } from '@mui/material';

import WarPoints from '../../assets/basic/WarPoints.png';
import WaitingGIF from '../../assets/battle-panel/waiting.gif';
import RBackdrop from '../basic/backdrop/RBackdrop';
import RButton from '../basic/button/RButton';
import RModal from '../basic/modal/RModal';
import RBattleAction from './battle-action/RBattleAction';
import RBattleField from './battle-field/RBattleField';
import RBattle from './battle/RBattle';
import RUnitList from './unit-list/RUnitList';

// set params for card slots
const offsetTop = 100
const offsetLeft = 100
const positiveInitTop = 20
const positiveInitLeft = 0
const totalWidth = 400
const opponentInitTop = 300
const opponentInitLeft = 20

export const BattleContext = createContext({ onDrop: () => { }, onDraggingEnd: () => { }, onRemove: () => { } })

function RBattlePanel(props) {
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
  // init toast
  const notify = (error) => toast.error(error);
  const success = (message) => toast.success(message);
  const loading = (message) => toast.loading(message);
  const info = (message) => toast.info(message);

  // Basic Attr className|style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])


  // multi backend web and mobile
  const CustomHTML5toTouch = {
    backends: [
      {
        id: 'HTML5',
        backend: HTML5Backend,
        transition: MouseTransition
        // by default, will dispatch a duplicate `mousedown` event when this backend is activated
      },
      {
        id: 'TOUCH',
        backend: TouchBackend,
        // Note that you can call your backends with options
        options: { enableMouseEvents: true },
        transition: TouchTransition,
        // will not dispatch a duplicate `touchstart` event when this backend is activated
        skipDispatchOnTransition: true
      }
    ]
  };
  // Battle Field Process
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1)
  const [turnReady, setTurnReady] = useState({ 1: false, 2: false, 3: false })
  const [battleTurnData, setBattleTurnData] = useState({ 1: [], 2: [], 3: [] })
  const [battleLegendaryData, setBattleLegendaryData] = useState({ 1: null, 2: null, 3: null })

  const userReady = useRef(false)
  const onTurnClick = (turnNumber) => {
    setCurrentTurnNumber(turnNumber)
  }

  // when user click the each turn ready button
  const onTurnReady = (turnData, legendaryData) => {
    let flag = false
    turnData.map(cardID => cardID != null ? flag = true : flag)
    if (!flag) {
      notify("You should place at least a card into the field.")
      return
    }
    let newBattleTurnData = JSON.parse(JSON.stringify(battleTurnData))
    newBattleTurnData[currentTurnNumber] = turnData
    setBattleTurnData(JSON.parse(JSON.stringify(newBattleTurnData)))

    let newBattleLegendaryData = JSON.parse(JSON.stringify(battleLegendaryData))
    newBattleLegendaryData[currentTurnNumber] = legendaryData
    setBattleLegendaryData(JSON.parse(JSON.stringify(newBattleLegendaryData)))

    let newTurnReady = JSON.parse(JSON.stringify(turnReady))
    newTurnReady[currentTurnNumber] = true
    setTurnReady(JSON.parse(JSON.stringify(newTurnReady)))

    let nextTurnNumber = (currentTurnNumber + 1) % 3
    nextTurnNumber = nextTurnNumber == 0 ? 3 : nextTurnNumber
    if (turnReady[nextTurnNumber]) {
      nextTurnNumber = (nextTurnNumber + 1) % 3
      nextTurnNumber = nextTurnNumber == 0 ? 3 : nextTurnNumber
      if (!turnReady[nextTurnNumber]) {
        setCurrentTurnNumber(nextTurnNumber)
      }
    } else {
      setCurrentTurnNumber(nextTurnNumber)
    }
  }
  // user cards data
  const [loadingBar, setLoadingBar] = useState(false)
  const [leftLoadingBar, setLeftLoadingBar] = useState(false)
  const [cards, setCards] = useState([]);

  const [activeWar, setActiveWar] = useState([])
  const activeWarID = useMemo(() => props.activeWarID, [props.activeWarID])
  useEffect(() => {
    (async () => {

      console.log('get all user cards')
      await getAllCards()
      getAllAffixes()
      let wars = await getAllActiveBattle()
      onCheckUserQueue()
    })()
  }, [])

  useEffect(() => {
    if (activeWarID != null && activeWarID != undefined && activeWar.length > 0) {
      if (activeWar.filter(war => war.idWar == activeWarID).length > 0)
        onShowDetail(activeWar.filter(war => war.idWar == activeWarID)[0])
    }
  }, [activeWarID, activeWar])

  // cardLimit
  const [cardLimit, setCardLimit] = useState([])
  // get all usercards
  const getAllCards = async () => {
    setLoadingBar(true)
    props.setPageLoading(true)
    await axios
      .post("/api/m1/pvp/getCardList", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set the user cards from server
          let newCards = JSON.parse(JSON.stringify(response.data.data))
          response.data.cardLimit != undefined && setCardLimit(response.data.cardLimit)
          newCards.sort((curr, next) => { return next.rarity > curr.rarity ? 1 : -1 })
          setCards(newCards)
        }
        setLoadingBar(false)
        props.setPageLoading(true)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
        props.setPageLoading(true)
      });
  }

  // get all affixes
  const [affixes, setAffixes] = useState([]);
  const getAllAffixes = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getAllAffixes", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set the user cards from server
          let affixes = JSON.parse(JSON.stringify(response.data.data.affixes))
          setAffixes(affixes)
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }

  // get all active battles
  const refActiveWar = useRef([])
  useEffect(() => {
    refActiveWar.current = activeWar
  }, [activeWar])
  const getAllActiveBattle = async () => {
    setLeftLoadingBar(true)
    return await axios
      .post("/api/m1/pvp/getActiveWar", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // get current war data from server
          setActiveWar(response.data.data)
        }
        setLeftLoadingBar(false)
        return response.data?.data;
      })
      .catch((error) => {
        console.log(error)
        setLeftLoadingBar(false)
      });
  }

  // check if all of 3 turns are ready
  const [battleReady, setBattleReady] = useState(false)
  useEffect(() => {
    if (turnReady[1] && turnReady[2] && turnReady[3]) {
      if (userReady.current) {
        info("You are already placed all turns.")
        return;
      }
      setConfirmModalOpen(true)
      setOnDoing(false)
    }
  }, [turnReady])

  // Battle Detail View Handling
  const [selectedBattleData, setSelectedBattleData] = useState({})

  const [showDetail, setShowDetail] = useState(false)
  const positivePosition = useRef()
  const negativePosition = useRef()
  const slotRows = useRef()
  const slotColumns = useRef()
  const onShowDetail = (battleData) => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getActiveWarInfo", {
        address: props.metamask,
        idWar: battleData.idWar
      })
      .then((response) => {
        if (response.data.success) {
          // the user has been added to the queue or the battle is matched
          setSelectedBattleData(battleData)
          let prevTurnData = response.data.data
          // set battlefield slot positions
          // const rows = battleData.rows
          slotRows.current = battleData.rows
          const rows = battleData.rows
          // const columns = battleData.columns
          slotColumns.current = battleData.columns
          const columns = battleData.columns
          positivePosition.current = []
          negativePosition.current = []
          let offset = (400 - 70 * columns) / (columns - 1) + 70
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              positivePosition.current.push({ top: positiveInitTop + (offsetTop * i), left: positiveInitLeft + (offset * j) })
              negativePosition.current.push({ top: opponentInitTop + (offsetTop * i), left: opponentInitLeft + (offsetLeft * j) })
            }
          }

          if (prevTurnData.turn1 !== null) {
            // if the battle is processing
            let turn1 = []
            let turn2 = []
            let turn3 = []
            for (let i = 0; i < rows; i++) {
              for (let j = 0; j < columns; j++) {
                turn1.push(prevTurnData.turn1[i][j])
                turn2.push(prevTurnData.turn2[i][j])
                turn3.push(prevTurnData.turn3[i][j])
              }
            }
            let tempTurnData = { 1: turn1, 2: turn2, 3: turn3 }

            setBattleTurnData(JSON.parse(JSON.stringify(tempTurnData)))

            // user can't drap&drop the card
            setBattleStatus(false)

            // user can't call createBattle
            userReady.current = true

            // each turn set all ready
            setTurnReady({ 1: true, 2: true, 3: true })
          }
          else {
            // if the battle is the new one
            let newBattleTurnData = { 1: Array(rows * columns).fill(null), 2: Array(rows * columns).fill(null), 3: Array(rows * columns).fill(null) }
            setBattleTurnData(JSON.parse(JSON.stringify(newBattleTurnData)))

            // empty battle
            userReady.current = false
            setTurnReady({ 1: false, 2: false, 3: false })
            setBattleStatus(true)
          }

          // if the battle is the new one
          let newBattleTurnData = { 1: prevTurnData.turn1legendary, 2: prevTurnData.turn2legendary, 3: prevTurnData.turn3legendary }
          setBattleLegendaryData(JSON.parse(JSON.stringify(newBattleTurnData)))

          setAffixSlot([prevTurnData.affixIdsTurn1, prevTurnData.affixIdsTurn2, prevTurnData.affixIdsTurn3])
          setCurrentTurnNumber(1)
          openDetail()
        }
        else {
          notify(response.data.error)
        }
        setLoadingBar(false)
        onCheckUserQueue()
      })
      .catch((error) => {
        console.log(error)
        notify("Please retry.")
        setLoadingBar(false)
      });

  }
  const openDetail = () => {
    setShowDetail(true)
  }
  const [leaveConfirmModalOpen, setLeaveConfirmModalOpen] = useState(false)
  const closeDetail = () => {
    if (battleStatus)
      setLeaveConfirmModalOpen(true)
    else
      setShowDetail(false)
  }

  const onLeaveAction = () => {
    setLeaveConfirmModalOpen(false)
    setShowDetail(false)
  }

  const onLeaveCancelAction = () => {
    setLeaveConfirmModalOpen(false)
  }

  // On Click on Auto Battle Button.
  const [onDoing, setOnDoing] = useState(false)
  const onAutoBattle = () => {
    playConfirm()
    setOnDoing(true)
    axios
      .post("/api/m1/pvp/joinQueue", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // the user has been added to the queue or the battle is matched
          success('You are in Battle queue from now.')
          getAllActiveBattle()
        }
        else {
          notify(response.data.error)
        }
        setOnDoing(false)
        onCheckUserQueue()
      })
      .catch((error) => {
        console.log(error)
        notify("Please retry.")
        setOnDoing(false)
      });
    // openDetail()
  }

  // check the user's queue status, if exist : false, not : true
  const onCheckUserQueue = () => {
    axios
      .post("/api/m1/pvp/checkQueueStatus", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          setQueue(!response.data.data.status)
        }
      })
      .catch((error) => {
        console.log(error)
      });
  }

  // battle status flag true : active, false : end
  const [battleStatus, setBattleStatus] = useState(true)
  let cIndex
  const onDrop = (index) => {
    cIndex = index
  }
  const onRemove = (index) => {
    if (index == 999) {
      let newBattleLegendaryData = JSON.parse(JSON.stringify(battleLegendaryData))
      newBattleLegendaryData[currentTurnNumber] = null
      setBattleLegendaryData(newBattleLegendaryData)
    }
    else {
      let newBattleTurnData = JSON.parse(JSON.stringify(battleTurnData))
      newBattleTurnData[currentTurnNumber][index] = null
      setBattleTurnData(newBattleTurnData)
      
      // checking there is no placed card
      let flag = false
      for (let i = 0 ; i < newBattleTurnData[currentTurnNumber].length ; i ++) {
        if (newBattleTurnData[currentTurnNumber][i] > 0) {
          flag = true
        }
      }

      if (!flag) {
        let newTurnReady = JSON.parse(JSON.stringify(turnReady))
        newTurnReady[currentTurnNumber] = false
        setTurnReady(JSON.parse(JSON.stringify(newTurnReady)))
      }
    }
  }
  const onDraggingEnd = (cardId, dblClick = false, isLegendary = false) => {
    playConfirm()

    let newBattleTurnData = JSON.parse(JSON.stringify(battleTurnData))
    if (dblClick) {
      if (!battleStatus)
        return;
      if (isLegendary) {
        if (cards.filter(card => card.id == cardId)[0].rarity == 'LEGENDARY') {
          let newBattleLegendaryData = JSON.parse(JSON.stringify(battleLegendaryData))
          newBattleLegendaryData[currentTurnNumber] = cardId
          setBattleLegendaryData(newBattleLegendaryData)
        }
        else {
          cIndex = -1
        }
      }
      else {
        let emptySlot = -1
        let currTurnData = newBattleTurnData[currentTurnNumber]
        for (let i = 0; i < currTurnData.length; i++) {
          if (currTurnData[i] == null || currTurnData == -1) {
            emptySlot = i
            break;
          }
        }
        if (cards.filter(card => card.id == cardId)[0].rarity != 'LEGENDARY') {
          newBattleTurnData[currentTurnNumber][emptySlot] = cardId
          let value = confirmLimitSameCardType(newBattleTurnData[currentTurnNumber])
          if (value === true) {
            setBattleTurnData(newBattleTurnData)
          }
          else {
            toast.warning("You can place the this card max " + (value) + (value == 1 ? ' time ' : ' times ') + "in this turn.")
          }
        }
        else {
          cIndex = -1
        }
      }
    }
    else {
      if (cIndex != undefined) {
        if (cIndex == 999) {
          // if the user drop the card to LEGENDARY slot
          if (cards.filter(card => card.id == cardId)[0].rarity == 'LEGENDARY') {
            let newBattleLegendaryData = JSON.parse(JSON.stringify(battleLegendaryData))
            newBattleLegendaryData[currentTurnNumber] = cardId
            setBattleLegendaryData(newBattleLegendaryData)
          }
          else {
            cIndex = -1
          }
        }
        else {
          // if the user drop the card to normal slot
          if (cards.filter(card => card.id == cardId)[0].rarity != 'LEGENDARY') {
            newBattleTurnData[currentTurnNumber][cIndex] = cardId
            let value = confirmLimitSameCardType(newBattleTurnData[currentTurnNumber])
            if (value === true) {
              setBattleTurnData(newBattleTurnData)
            }
            else {
              toast.warning("You can place the this card max " + (value) + (value == 1 ? ' time ' : ' times ') + "in this turn.")
            }
          }
          else {
            cIndex = -1
          }
        }
      }
    }
  }

  const confirmLimitSameCardType = (data) => {
    let count = []
    for (let i = 0; i < data.length; i++) {
      if (data[i] == null)
        continue;
      if (count[cards.find(card => card.id == data[i]).id] != undefined) {
        count[cards.find(card => card.id == data[i]).id]++
      }
      else {
        count[cards.find(card => card.id == data[i]).id] = 1
      }
    }
    for (let x in count) {
      let max = 5
      let card = cards.find(card => card.id == x)
      if (card?.rarity.toUpperCase() == 'EPIC') {
        max = cardLimit.EPIC
      }
      else if (card?.rarity.toUpperCase() == 'RARE') {
        max = cardLimit.RARE
      }
      else {
        max = cardLimit.COMMON
      }
      if (count[x] > max) {
        return max
      }
    }
    return true
  }

  // battle affix slots
  const [affixSlot, setAffixSlot] = useState([[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]])

  const removeAffixSlot = useCallback((index) => {
    setAffixSlot([...affixSlot.filter((affix, turn) => turn == currentTurnNumber - 1 ? affix[index] = -1 : affix[index])])
  }, [currentTurnNumber, affixSlot])

  const setTurnAffixSlot = useCallback((slot, affixId) => {
    setAffixSlot([...affixSlot.filter((affix, turn) => turn == currentTurnNumber - 1 ? affix[slot] = affixId : affixId)])
  }, [currentTurnNumber, affixSlot])

  // current user's queue status
  const currQueue = useRef(false)
  const [queue, setQueue] = useState(false) // true: in queue, false : not in queue
  useEffect(() => {
    currQueue.current = queue
    if (queue) {
      onCheckMatchMaking()
    }
  }, [queue])
  // On click the leave queue button.
  const onLeaveQueue = () => {
    playConfirm()
    setOnDoing(true)
    axios
      .post("/api/m1/pvp/leaveQueue", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          info("You left the battle queue.")
        }
        else {
          notify(response.data.error)
        }
        setOnDoing(false)
        onCheckUserQueue()
      })
      .catch((error) => {
        console.log(error)
        setOnDoing(false)
        onCheckUserQueue()
      });
  }
  // if the user is in queue, check the battle is matched.
  const onCheckMatchMaking = () => {
    if (currQueue.current) {
      axios
        .post("/api/m1/pvp/checkMatchmaking", {
          address: props.metamask,
        })
        .then((response) => {
          if (response.data.success) {
            if (response.data.data?.activeWarsCount == refActiveWar.current.length + 2) {
              success('The battle is matched. You can play a battle right now.')
              getAllActiveBattle()
              onCheckUserQueue()
            }
            else {
              setTimeout(() => {
                onCheckMatchMaking()
              }, 10000);
            }
          }
          else {
            setTimeout(() => {
              onCheckMatchMaking()
            }, 10000);
          }
        })
        .catch((error) => {
          setTimeout(() => {
            onCheckMatchMaking()
          }, 10000);
        });
    }
  }

  // if componentWillUnmount, the user's queue status is set default (false)
  useEffect(() => {
    return () => {
      currQueue.current = false
      setQueue(false)
    }
  }, [])

  // confirm modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState(null)
  const onCancelAction = () => {
    setConfirmModalOpen(false)
  }

  const onSureAction = () => {
    // create the matrix with row * column
    let cards = []
    for (let t = 1; t < 4; t++) {
      let turnData = []
      let temp = [];
      let rows = 1;
      for (let i = 0; i < battleTurnData[t].length; i++) {
        temp.push(battleTurnData[t][i])
        if (i == rows * slotColumns.current - 1) {
          turnData.push(temp)
          temp = []
          rows++
        }
      }
      cards.push(turnData)
    }

    // legendary ids
    let legendary = []
    for (let i = 1; i < 4; i++) {
      legendary.push(battleLegendaryData[i])
    }
    setOnDoing(true)
    axios
      .post("/api/m1/pvp/createBattle", {
        address: props.metamask,
        idWar: selectedBattleData?.idWar,
        idArena: selectedBattleData?.arena,
        legendaryIds: legendary,
        cards: cards
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          response.data.data?.done && success("You are ready for battle.")
          setShowDetail(false)
        }
        else {
          error(response.data.error)
          setBattleStatus(false)
        }
        setOnDoing(false)
        setBattleReady(true)
        setConfirmModalOpen(false)
      })
      .catch((error) => {
        console.log(error)
        setConfirmModalOpen(false)
        setOnDoing(false)
      });
  }

  // stop image draggable
  const stopDraggable = () => {
    return false;
  }
  return (<>
    <BattleContext.Provider value={
      {
        onDrop,
        onDraggingEnd,
        onRemove
      }
    }
    >
      <div className={`rbattlepanel ${className || ""}`} style={style || {}}>
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
          {/* left battle list panel */}
          <div className='battle-list'>
            {leftLoadingBar ?
              <div className='api-loading' style={{ 'position': 'relative', 'background': 'none', "border": 'none' }}>
                {
                  <span className='apiCallLoading'></span>
                }
              </div>
              : activeWar.map((battle, index) => (
                <RBattle
                  key={index}
                  data={battle}
                  onClick={() => [play(), onShowDetail(battle)]}
                />
              ))}
          </div>

          {/* right battle panel container */}
          <div className='battle-container'>
            {/* battle panel dashboard */}
            <div className='current-status-text'>
              {activeWar.length > 0 ?
                <>
                  Now you have<a>{activeWar.length}</a> active {activeWar.length == 1 ? "battle" : "battles"}.
                </>
                :
                <>You have no active battle.</>
              }
            </div>

            {/* Main Aspects for my Battle info */}
            <div className='battle-panel-info'>
              <div className='battle-record'>
                <div className='record-title'>
                  Total Record
                </div>
                <div className='record-content battle-result'>
                  Win / Lose / Total <a>{props.userdata.Win}</a> / <a>{props.userdata.lost}</a> / <a>{props.userdata.totalMatches}</a>
                </div>
              </div>

              <div className='battle-record'>
                <div className='record-title'>
                  Total Rank
                </div>
                <div className='record-content rank-result'>
                  You are at <a>{10}</a> th of <a>1231</a> players.
                </div>
              </div>

              <div className='battle-record'>
                <div className='record-title'>
                  Current League
                </div>
                <div className='record-content league-result'>
                  {props.userLeague?.league ?
                    <>
                      You are in <a>{props.userLeague?.league?.name?.toUpperCase()}</a> league, <a>{props.userRank}</a> th of <a>{props.totalLeaguePlayers}</a> players.
                    </>
                    :
                    <>You are not in any league yet.</>
                  }
                </div>
              </div>

              <div className='battle-record'>
                <div className='record-title'>
                  Up League
                </div>
                <div className='record-content up-league-result'>
                  To enter <a>Silver</a> league, you need <a>120</a> more war points.
                </div>
              </div>
            </div>

            {/* battle actions panel */}
            <div className='battle-actions-text'>
              Here, you can play various types of battles :
            </div>
            <div className='battle-actions'>
              <RBattleAction
                title={'Auto Battle'}
                action={true}
                queue={queue}
                type={'autobattle'}
                onLeaveQueue={onLeaveQueue}
                description={
                  !queue ? 'Click to play the battle against another player who wants to play.' : <>
                    <span>Waiting an opponent...</span><img className='waiting-img' src={WaitingGIF} />
                  </>
                }
                onClick={
                  !queue ? onAutoBattle : () => { }
                }
              />
              <RBattleAction
                title={'Reserved 1'}
                action={false}
                description={'Coming soon...'}
              />
              <RBattleAction
                title={'Reserved 2'}
                action={false}
                description={'Coming soon...'}
              />
              <RBattleAction
                title={'Reserved 3'}
                action={false}
                description={'Coming soon...'}
              />
            </div>
          </div>
        </> : <>
          {/* battle detail view */}
          <div className='detail-view'>
            {/* back btn */}
            <div className='backBtn' onClick={closeDetail}>
              <KeyboardBackspaceIcon />
            </div>
            {/* arena name */}
            <div className='arenaName'>
              {selectedBattleData?.arena_name}
            </div>
            {/* turn nav */}
            <div className='turn-nav'>
              {[1, 2, 3].map((turnNumber, index) => (
                <div
                  key={index}
                  className={`turnMark ${turnNumber == currentTurnNumber ? 'current' : ''} ${turnReady[turnNumber] ? 'ready' : ''}`}
                  onClick={() => onTurnClick(turnNumber)}
                >
                  {turnNumber}
                </div>
              ))}
            </div>
            {/* Opposite Side */}
            {
              !selectedBattleData.enemy ?
                <></>
                :
                <div className='negative-unit-list'>
                  <div className='player-info'>
                    <div className='player-avatar'>
                      <img src={selectedBattleData?.enemy?.image} alt={'avatar'} />
                    </div>
                    <div className='player-name'>
                      {selectedBattleData?.enemy?.name}{ }
                    </div>
                  </div>

                  <div className='rank-info'>
                    {/* Gold, Silver, Bronze, etc.. */}
                    <div className='war-point'>
                      <img src={WarPoints} /> <a> {selectedBattleData?.enemy?.warPoints}</a>
                    </div>
                    {/* <div className='medal'>
                      <img src={MedalImg} alt={'medal'} />
                    </div> */}
                    {/* user's war point */}
                  </div>

                  <div className='more-info'>
                    {/* total rank */}
                    {/* <div className='leaderboard-info'>
                      <a>1</a> th of <a>{1000}</a> players
                    </div> */}

                    {/* Total battle record win/lose/total */}
                    {/* <div className='battle-record'>
                      W / L / T <a>25</a> / <a>105</a> / <a>130</a>
                    </div> */}
                  </div>
                </div>
            }
            {/* My side */}
            <DndProvider backend={MultiBackend} options={CustomHTML5toTouch}>
              <div
                className='positive-unit-list'>
                <div className='unit-list'>
                  <RUnitList
                    className='positive'
                    data={cards}
                    draggable={true}
                    status={battleStatus}
                  />
                </div>
              </div>
              <div
                className='battle-field'>
                <RBattleField
                  stopDraggable={stopDraggable}
                  currentTurnNumber={currentTurnNumber}
                  data={battleTurnData[currentTurnNumber]}
                  legendarydata={battleLegendaryData[currentTurnNumber]}
                  cards={cards}
                  affixes={affixes}
                  setTurnAffixSlot={setTurnAffixSlot}
                  removeAffixSlot={removeAffixSlot}
                  turnAffixSlot={affixSlot[currentTurnNumber - 1]}
                  affixSlot={affixSlot}
                  battleData={selectedBattleData}
                  rows={slotRows.current}
                  columns={slotColumns.current}
                  positivePosition={positivePosition.current}
                  negativePosition={negativePosition.current}
                  battleReady={battleReady}
                  onTurnReady={onTurnReady}
                  status={battleStatus}
                />
              </div>
            </DndProvider>

          </div>
        </>}
      </div>
      <RModal
        className={'inventoryConfirmModal'}
        style={{ 'minWidth': '200px', 'minHeight': '150px' }}
        open={confirmModalOpen}
        title={'Create Battle'}
        content={<>
          <div className='upgrade-confirm-text'>
            Are you sure you are ready to <a>Battle</a>?
          </div>

        </>}
        actions={<>
          <RButton onClick={onSureAction} className={onDoing ? ' notAllowed' : ''}>
            {onDoing ? <CircularProgress size={20} color="success" thickness={8}></CircularProgress> : <></>}
            Sure
          </RButton>
        </>}
        onClose={onCancelAction}
      />

      <RModal
        className={'inventoryConfirmModal'}
        style={{ 'minWidth': '200px', 'minHeight': '150px' }}
        open={leaveConfirmModalOpen}
        title={'Really?'}
        content={<>
          <div className='upgrade-confirm-text'>
            Are you sure to leave this <a>Battle</a>?
          </div>

        </>}
        actions={<>
          <RButton onClick={onLeaveAction}>
            Sure
          </RButton>
        </>}
        onClose={onLeaveCancelAction}
      />
    </BattleContext.Provider>
  </>)
}

export default RBattlePanel