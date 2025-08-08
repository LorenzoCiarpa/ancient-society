import './ractive-battle-list.scss';

import {
    useEffect,
    useState,
} from 'react';
import { Tooltip } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import UpdateIcon from '@mui/icons-material/Update';

import TestAvatar from '../../../assets/leaderboard-panel/test-avatar.webp';

function RActiveBattleList(props) {
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
        <div className={`ractive-battle-list ${className || ""}`} style={style || {}}>
            {data.length > 0 ? data.map((war, index) => (
                index < 10 ?
                    <div key={index} className='active-battle' onClick={() => props.showActiveDetail('active', war.idWar)}>
                        <div className='opp-avatar'>
                            <img src={war.enemy?.image || "./history-tmp/Fantasy-Emblem-1.png"} alt={'avatar'} />
                        </div>
                        <div className='opp-name'><span className="nagetive">vs</span> {war?.enemy?.name}</div>
                        <div className='battle-flow-time'>
                            <UpdateIcon /> <a>ongoing</a>
                        </div>
                        <div className='battle-status-badge'>
                            <Tooltip title={`ENEMY WP: ` + war?.enemy?.warPoints}>
                                <ReportIcon />
                            </Tooltip>
                        </div>
                    </div>
                    :
                    ""
            ))
                :
                <div className='empty-text'>You have no active battle.</div>
            }
        </div>
    </>)
}

export default RActiveBattleList