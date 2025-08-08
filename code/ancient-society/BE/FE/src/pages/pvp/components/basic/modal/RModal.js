import './rmodal.scss';

import {
  forwardRef,
  useMemo,
} from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
} from '@mui/material';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />
});

function RModal(props) {
  // basic attr className|style
  const className = useMemo(() => props.className, [props.className])
  const style = useMemo(() => props.style, [props.style])

  // open status
  const open = useMemo(() => props.open, [props.open])

  // modal data
  const title = useMemo(() => props.title, [props.title])
  const content = useMemo(() => props.content, [props.content])
  const actions = useMemo(() => props.actions, [props.actions])

  return (<>
    <Dialog
      className={`pvp-confirm-modal ${className || ""}`}
      style={style || {}}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.onClose}
    >
      <DialogTitle className='pvp-confirm-modal-header'>
        {title}
      </DialogTitle>
      <DialogContent className='pvp-confirm-modal-content'>
        {content}
      </DialogContent>
      <DialogActions className='pvp-confirm-modal-footer'>
        {actions}
      </DialogActions>
    </Dialog>
  </>
  )
}

export default RModal