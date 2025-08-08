import './rbattleaction.scss';

import {
    useEffect,
    useState,
} from 'react';
import CardsSectionBackImg from '../../../assets/dashboard/cards-section-back.jpg';
function RBattleAction(props) {
    // basic attr className|style
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    const preventDragHandler = (e) => {
        e.preventDefault();
    }
    return (<>
        <div
            className={`rbattleaction ${className || ""}`}
            style={style || {}}
            onClick={props.onClick}
        >
            {props.type == 'autobattle' ?
                <img onDragStart={preventDragHandler} className="autobattle-back-image" src={CardsSectionBackImg} />
                :
                <></>
            }
            <div className='action-title'>
                {props.title}
            </div>
            <div className='action-description'>
                {props.description}
                {props.action && props.queue ?
                    <div className="btn-leave-queue" onClick={props.onLeaveQueue}>
                        Click here to remove.
                    </div>
                    :
                    <></>
                }
            </div>
        </div>
    </>)
}

export default RBattleAction