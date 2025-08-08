import './rpopupcomponent.scss';

import {
  useEffect,
  useState,
} from 'react';

import ClosePopupBtnImg from '../../../assets/dashboard/close-popup-btn.svg';
import SoundEffect, { playSound } from '../../../../../utils/sounds';
function RPopupComponent(props) {
    // basic attrs className|style
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    // current open status of the component
    const [open, setOpen] = useState(props.open)
    useEffect(() => {
        setOpen(props.open)
    }, [props.open])

    // display title of the component
    const [title, setTitle] = useState(props.title)
    useEffect(() => {
        setTitle(props.title)
    }, [props.title])

    return (<>
        <div className={`rpopupcomponent ${className || ""} ${open ? 'show' : 'hide'}`} style={style || {}}>
            {/* title bar */}
            <div className='component-header'>
                <div className='component-close-btn' onClick={() => [playSound('mobileMenuClose'), props.onClose()]}>
                    <img src={ClosePopupBtnImg} alt={'close'} />
                </div>
                <div className='component-title'>
                    {title}
                </div>
            </div>

            {/* main content for each panel */}
            <div className='component-content'>
                {props.children}
            </div>

            {/* footer - empty for now */}
            <div className='component-footer'>

            </div>
        </div>
    </>)
}

export default RPopupComponent