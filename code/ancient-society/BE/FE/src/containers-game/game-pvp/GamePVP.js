import './game-pvp.scss';
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
import { serverConfig } from '../../config/serverConfig';
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

const classNameForComponent = 'game-pvp' // ex: game-inventory
const componentTitle = 'PVP' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GamePVP(props) {

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

    // Server Config
    const [serverConfig, setServerConfig] = useState(props.serverConfig)
    useEffect(() => {
        setServerConfig(props.serverConfig)
    }, [props.serverConfig])

    return (<>

    </>)
}

export default GamePVP