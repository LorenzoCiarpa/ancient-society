import './rbackdrop.scss';

import { useMemo } from 'react';

import { Dialog } from '@mui/material';

function RBackdrop(props) {
  // basic attr className|style
  const className = useMemo(() => props.className, [props.className])
  const style = useMemo(() => props.style, [props.style])

  // modal data
  const modal = useMemo(() => props.modal, [props.modal])
  const open = useMemo(() => props.open, [props.open])

  // modal data
  const loadingBar = useMemo(() => props.loadingBar, [props.loadingBar])
  const textContent = useMemo(() => props.textContent, [props.textContent])

  return (<>
    <Dialog
      className={`pvp-backdrop ${className || ""}`}
      style={style || {}}
      open={open}
      keepMounted
      onClose={modal ? props.onClose : null}
    >
      <div className='pvp-backdrop-loading-bar'>
        {loadingBar}
      </div>
      <div className='pvp-backdrop-text-content'>
        {textContent}
      </div>
    </Dialog>
  </>)
}

export default RBackdrop