import './rcard.scss';

import {
    useEffect,
    useState,
} from 'react';

import { Tooltip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import UpgradeIcon from '@mui/icons-material/Upgrade';

import TestUnitImg from '../../../assets/dashboard/cards-menu.png';

function RCard(props) {
    // basic attr className | style
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    const [progress, setProgress] = useState({ width: '0%' })
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    // card data
    const [data, setData] = useState(props.data)
    useEffect(() => {
        setData(props.data)
    }, [props.data])

    // affect data
    const [affect, setAffect] = useState(props.affect)
    useEffect(() => {
        setAffect(props.affect)
    }, [props.affect])

    return (<>
        <div className={`rcard ${className || ""}`} style={style || {}} onClick={() => { props.onShowDetail(data) }}>
            {/* back btn */}
            <div className={`unit-back-img  ${data?.category.toLowerCase()}`}></div>
            <div className='unit-name'>
                {data?.name || 'Test Unit Name'}
            </div>
            <div className='unit-thumb'>
                <div className='unit-img'>
                    <img src={data?.image || TestUnitImg} alt={'unit'} />
                </div>
                {data?.rarity == 'LEGENDARY' ? ""
                    :
                    <>
                        <div className='unit-equip-slot'>
                            <div className='slot'>
                                <Tooltip title="weapon">
                                    <div className='unit-tool-slot'>
                                        {data?.weapon ?
                                            <img src={data?.weapon?.image || TestUnitImg} />
                                            :
                                            <></>
                                        }
                                    </div>
                                </Tooltip>
                            </div>
                            <div className='slot'>
                                <Tooltip title="shield">
                                    <div className='unit-tool-slot'>
                                        {data?.shield ?
                                            <img src={data?.shield?.image || TestUnitImg} />
                                            :
                                            <></>
                                        }
                                    </div>
                                </Tooltip>
                            </div>
                            <div className='slot'>
                                <Tooltip title="talisman">
                                    <div className='unit-tool-slot'>
                                        {data?.talisman ?
                                            <img src={data?.talisman?.image || TestUnitImg} />
                                            :
                                            <></>
                                        }
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </>
                }
            </div>
            <div className='unit-info'>
                {data?.rarity == 'LEGENDARY' ?
                    <>
                        <div className='unit-attr-legendary'>
                            <div className='macro-info'>
                                {<a>{data?.buffCategory}</a>}
                            </div>
                        </div>
                        <div className='unit-attr-legendary'>
                            <div className='macro-info'>
                                {<a>{data?.buffAttribute}</a>}
                            </div>
                        </div>
                        <div className='unit-attr-legendary'>
                            <div className='macro-info'>
                                {<a>+ {data?.buffPercentage}%</a>}
                            </div>
                        </div>
                    </>
                    :
                    <>
                        <Tooltip title="Hp">
                            <div className='unit-attr'>
                                <FavoriteIcon style={{ 'color': '#ff0000b3' }} />
                                <a>{data?.hp || '?'}</a>
                                <div className='macro-info'>
                                    {
                                        affect[1] != 0 ?
                                            <>+<a>{affect[1]}</a></>
                                            :
                                            <></>
                                    }
                                </div>
                            </div>
                        </Tooltip>
                        <Tooltip title="Attack">
                            <div className='unit-attr'>
                                <CancelIcon style={{ 'color': "#ffb13b" }} />
                                <a>{data?.attack || '?'}</a>
                                <div className='macro-info'>
                                    {
                                        affect[0] != 0 ?
                                            <>+<a>{affect[0]}</a></>
                                            :
                                            <></>
                                    }
                                </div>
                            </div>
                        </Tooltip>
                        <Tooltip title="Speed">
                            <div className='unit-attr'>
                                <BoltIcon style={{ 'color': '#00afff' }} /> <a>{data?.speed || '?'}</a>
                                <div className='macro-info'>
                                    {
                                        affect[2] != 0 ?
                                            <>+<a>{affect[2]}</a></>
                                            :
                                            <></>
                                    }
                                </div>
                            </div>
                        </Tooltip>
                        <Tooltip title="Range">
                            <div className='unit-attr'>
                                <CrisisAlertIcon style={{ 'color': '#00c800' }} /> <a>{data?.range || '?'}</a>
                                <div className='macro-info'>
                                    {
                                        affect[3] != 0 ?
                                            <>+<a>{affect[3]}</a></>
                                            :
                                            <></>
                                    }
                                </div>
                            </div>
                        </Tooltip>
                    </>
                }
            </div>
            <div className='unit-m-info'>
                <Tooltip title="Level">
                    <div>
                        <SwitchAccessShortcutIcon /> Lvl {data.level || '?'}
                    </div>
                </Tooltip>
            </div>
            <div className='unit-tool-info'>
                {data?.rarity == 'LEGENDARY' ?
                    <><span className='equip-legendary'>Legendary</span></>
                    :
                    (data?.rarity == 'EPIC' ? <span className='equip-epic'>Epic</span> : (data?.rarity == 'RARE' ? <span className='equip-rare'>Rare</span> : <span className='equip-normal'>Normal</span>))
                }
            </div>
        </div>
    </>)
}

export default RCard