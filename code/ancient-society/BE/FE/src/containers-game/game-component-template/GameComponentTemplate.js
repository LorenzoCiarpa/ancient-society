import './GameComponentTemplate.scss';

import {
  useEffect,
  useState,
} from 'react';

const classNameForComponent = 'Class_Name_You_Want' // ex: game-inventory
const componentTitle = 'Component_Title_You_Want' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

/* 
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

<img className='gameComponentHeaderBack' src={gameComponentHeaderBack} alt='game-component-header-back'></img>
<img className='gameComponentHeaderBorder1' src={gameComponentHeaderBorder1} alt='game-component-header-border1'></img>
<img className='gameComponentHeaderBorder2' src={gameComponentHeaderBorder2} alt='game-component-header-border2'></img>

<img className='gameComponentContentBorder' src={gameComponentContentBorder} alt='game-component-content-border'></img>

<div className='footer'>
    <div className='footer-container'>
        <img className='gameComponentFooterBack' src={gameComponentFooterBack} alt='game-component-footer-back'></img>
        <img className='gameComponentFooterMark' src={gameComponentFooterMark} alt='game-component-footer-mark'></img>
    </div>
</div>

<div className='pagination-panel'>
    <div className={'paginationBtn prevBtn' + (canPreviousPage ? '' : ' notAllowed')} onClick={() => canPreviousPage && previousPage()} ></div>
    <div className={'paginationBtn nextBtn' + (canNextPage ? '' : ' notAllowed')} onClick={() => canNextPage && nextPage()} ></div>
</div>
*/

function GameComponentTemplate/* Component_Name_You_Want */(props) {
    const [onLoading, setOnLoading] = useState(true)
    useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
    }, [])

    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [doingAction, setDoingAction] = useState(false)
    const [confirmActionType, setConfirmActionType] = useState('')

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    {(onLoading || doingAction) &&
                        <div className='api-loading'>
                            <span className='apiCallLoading'></span>
                            <span className={'loader ' + confirmActionType + '-loader'}></span>
                        </div>}

                    {hasTab &&
                        <div className='tab-navs'>
                            {tabNames.map((tabName, index) => (
                                <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                            ))}
                        </div>}
                    <div className='scroll-content'>
                        {hasTab &&
                            <div className='tab-content'>
                                {/* add tab content here */}
                                <span style={{ color: 'white' }}> {currentTabIndex + 1}th Tab </span>
                            </div>}
                    </div>
                </div>
            </div>
        </div>
        {onLoading ?
            <div className='game-on-loading'>
                <div className="sk-cube-grid">
                    <div className="sk-cube sk-cube1"></div>
                    <div className="sk-cube sk-cube2"></div>
                    <div className="sk-cube sk-cube3"></div>
                    <div className="sk-cube sk-cube4"></div>
                    <div className="sk-cube sk-cube5"></div>
                    <div className="sk-cube sk-cube6"></div>
                    <div className="sk-cube sk-cube7"></div>
                    <div className="sk-cube sk-cube8"></div>
                    <div className="sk-cube sk-cube9"></div>
                </div>
            </div>
            : null}
    </>)
}

export default GameComponentTemplate // Component_Name_You_Want