import './runit.scss';

import {
  useEffect,
  useState,
} from 'react';

import SoldierImg from '../../../assets/battle-panel/soldier.png';

function RUnit(props) {
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    const [dragging, setDragging] = useState(false)

    const onDragStart = (e) => {
        e.dataTransfer.setData('data', JSON.stringify({ img: SoldierImg, name: 'soldier', attr: {} }))
        setDragging(true)
    }

    const onDragEnd = (e) => {
        setDragging(false)
    }

    const onMouseDown = (e) => {
        props.draggable ? null : e.preventDefault()
    }

    return (<>
        <div className={`runit ${dragging ? 'dragging' : ''} ${className || ""}`} style={style || {}} onMouseDown={onMouseDown} draggable={props.draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className='unit-img'>
                <img src={SoldierImg} alt='unit' />
            </div>
            <div className='unit-info'>
                Name
            </div>
        </div>
    </>)
}

export default RUnit