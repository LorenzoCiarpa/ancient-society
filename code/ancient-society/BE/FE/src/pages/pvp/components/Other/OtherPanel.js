import './other-panel.scss';
import {
    useEffect,
    useState,
} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    CircularProgress,
    FormControlLabel,
    FormHelperText,
    IconButton,
    Slider,
    Switch,
    TextField,
    Tooltip,
} from '@mui/material';
import SoundEffect, {
    getVolumeSounds,
    playSound,
} from '../../../../utils/sounds';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Faq from 'react-faq-component';
function OtherPanel(props) {
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
    return (<>
        {/* for mobile version overlay */}
        <div className={`rotherpanel-overlay ${expand ? 'show' : 'hide'}`}></div>

        {/* quick navbar */}
        <div className={`rotherpanel-container ${expand ? 'show' : 'hide'}`}>
            <div className='rotherpanel-arrow' onClick={onArrowClick}>
                <span></span>
            </div>
            <div className={'rotherpanel'}>
                <Faq
                    data={data}
                    styles={{
                        bgColor: "rgba(0, 0, 0, 0.3)",
                        titleTextColor: "gold",
                        rowTitleColor: "gold",
                        rowTitleTextSize: 'large',
                        rowContentColor: "white",
                        rowContentTextSize: '16px',
                        rowContentPaddingTop: '10px',
                        rowContentPaddingBottom: '10px',
                        rowContentPaddingLeft: '20px',
                        rowContentPaddingRight: '100px',
                        arrowColor: "gold",
                    }}
                    config={{
                        arrowIcon: "V",
                    }}
                />
            </div>

            <div className='musicSetting'>
                <div className='muteBtn'>
                    <span className='setting-span'>Settings:</span>
                    <FormControlLabel control={<Switch checked={!mute} onChange={muteSetting} />} label={!mute ? "Sounds On" : "Mute On"} />
                </div>
                {/* <div className='musicVolume'>
                                  <span className='desc'> Music</span>
                                  <div className='inputs'>
                                    <VolumeDown />
                                    <Slider aria-label="Volume" value={musicVolume} disabled={!mute} onChange={(e) => musicVolumeSetting(e.target.value)} />
                                    <VolumeUp />
                                  </div>
                                </div> */}
                <div className='effectVolume'>
                    <div className='inputs'>
                        <VolumeDown />
                        <Slider aria-label="Volume" value={effectVolume} disabled={mute} onChange={(e) => effectVolumeSetting(e.target.value)} />
                        <VolumeUp />
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default OtherPanel