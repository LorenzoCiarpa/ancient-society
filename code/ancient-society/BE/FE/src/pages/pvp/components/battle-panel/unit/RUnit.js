import './runit.scss';

import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDrag } from 'react-dnd';

import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import FavoriteIcon from '@mui/icons-material/Favorite';

import SoldierImg from '../../../assets/battle-panel/soldier.png';
import { BattleContext } from '../RBattlePanel';

function RUnit(props) {
    // basic attr className|style
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    const data = useMemo(() => props.data, [props.data])
    const draggable = useMemo(() => props.draggable, [props.draggable])

    // Prevent Dnd when it's disabled
    const { onDraggingEnd } = useContext(BattleContext)
    const [collected, drag, dragPreview] = useDrag(() => ({
        type: 'Card',
        item: data,
        end(item, monitor) {
            const cardId = item.id
            onDraggingEnd(cardId)
        },
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.4 : 1,
        }),
    }), [onDraggingEnd])

    const cardDblClick = (cardId) => {
        onDraggingEnd(cardId, true, data?.rarity.toLowerCase() == 'legendary')
    }
    
    return (<>
        {draggable ? !collected.isDragging ? <>
            {/* <DragPreviewImage connect={dragPreview} src={data?.image} className /> */}
            <div
                {...collected}
                ref={drag}
                style={{ 'opacity': collected.opacity }}
                className={`runit ${className || ""} `}
                onDoubleClick={() => {cardDblClick(data?.id)}}
            >
                <div className='flip-card-inner'>
                    <div className='flip-card-front'>
                        <div className={`unit-back-img  ${data?.rarity.toLowerCase()}`}></div>
                        <div className={`unit-img ` + data?.rarity.toLowerCase()}>
                            <img src={data?.image ? data?.image : SoldierImg} alt='unit' />
                        </div>
                        <div className='unit-info'>
                            {data?.name ? data.name : 'Card'}
                        </div>
                    </div>
                    <div className={`flip-card-back  ${data?.rarity.toLowerCase()}`}>
                        {data?.rarity.toLowerCase() != 'legendary' ?
                            <>
                                <span><FavoriteIcon className='unit-small-img' style={{ 'color': '#ff0000b3' }} />{data?.hp || '?'}</span>
                                <span><CancelIcon className='unit-small-img' style={{ 'color': "#ffb13b" }} />{data?.attack || '?'}</span>
                                <span><BoltIcon className='unit-small-img' style={{ 'color': '#00afff' }} /> <a>{data?.speed || '?'}</a></span>
                                <span><CrisisAlertIcon className='unit-small-img' style={{ 'color': '#00c800' }} /> <a>{data?.range || '?'}</a></span>
                            </>
                            :
                            <>
                                <span>{data?.buffCategory}</span>
                                <span>{data?.buffAttribute}</span>
                                <span>{data?.buffPercentage}</span>
                            </>
                        }
                        <span>Level : {data?.level}</span>
                    </div>
                </div>
            </div>
        </> : <></>
            : <>
                <div
                    className={`runit ${className || ""}`}
                    style={style || {}}
                    onDoubleClick={() => {cardDblClick(data?.id)}}
                >
                    <div className='unit-img' onDoubleClick={() => {cardDblClick(data?.id)}}>
                        <img src={data?.image ? data?.image : SoldierImg} alt='unit' />
                    </div>
                    {/* <div className='unit-info'>
                        {data?.name ? data.name : 'Card'}
                    </div> */}
                </div>
            </>}
    </>)
}

export default RUnit