import './rrecent-history-list.scss';

import {
    useEffect,
    useState,
} from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';

import TestAvatar from '../../../assets/leaderboard-panel/test-avatar.webp';

function RRecentHistoryList(props) {
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
        <div className={`rrecent-history-list ${className || ""}`} style={style || {}}>
            {data.length > 0 ?
                data.map((history, index) => (
                    index < 10 ?
                        <div key={index} className='battle-history' onClick={() => {props.showActiveDetail('history', history.idWar)}}>
                            <div className='opp-avatar'>
                                <img src={history.enemyImage} alt={'avatar'} />
                            </div>
                            <div className='opp-name'>
                                <span className="nagetive">vs</span> {history.enemyName || "Unknown"}
                            </div>
                            {
                                history?.win ?
                                    <div className='battle-result win'>
                                        Win
                                    </div>
                                    :
                                    <div className='battle-result lose'>
                                        Lose
                                    </div>
                            }
                            <div className='total-time'>
                                <AccessTimeIcon />
                                <a>{history.endingTime}</a>
                            </div>
                        </div>
                        :
                        ""
                ))
                :
                <div className='empty-text'>You have no battle history.</div>
            }
        </div>
    </>)
}

export default RRecentHistoryList