import "./notification.scss";
import iconClose from '../../assets/close_white_24dp.svg';

import { useEffect, useRef, useState } from "react";

import axios from "axios";

import {
  Button,
  LinearProgress,
  SvgIcon,
} from "@mui/material";

import gameComponentContentBorder
  from '../../assets-ui/game-component/content-border.png';
import gameComponentFooterBack
  from '../../assets-ui/game-component/footer-back.png';
import gameComponentFooterMark
  from '../../assets-ui/game-component/footer-mark.png';
import gameComponentHeaderBack
  from '../../assets-ui/game-component/header-back.png';
import gameComponentHeaderBorder1
  from '../../assets-ui/game-component/header-border-1.png';
import gameComponentHeaderBorder2
  from '../../assets-ui/game-component/header-border-2.png';

function Notification(props) {
  const [visible, setVisible] = useState(true);
  const [tutorial, setTutorial] = useState(props.notification);
  useEffect(() => {
    if (!props.notification) return
    setTutorial(props.notification)
    setVisible(true)
    console.log(props.notification)
  }, [props.notification]);

  return (
    <>
      <div className={`game-component notification-handler ${visible ? 'visible' : 'notVisible'}`}>
        <div className="game-container">

          <div className='header'>
              <img className='gameComponentHeaderBack' src={gameComponentHeaderBack} alt='game-component-header-back'></img>
              <img className='gameComponentHeaderBorder1' src={gameComponentHeaderBorder1} alt='game-component-header-border1'></img>
              <img className='gameComponentHeaderBorder2' src={gameComponentHeaderBorder2} alt='game-component-header-border2'></img>
              <span className='title'>{tutorial.headline}</span>
          </div>

          <div className="content">
            <img className='gameComponentContentBorder' src={gameComponentContentBorder} alt='game-component-content-border'></img>

            <div className="scroll-content">
                {tutorial 
                ? <Tutorial 
                    tutorialPages={tutorial}
                    closeCallback={()=>{
                      setVisible(false)
                      props.closeCallback()
                    }}
                  /> 
                : null}
            </div>
          </div>

          <div className='footer'>
              <div className='footer-container'>
                  <img className='gameComponentFooterBack' src={gameComponentFooterBack} alt='game-component-footer-back'></img>
                  <img className='gameComponentFooterMark' src={gameComponentFooterMark} alt='game-component-footer-mark'></img>
              </div>
          </div>

        </div>
      </div>
    </>
  );
}

function Tutorial(props) {
  //All Pages
  const [tutorialPages, setTutorialPages] = useState(props.tutorialPages.elements);
  const [tutorialMaxPages, setTutorialMaxPages] = useState(0);

  useEffect(() => {
    setTutorialPages(props.tutorialPages.elements)
    setTutorialMaxPages(Object.keys(props.tutorialPages.elements).length-1);
  }, [props.tutorialPages]);
  

  //Current Page
  const [tutorialPage, setTutorialPage] = useState(0);

  const previousPage = () => {
    if (tutorialPage == 0) return
    setTutorialPage(tutorialPage-1)
  }
  const nextPage = () => {
    if (tutorialPage == tutorialMaxPages) return
    setTutorialPage(tutorialPage+1)
  }

  return (
    <div className="notification-tutorial">

      {/* HEADLINE AVAILABLE */}
      {tutorialPages[tutorialPage].headline
      ? <div className="tutorialHead">
        <h2>{tutorialPages[tutorialPage].headline}</h2>
      </div>
      : null}

      {/* IMAGE AVAILABLE */}
      {tutorialPages[tutorialPage].image
      ? <img src={tutorialPages[tutorialPage].image} className='tutorialImg'/>
      : null}
      
      {/* TEXT AVAILABLE */}
      {tutorialPages[tutorialPage].text
      ? <p className='tutorialText'>{tutorialPages[tutorialPage].text}</p>
      : null}

      {/* CTA? */}
      {tutorialPages[tutorialPage].cta_url
      ? <Button
        onClick={()=>window.open(tutorialPages[tutorialPage].cta_url, '_blank')}
        className={"btnUI"}>
          {tutorialPages[tutorialPage].cta_text}
        </Button>
      : null}

      <div className="tutorialNav">

        {tutorialMaxPages == 0 
          ? null //<Button variant="outlined" onClick={()=>props.closeCallback()}>{`Close`}</Button>
          : tutorialMaxPages > tutorialPage
          ?<>
            <Button onClick={()=>previousPage()}>{`<`}</Button>
              <p>{`${tutorialPage+1}/${tutorialMaxPages+1}`}</p>
            <Button onClick={()=>nextPage()}>{`>`}</Button>
          </>
          : 
            <>
              <Button onClick={()=>previousPage()}>{`<`}</Button>
                {/* <Button variant="outlined" onClick={()=>props.closeCallback()}>{`Close`}</Button> */}
              <Button onClick={()=>nextPage()}>{`>`}</Button>
            </>
        }


      </div>
    </div>
  );
}

export default Notification;