import './rimgbutton.scss';

import {
  useEffect,
  useState,
} from 'react';

import ButtonBackDanger
  from '../../../assets/basic/button/button-danger-back.png';
import ButtonBackSuccess
  from '../../../assets/basic/button/button-success-back.png';

function RImgButton(props) {
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    return (<>
        <div className={`rimgbutton ${className || ""}`} style={style || {}} onClick={props.onClick}>
            <img className="rimgbutton-background" src={(className && className.includes('rsuccess')) ? ButtonBackSuccess : ButtonBackDanger} alt={"button"} />
            <span className='rimgbutton-text'>{props.children}</span>
        </div>
    </>)
}

export default RImgButton