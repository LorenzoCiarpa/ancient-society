import './rprofile.scss';

import {
    useEffect,
    useRef,
    useState,
} from 'react';
import AvatarBackImg from '../../../assets/profile/back.png';
import MedalImg from '../../../assets/profile/medal.svg';
import PVPPoints from '../../../assets/basic/PVPPoints.png';
import WarPoints from '../../../assets/basic/WarPoints.png';
function RProfile(props) {
    // basic attr className|style
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    // profile data
    const [data, setData] = useState(props.data)
    useEffect(() => {
        setData(props.data)
    }, [props.data])
    return (<>
        <div className={`rprofile ${className || ""}`} style={style || {}}>
            {/* avatar */}
            <div className='avatar'>
                <img className='avatar-back' src={AvatarBackImg} alt={'avatar-back'} />
                <img src={data?.userImage} alt={'avatar'} />
            </div>

            {/* other info */}
            <div className='info-panel'>
                {/* Rank info */}
                <div className='rank-info'>
                    {/* Gold, Silver, Bronze, etc.. */}
                    <div className='medal'>
                        <img src={MedalImg} alt={'medal'} />
                    </div>
                    {/* user's war point */}
                    <div className='war-point'>
                        {data?.hideRank ?
                            <></>
                            :
                            <>
                                <div>
                                    <img src={WarPoints} className='img-profile-warpoints' /> <a>{data?.warPoints}</a>
                                </div>
                            </>
                        }
                        <div>
                            <img src={PVPPoints} className='img-profile-pvppoints' /> <a className='pvp-points'>
                                {data?.pvpPoints}
                            </a>
                        </div>
                    </div>
                </div>

                {/* total rank */}
                {data?.hideRank ?
                    ""
                    :
                    <div className='leaderboard-info'>
                        {props.userRank != -1 ?
                            <><a>{props.userRank}</a> th of <a>{props.totalLeaguePlayers != -1 ? props.totalLeaguePlayers : 0}</a> players</>
                            :
                            'Unknown'
                        }
                    </div>
                }

                {/* Total battle record win/lose/total */}
                {data?.hideRank ?
                    ""
                    :
                    <div className='battle-record'>
                        W / L / T <a>{data?.Win}</a> / <a>{data?.lost}</a> / <a>{data?.totalMatches}</a>
                    </div>
                }

                {/* user's nft level */}
                {props.nftShow &&
                    <div className='nft-info'>
                        NFT <a>Lvl +3</a>
                    </div>}
            </div>
        </div>
    </>)
}

export default RProfile