import './runitlist.scss';

import {
  useEffect,
  useState,
} from 'react';

import RUnit from '../unit/RUnit';

function RUnitList(props) {
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    return (<>
        <div className={`runitlist ${className || ""}`} style={style || {}}>
            {Array(10).fill(2).map((unit, index) => (
                <RUnit className={className} draggable={props.draggable} key={index} data={unit} />
            ))}
        </div>
    </>)
}

export default RUnitList