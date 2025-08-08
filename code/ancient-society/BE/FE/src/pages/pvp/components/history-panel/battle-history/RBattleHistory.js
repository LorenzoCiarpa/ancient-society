import './rbattlehistory.scss';

import {
  useEffect,
  useState,
} from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';

import TestAvatar from '../../../assets/leaderboard-panel/test-avatar.webp';

function RBattleHistory(props) {
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    const [data, setData] = useState(props.data)
    useEffect(() => {
        setData(props.data)
    }, [props.data])

    return (<>
        <div className={`rbattlehistory ${className || ""}`} style={style || {}} onClick={() => props.onClick(data)}>
            <div className='opp-avatar'>
                <img src={data.enemyImage || TestAvatar} alt={'avatar'} />
            </div>
            <div className='opp-name'>
                {data.enemyName}
            </div>
            {
                data.win ?
                    <div className='battle-result win'>
                        Win
                    </div>
                    :
                    <div className='battle-result lose'>
                        Lose
                    </div>
            }
            <div className='total-time'>
                <AccessTimeIcon /> <a>{data.endingTime}</a>
            </div>
        </div>
    </>)
}

export default RBattleHistory