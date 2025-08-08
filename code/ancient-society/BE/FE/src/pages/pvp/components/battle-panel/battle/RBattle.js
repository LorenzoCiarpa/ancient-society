import './rbattle.scss';

import {
  useEffect,
  useState,
} from 'react';

import UpdateIcon from '@mui/icons-material/Timelapse';

import WarPoints from '../../../assets/basic/WarPoints.png';

function RBattle(props) {
    // Basic attr className|style
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    // battle data
    const [data, setData] = useState(props.data)
    useEffect(() => {
        setData(props.data)
    }, [props.data])

    return (<>
        <div
            className={`rbattle ${className || ""}`}
            style={style || {}}
            onClick={() => props.onClick(data)}
        >
            {/* Opposite player avatar */}
            <div className='opp-avatar'>
                <img src={data?.enemy?.image} alt={'avatar'} />
            </div>

            {/* Battle info */}
            <div className='battle-info'>
                {/* Basic battle properties */}
                <div className='opp-name'><span className='nagetive'>vs</span> {data?.enemy?.name}</div>
                <div className='battle-attr'>
                    <div className='battle-record'>
                        <img src={WarPoints} className={'img-warPoints'} /> <a>{data?.enemy?.warPoints}</a>
                    </div>
                    <div className='battle-flow-time'>
                        <UpdateIcon /> <a className={data?.ready ? 'ready' : 'ongoing'}>{data?.ready ? "Ready" : 'Ongoing'}</a>
                    </div>
                </div>


                {/* represent detailed battle status */}
                <div className='battle-status-tags'>
                    <div className='battle-status-tag status1'>
                        {data?.arena_name?.toUpperCase()}
                    </div>
                    {/* <div className='battle-status-tag status2'>
                        Status 2
                    </div> */}
                </div>
            </div>

            {/* Tell if the battle has an event */}
            {/* <div className='battle-status-badge'>
                {Math.random() < 0.5 ? <Tooltip title="You are ready for battle."><ReportIcon /></Tooltip> : <></>}
            </div> */}
        </div>
    </>)
}

export default RBattle