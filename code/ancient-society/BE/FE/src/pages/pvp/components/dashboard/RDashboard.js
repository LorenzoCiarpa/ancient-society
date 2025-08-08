import './rdashboard.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import useSound from 'use-sound';

import SoundEffect, { playSound } from '../../../../utils/sounds';
import BattleMenuBackImg from '../../assets/dashboard/battle-menu.png';
import ShopMenuBackImg from '../../assets/dashboard/battle-merchant-menu.png';
import ShopSectionBackImg
  from '../../assets/dashboard/battle-merchant-section-back.jpeg';
import BattleSectionBackImg
  from '../../assets/dashboard/battle-section-back.jpg';
import CardsMenuBackImg from '../../assets/dashboard/cards-menu.png';
import CardsSectionBackImg from '../../assets/dashboard/cards-section-back.jpg';
import HistorySectionBackImg
  from '../../assets/dashboard/cards-section-back.jpg';
import HistoryMenuBackImg from '../../assets/dashboard/history-menu.png';
import InventoryMenuBackImg from '../../assets/dashboard/inventory-menu.png';
import InventorySectionBackImg
  from '../../assets/dashboard/inventory-section-back.jpeg';
import LeaderBoardMenuBackImg
  from '../../assets/dashboard/leaderboard-menu.png';
import LeaderBoardSectionBackImg
  from '../../assets/dashboard/leaderboard-section-back.jpg';
import RBattlePanel from '../battle-panel/RBattlePanel';
import RCardPanel from '../cards-panel/RCardPanel';
import RHistoryPanel from '../history-panel/RHistoryPanel';
import RInventoryPanel from '../inventory-panel/RInventoryPanel';
import RLeaderBoardPanel from '../leaderboard-panel/RLeaderBoardPanel';
import NotificationPanel from '../notification/NotificationPanel';
import OtherPanel from '../Other/OtherPanel';
import RShopePanel from '../shop-panel/RShopPanel';
import RMenu from './menu/RMenu';
import RPopupComponent from './popup/RPopupComponent';

function RDashboard(props) {
  const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;
  const isMute = localStorage.getItem('isMute')
  const [play, { stop }] = useSound(
    `${ASSETS_PATH}/maps/city/nature.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );

  // basic attrs className|style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // appear animation flag
  const [expand, setExpand] = useState(false)
  useEffect(() => {
    setExpand(true)
  }, [])


  const [notifications, setNotifications] = useState(props.notifications)
  useEffect(() => {
    setNotifications(props.notifications)
  }, [props.notifications])
  // opened panel uid
  const [openedComponentType, setOpenedComponentType] = useState('')

  // display title of each component
  const componentTitle = {
    'battle': 'Battle',
    'cards': 'Cards',
    'inventory': 'Inventory',
    'shop': 'Shop',
    'leaderboard': 'LeaderBoard',
    'history': 'Battle History',
    'other': 'More Info',
    'notification': 'Notifications'
  }

  const subListType = useMemo(() => props.subListType, [props.subListType])
  const activeWarID = useMemo(() => props.subListWarID, [props.subListWarID])
  const historyWarID = useMemo(() => props.subListWarID, [props.subListWarID])
  // menu click event handlers
  const onBattleBtnClick = () => {
    // open battle pabel

    props.setSubListWarID(null)
    playSound("menuClick");
    openComponent('battle')
  }
  const onCardsBtnClick = () => {
    // open card pabel
    playSound("menuClick");
    openComponent('cards')
  }
  const onInventoryBtnClick = () => {
    // open inventory pabel
    playSound("menuClick");
    openComponent('inventory')
  }
  const onShopBtnClick = () => {
    // open shop pabel
    playSound("menuClick");
    openComponent('shop')
  }
  const onLeaderBoardBtnClick = () => {
    // open leaderboard pabel
    playSound("menuClick");
    openComponent('leaderboard')
  }
  const onHistoryBtnClick = () => {
    // open history pabel
    props.setSubListWarID(null)
    playSound("menuClick");
    openComponent('history')
  }

  // open|close panels
  const openComponent = (type) => {

    setOpenedComponentType(type)
    // setTimeout(() => {
    //   setOpenedComponentType(type)
    // }, 1000)
  }
  const closeComponent = () => {
    props.closeOpenedComponent()
    setOpenedComponentType('')
  }

  const pageLoading = useMemo(() => props.pageLoading, [props.pageLoading])

  // retrieve profile panel action
  useEffect(() => {
    props.openedComponent ? openComponent(props.openedComponent) : null
  }, [props.openedComponent])


  const walletAccount = useMemo(() => props.walletAccount, [props.walletAccount])
  const walletProvider = useMemo(() => props.walletProvider, [props.walletProvider])
  const walletSigner = useMemo(() => props.walletSigner, [props.walletSigner])
  
  return (<>
    <SoundEffect />
    <div className={`rdashboard ${className || ""} ${expand ? 'show' : 'hide'}`} style={style || {}}>
      <div className={`rdashboard-container`}>
        {/* Battle Panel Menu */}
        <RMenu
          data={{
            backImg: BattleSectionBackImg,
            menuImg: BattleMenuBackImg,
            pageLoading: pageLoading,
            imgStyle: 'radial-gradient(rgb(255 185 41 / 54%) 30%, rgba(46, 36, 32, 0.42))',
            title: 'Battle',
            description: 'Fight your enemies and win spoils of war.'
          }}
          onClick={onBattleBtnClick}
        />

        {/* Cards Panel Menu */}
        <RMenu
          data={{
            backImg: CardsSectionBackImg,
            menuImg: CardsMenuBackImg,
            pageLoading: pageLoading,
            imgStyle: 'radial-gradient(rgb(255 185 41 / 54%) 30%, rgba(46, 36, 32, 0.42))',
            title: 'Cards',
            description: 'Train your soldiers and hire new ones.'
          }}
          onClick={onCardsBtnClick}
        />

        {/* Inventory Panel Menu */}
        <RMenu
          data={{
            backImg: InventorySectionBackImg,
            menuImg: InventoryMenuBackImg,
            pageLoading: pageLoading,
            imgStyle: 'radial-gradient(rgb(255 185 41 / 54%) 30%, rgba(46, 36, 32, 0.42))',
            title: 'Inventory',
            description: 'You can check everything that your Empire owns here.'
          }}
          onClick={onInventoryBtnClick}
        />

        {/* Shop Panel Menu */}
        <RMenu
          data={{
            backImg: ShopSectionBackImg,
            menuImg: ShopMenuBackImg,
            pageLoading: pageLoading,
            imgStyle: 'radial-gradient(rgb(255 185 41 / 54%) 30%, rgba(46, 36, 32, 0.42))',
            title: 'Shop',
            description: 'Special items are sold by the Battle Merchant.'
          }}
          onClick={onShopBtnClick}
        />

        {/* League Panel Menu */}
        <RMenu
          data={{
            backImg: LeaderBoardSectionBackImg,
            menuImg: LeaderBoardMenuBackImg,
            pageLoading: pageLoading,
            imgStyle: 'radial-gradient(rgb(255 185 41 / 54%) 30%, rgba(46, 36, 32, 0.42))',
            title: 'LeaderBoard',
            description: !(props.userLeague && !props.userData?.hideRank) ? "You are not active any League yet. You have to play at least 10 battles to active the League." : 'Players: ' + props.userLeague.players?.length
          }}
          onClick={onLeaderBoardBtnClick}>

          {/* Panel Introduction Content - This will be added after description text */}
          {(props.userLeague && !props.userData?.hideRank) ?
            <>
              <div className='league-info'>
                <div className='league-title'>
                  Active League
                </div>
                <div className='league-cost'>
                  <div className='league-cost-info'>
                    {props.userLeague.league.name.toUpperCase()}
                  </div>
                </div>

                <div className='league-trophy-text'>
                  <img className='desc-league-image' src={props.userLeague?.league.image} />
                  <span>
                    minTrophies :
                    <a> {props.userLeague?.league.minTrophies}</a>
                  </span>
                </div>
                <div className='league-trophies'>
                </div>
              </div>
            </>
            :
            <></>
          }

        </RMenu>

        {/* History Panel Menu */}
        <RMenu
          data={{
            backImg: HistorySectionBackImg,
            menuImg: HistoryMenuBackImg,
            pageLoading: pageLoading,
            imgStyle: 'radial-gradient(rgb(255 185 41 / 54%) 30%, rgba(46, 36, 32, 0.42))',
            title: 'History',
            description: 'Study your battles and refine your strategy.'
          }}
          onClick={onHistoryBtnClick}
        />

      </div>
      <div className={`popup-container ${openedComponentType != '' ? 'show' : 'hide'}`}>
        {/* Panel Component */}
        <RPopupComponent
          open={openedComponentType != ''}
          title={componentTitle[openedComponentType]}
          onClose={closeComponent}
        >
          {/* Battle Panel */}

          {
            openedComponentType == 'battle' && <RBattlePanel metamask={walletAccount} userdata={props.userData} userLeague={props.userLeague} totalLeaguePlayers={props.totalLeaguePlayers} userRank={props.userRank} warHistory={props.warHistory} setUserData={props.setUserData} setPageLoading={props.setPageLoading} activeWarID={subListType == 'active' ? activeWarID : null} />
          }

          {/* Cards Panel */}

          {openedComponentType == 'cards' && <RCardPanel metamask={walletAccount} userdata={props.userData} setUserData={props.setUserData} setPageLoading={props.setPageLoading} />}

          {/* Inventory Panel */}

          {
            openedComponentType == 'inventory' && <RInventoryPanel metamask={walletAccount} userdata={props.userData} setUserData={props.setUserData} setPageLoading={props.setPageLoading} />
          }

          {/* Shop Panel */}

          {
            openedComponentType == 'shop' && <RShopePanel metamask={walletAccount} walletSigner={walletSigner} walletProvider={walletProvider} userdata={props.userData} setUserData={props.setUserData} setPageLoading={props.setPageLoading} />
          }

          {/* LeaderBoard Panel */}

          {
            openedComponentType == 'leaderboard' && <RLeaderBoardPanel metamask={walletAccount} setPageLoading={props.setPageLoading} />
          }

          {/* History Panel */}

          {
            openedComponentType == 'history' && <RHistoryPanel metamask={walletAccount} userdata={props.userData} setPageLoading={props.setPageLoading} historyWarID={subListType == 'history' ? historyWarID : null} />
          }

          {/* Other Panel */}

          {
            openedComponentType == 'other' && <OtherPanel metamask={walletAccount} userdata={props.userData} setPageLoading={props.setPageLoading} backgroundStop={props.backgroundStop} backgroundPlay={props.backgroundPlay} />
          }

          {/* Notification Panel */}

          {
            openedComponentType == 'notification' && <NotificationPanel metamask={walletAccount} userdata={props.userData} setPageLoading={props.setPageLoading} notifications={notifications} setNotifications={props.setNotifications} />
          }
        </RPopupComponent>
      </div>
    </div>
  </>)
}

export default RDashboard