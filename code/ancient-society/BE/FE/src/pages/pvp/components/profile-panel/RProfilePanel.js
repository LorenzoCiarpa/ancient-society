import './rprofile-panel.scss';
import {
    useEffect,
    useState,
} from 'react';
import {
    Badge
} from '@mui/material';
import iconLogout from '../../assets/ui-icon-logout1.png';
import ClosePopupBtnImg from '../../assets/dashboard/close-popup-btn.svg';
import RActiveBattleList from './active-battle-list/RActiveBattleList';
import RProfile from './profile/RProfile';
import iconSettings from '../../assets/dashboard/ui-icon-settings.png';
import iconNotification from '../../assets/dashboard/ui-icon-inventory.png';
import RRecentHistoryList from './recent-history-list/RRecentHistoryList';
import SoundEffect, { playSound } from '../../../../utils/sounds';
function RProfilePanel(props) {
    // profile panel data
    const [userData, setUserData] = useState(props.userData)
    useEffect(() => {
        setUserData(props.userData)
        playSound('cityNature')
        console.log('cityNature')
    }, [props.userData])

    // appear animation flag
    const [expand, setExpand] = useState(false)
    useEffect(() => {
        setExpand(true)
    }, [])
    
    // hamburger button for mobile version
    const onArrowClick = () => {
        playSound('mobileMenuOpen')
        setExpand(true)
    }
    
    // disappear event handler
    const onPanelClick = (e) => {
        playSound('menuClick')
        if (e.target.className === 'rprofile-panel-overlay show') {
            setExpand(false)
        } else {
            e.preventDefault();
        }
    }
    
    // open various panel handlers
    const onBattleClick = () => {
        setExpand(false)
        playSound('menuClick')
        props.openComponent('battle')
    }
    const onHistoryClick = () => {
        setExpand(false)
        playSound('menuClick')
        props.openComponent('history')
    }
    const onProfileClick = () => {
        setExpand(false)
        playSound('menuClick')
        props.openComponent('other')
    }
    const onNotificationClick = () => {
        setExpand(false)
        playSound('menuClick')
        props.openComponent('notification')
    }
    const goToMainPage = () => {
        playSound('mobileMenuClose')
        window.location.href = '/game';
    }
    const [notifications, setNotifications] = useState(props.notifications)
    useEffect(() => {
        setNotifications(props.notifications)
    }, [props.notifications])
    return (<>
        {/* for mobile version overlay */}
        <div className={`rprofile-panel-overlay ${expand ? 'show' : 'hide'}`} onClick={onPanelClick}></div>
        {/* quick navbar */}
        <div className={`rprofile-panel-container ${expand ? 'show' : 'hide'}`}>
            <div className='backMain'>
                <img src={iconLogout} onClick={goToMainPage} />
            </div>
            <div className='rprofile-panel-arrow' onClick={onArrowClick}>
                <span></span>
            </div>
            <div className='panel-close-btn' onClick={() => setExpand(false)}>
                <img src={ClosePopupBtnImg} alt={'close'} />
            </div>
            <div className={'rprofile-panel'}>
                {/* profile info */}
                <div className='additional-info-panel'>
                    <div className='panel-title' style={{ color: '#ffbc00', fontSize: '1.5rem' }}>{userData.userName}</div>
                    <div className='link-to-detail'>
                        {notifications.length > 0 ?
                            <Badge badgeContent={notifications.length} color="warning">
                                <img src={iconSettings} onClick={onProfileClick} className='menu-icons' />
                                <img src={iconNotification} onClick={onNotificationClick} className='menu-icons' />
                            </Badge>
                            :
                            <>
                                <img src={iconSettings} onClick={onProfileClick} className='menu-icons' />
                                <img src={iconNotification} onClick={onNotificationClick} className='menu-icons' />
                            </>
                        }
                    </div>
                    <RProfile data={userData} warHistory={props.warHistory} totalLeaguePlayers={props.totalLeaguePlayers} userRank={props.userRank} nftShow={false} />
                </div>

                {/* current active battle */}
                <div className='additional-info-panel'>
                    <div className='panel-title'>Current Active Battles</div>
                    <div className='link-to-detail' onClick={onBattleClick}>+ More</div>
                    {props.warListLoadingBar ?
                        <div className='api-loading right-panel-loading'>
                            {<span className='apiCallLoading'></span>}
                        </div>
                        :
                        <RActiveBattleList
                            showActiveDetail={props.showActiveDetail}
                            data={props.activeWar}
                        />
                    }
                </div>

                {/* recent battle history */}
                <div className='additional-info-panel'>
                    <div className='panel-title'>Recent Battle History</div>
                    <div className='link-to-detail' onClick={onHistoryClick}>+ More</div>
                    {props.warHistoryLoadingBar ?
                        <div className='api-loading right-panel-loading'>
                            {<span className='apiCallLoading'></span>}
                        </div>
                        :
                        <RRecentHistoryList
                            showActiveDetail={props.showActiveDetail}
                            data={props.warHistory}
                        />
                    }
                </div>

            </div>
        </div>
    </>)
}

export default RProfilePanel