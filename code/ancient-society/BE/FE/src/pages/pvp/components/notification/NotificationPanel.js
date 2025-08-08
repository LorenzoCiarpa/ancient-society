import './notification-panel.scss';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios';
import {
    useEffect,
    useState,
} from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import PVPPoints from '../../assets/basic/PVPPoints.png';
import WarPoints from '../../assets/basic/WarPoints.png';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
import SoundEffect, {
    getVolumeSounds,
    playSound,
} from '../../../../utils/sounds';
function NotificationPanel(props) {
    const [mute, setMute] = useState(JSON.parse(localStorage.getItem('isMute')))
    const [effectVolume, setEffectVolume] = useState(getVolumeSounds())
    const [currentMusic, setCurrentMusic] = useState(null)
    const [musicSelect, setMusicSelect] = useState(false)
    const [musicSelectAnchorEl, setMusicSelectAnchorEl] = useState(null)
    const muteSetting = () => {
        localStorage.setItem('isMute', !mute)
        playSound(mute ? 'button' : '')
        setMute(!mute)
    }
    const musicVolumeSetting = (volume) => {
        localStorage.setItem('volumeMusic', volume)
        setMusicVolume(volume)
        setVolumeMusic(volume) //utils/sounds.js
    }
    const effectVolumeSetting = (volume) => {
        playSound('sound')
        localStorage.setItem('volumeSounds', volume)
        setEffectVolume(volume)
    }
    const onMusicSelect = (e) => {
        setMusicSelectAnchorEl(e.target)
        setMusicSelect(true)
    }
    const onCloseMusicSelect = () => {
        setMusicSelect(false)
    }
    const onMusicListClick = (music) => {
        setCurrentMusic(music)
        onCloseMusicSelect()
    }

    const data = {
        title: "FAQ",
        rows: [
            {
                title: "How to play the PVP battle?",
                content: "Lorem ipsum dolor sit amet, consectetur "
            },
            {
                title: "How to get the WarPoints?",
                content: "Nunc maximus, magna at ultricies elementum, risus turpis vulputate quam."
            },
            {
                title: "How to get the PvpPoints?",
                content: "Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc"
            },
            {
                title: "What is the PVP version",
                content: "v 1.0.0"
            }]
    }

    // profile panel data
    const [userData, setUserData] = useState(props.userData)
    useEffect(() => {
        setUserData(props.userData)
    }, [props.userData])

    // appear animation flag
    const [expand, setExpand] = useState(false)
    useEffect(() => {
        setExpand(true)
    }, [])

    const [notifications, setNotifications] = useState(props.notifications)
    useEffect(() => {
        setNotifications(props.notifications)
    }, [props.notifications])
    // hamburger button for mobile version
    const onArrowClick = () => {
        setExpand(true)
    }

    // disappear event handler
    const onPanelClick = (e) => {
        if (e.target.className === 'rprofile-panel-overlay show') {
            setExpand(false)
        } else {
            e.preventDefault();
        }
    }
    const [loadingBar, setLoadingBar] = useState(false)
    const handleClose = (idNotificationWar) => {
        setLoadingBar(true)
        axios
            .post("/api/m1/pvp/setNotificationSeen", {
                address: props.metamask,
                idNotificationWar: idNotificationWar
            })
            .then((response) => {
                if (response.data.success) {
                    // set user inventories from server
                    getAllNotifications()
                }
                // setLoadingBar(false)
            })
            .catch((error) => {
                console.log(error)
                setLoadingBar(false)
            });
    }
    const getAllNotifications = () => {
        axios({
            method: 'post',
            url: '/api/m1/pvp/getNotifications',
            data: {
                address: props.metamask
            }
        })
            .then(response => {
                if (response.data.success) {
                    props.setNotifications(JSON.parse(JSON.stringify(response.data.data)))
                }
                setLoadingBar(false)
            })
            .catch(error => {
                console.log('Error', error)
                setLoadingBar(false)
            });
    }
    return (<>
        {/* for mobile version overlay */}
        <div className={`rotherpanel-overlay ${expand ? 'show' : 'hide'}`}></div>

        {/* quick navbar */}
        <div className={`rotherpanel-container ${expand ? 'show' : 'hide'}`}>
            <div className='rotherpanel-arrow' onClick={onArrowClick}>
                <span></span>
            </div>
            <div className={'rotherpanel'}>
                {loadingBar ?
                    <div className='api-loading right-panel-loading'>
                        {<span className='apiCallLoading'></span>}
                    </div>
                    :

                    notifications.length > 0 ? notifications.map(n => (
                        <Alert key={n?.idNotificationWar} onClose={() => handleClose(n?.idNotificationWar)} severity="info" sx={{ width: '100%', backgroundColor: (n?.type == 'WIN' ? '#0589005c' : '#8900005c' ), marginBottom: '10px' }}>
                            <div className='notification-item'>
                                <span className='desc'>You received </span>
                                <img src={PVPPoints} className='pvpPoints' /> <span className='pvpPoints'>{n?.pvpPoints}</span>
                                <img src={WarPoints} className='warPoints' /> <span className='warPoints'>{n?.warPoints}</span>
                                <span className='desc'></span>
                            </div>
                        </Alert>

                    ))
                        :
                        <><span className='notification-empty'>There is no notification.</span></>

                }
            </div>
        </div>
    </>)
}

export default NotificationPanel