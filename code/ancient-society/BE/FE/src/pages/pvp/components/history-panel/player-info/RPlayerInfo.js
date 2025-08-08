import './rplayerinfo.scss';

import { useMemo } from 'react';

import WinnerPNG from '../../../assets/history-tmp/winner.png';
function RPlayerInfo(props) {
    const className = useMemo(() => props.className, [props.className])
    const style = useMemo(() => props.style, [props.style])
    const data = useMemo(() => props.data, [props.data])
    return (<>
        <div className={`rplayerinfo ${className || ""}`} style={style || {}} onClick={props.onClick}>
            <div className='avatar'>
                {props.win ?
                    <img className="avatar-back" src={WinnerPNG} alt="avatar-back" />
                    :
                    <></>
                }
                <img className='real-avatar' src={props.player == 'negative' ? data.enemyImage : data.userImage} alt='avatar' />
            </div>
            <div className='name'>
                {props.player == 'negative' ? data.enemyName : data.userName}
            </div>
            {/* <div className='trophies'>
                {data.enemyTrophies || '0'}
            </div> */}
        </div>
    </>)
}

export default RPlayerInfo