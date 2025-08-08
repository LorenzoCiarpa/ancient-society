import '../game-craft-inventory/game-craft-inventory.scss';
import './game-npc.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
} from '@mui/material';

import iconBack from '../../assets-game/arrow_back.svg';
// import craftingGif from '../../assets-game/crafting.gif';
import imgEmporium from '../../assets-game/emporium.png';
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
import inventory_item_back
  from '../../assets-ui/inventory/inventory_item_back.png';
import inventory_recipe_back
  from '../../assets-ui/inventory/inventory_recipe_back.png';
import inventory_tool_back
  from '../../assets-ui/inventory/inventory_tool_back.png';
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-craft-inventory game-npc' // ex: game-inventory
const componentTitle = 'Emporium' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['Common', 'Rare', 'Legendary', 'Lottery'] // tab display names

function GameNPC/* Component_Name_You_Want */(props) {
    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    // delegation data
    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
    const [delegationData, setDelegationData] = useState(props.delegationData)
    useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])

    // colony data
    const [idColony, setIdColony] = useState(props.idColony)
    useEffect(() => { setIdColony(props.idColony) }, [props.idColony])
    const [colonyData, setColonyData] = useState(props.colonyData)
    useEffect(() => { setColonyData(props.colonyData) }, [props.colonyData])

    // get NPC API call at first
    const [onLoading, setOnLoading] = useState(true)
    const [inventoryData, setInventoryData] = useState([])
    const [tabInventoryData, setTabInventoryData] = useState([])
    useEffect(() => {
        setTabInventoryData(inventoryData.filter(inventory => (inventory.rarity == currentTabIndex + 1)))
        setPage(1)
    }, [inventoryData, currentTabIndex])
    useEffect(() => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/inventory/getRecipeNPC',
            data: {
                address: props.metamask.walletAccount
            }
        })
            .then(response => {
                try {
                    if (response.data.success) {
                        const res = response.data.data
                        console.log(res)
                        setInventoryData(res.recipeListFinal)
                        setOnLoading(false)
                    } else {
                        setActionRes(response)
                        // this.props.callback_Logout() //Logout because the user forced the API
                    }
                } catch (err) {
                    console.error(err)
                }
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }, [])

    // pagination
    const [pageSize, setPageSize] = useState(8)
    const [page, setPage] = useState(1)
    const goToPrevPage = () => {
        playSound('button')
        if (page > 1) {
            setPage(page - 1)
        }
    }
    const goToNextPage = () => {
        playSound('button')
        if (page * pageSize < tabInventoryData.length) {
            setPage(page + 1)
        }
    }

    const [apiLoading, setApiLoading] = useState(false)
    // craft

    const craftNPC = () => {

    }

    // detail view
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentInventory, setCurrentInventory] = useState({})
    const onCloseDetailView = (e) => {
        setDetailVisible(false)
    }

    const [maxPossibleCraftCount, setMaxPossibleCraftCount] = useState(1)
    const onInventoryClick = (inventory) => {
        setConfirmActionType('load')
        setApiLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/inventory/getRecipeNPCInstance',
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idColony: idColony,
                idRecipe: inventory.id
            }
        })
            .then(response => {
                try {
                    if (response.data.success) {
                        const res = response.data.data
                        // console.log(res)
                        setCurrentInventory(res.recipeNPCData)
                        setMaxPossibleCraftCount(res.recipeNPCData.maxPossibleCraftCount)
                        setConsumableSlots(new Array(res.recipeNPCData.craft.requirements.length))
                        setApiLoading(false)
                        onResetConsumables()
                        setCraftRecipeCount(1)
                        setDetailVisible(true)
                    } else {
                        setApiLoading(false)
                        setActionRes(response)
                        // this.props.callback_Logout() //Logout because the user forced the API
                    }
                } catch (err) {
                    console.error(err)
                }
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }

    // consumables
    const [craftConsumables, setCraftConsumables] = useState([{}, {}])
    const [consumableOpen, setConsumableOpen] = useState('')
    const [consumableAnchorEl, setConsumableAnchorEL] = useState(null)
    const [consumableSlots, setConsumableSlots] = useState([])
    const onResetConsumables = () => {
        setCraftConsumables([{}, {}])
    }
    const onConsumableClick = (consumType, pconsumable) => {
        onCloseConsumable()
        if (consumType == 'craft1') {
            setCraftConsumables(craftConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'craft2') {
            setCraftConsumables(craftConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        }
    }
    const onConsumableBtnClick = (e, type) => {
        setConsumableAnchorEL(e.currentTarget)
        setConsumableOpen(type)
    }
    const onConsumableSlotClick = (tool, index) => {
        var newConsumableSlots = JSON.parse(JSON.stringify(consumableSlots))
        newConsumableSlots[index] = { id: tool.id, image: tool.image }
        setConsumableSlots(newConsumableSlots)
        onCloseConsumable()
    }
    const onCloseConsumable = () => {
        setConsumableOpen('')
    }

    // craft
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [burnToolList, setBurnToolList] = useState([])
    const [slotNeed, setSlotNeed] = useState(true)
    const onCraftBtnClick = () => {
        playSound('button')
        var newBurnToolList = []
        var requirements = currentInventory.craft.requirements, i
        for (i = 0; i < requirements.length; ++i) {
            if (requirements[i].burn) {
                if (consumableSlots[i] == undefined) {
                    break
                }
                newBurnToolList.push(consumableSlots[i].id)
            }
        }
        if (i == requirements.length) {
            setBurnToolList(newBurnToolList)
            setSlotNeed(false)
        } else {
            setSlotNeed(true)
        }
        playSound('confirm')
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const [confirmActionType, setConfirmActionType] = useState(null)
    const onCraft = () => {
        onCloseConfirmModal()
        setConfirmActionType('craft')
        setApiLoading(true)

        axios.post('/api/m1/inventory/craftNPC', {
            address: props.metamask.walletAccount,
            idDelegate: idDelegate,
            idColony: idColony,
            idRecipe: currentInventory.id,
            burnToolIds: burnToolList,
            consumableIds: [craftConsumables[0].id, craftConsumables[1].id],
            craftCount: craftRecipeCount
        })
            .then(response => onDidCraft(response))
            .catch(error => console.log(error))
    }

    // craft result
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const onDidCraft = (response) => {
        // console.log(response)
        playSound('craft')
        onResetConsumables()
        setCraftRecipeCount(1)
        setActionRes(response)
        if (response.data.success) {
            props.callback_setInventory(response.data.data.storage)
            setCurrentInventory(JSON.parse(JSON.stringify(response.data.data.currentRecipeData)))
            setMaxPossibleCraftCount(response.data.data.currentRecipeData.maxPossibleCraftCount)
        }

        setApiLoading(false)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
        setConfirmActionType(null)
    }

    const [craftRecipeCount, setCraftRecipeCount] = useState(1)

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <img className='gameComponentHeaderBack' src={gameComponentHeaderBack} alt='game-component-header-back'></img>
                    <img className='gameComponentHeaderBorder1' src={gameComponentHeaderBorder1} alt='game-component-header-border1'></img>
                    <img className='gameComponentHeaderBorder2' src={gameComponentHeaderBorder2} alt='game-component-header-border2'></img>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    <img className='gameComponentContentBorder' src={gameComponentContentBorder} alt='game-component-content-border'></img>
                    {(onLoading || apiLoading) &&
                        <div className='api-loading'>
                            {/* confirmActionType == 'craft' ? <>
                            <img className='apiCallingGif' src={craftingGif} />
                        </> :  */<span className='apiCallLoading'></span>}
                            <span className={'loader ' + confirmActionType + '-loader'}></span>
                        </div>}
                    <div className='scroll-content'>
                        {hasTab && !detailVisible &&
                            <div className='tab-navs'>
                                {tabNames.map((tabName, index) => (
                                    <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                                ))}
                            </div>}
                        {!onLoading &&
                            <>
                                <div className='page-content'>
                                    {(!detailVisible && inventoryData.length) ?
                                        <div className='craft-items'>
                                            {tabInventoryData?.map((inventory, index) => (
                                                index >= pageSize * (page - 1) && index < pageSize * page &&
                                                <div key={index} className='craft-item-wrapper'>
                                                    <div
                                                        className='craft-item'
                                                        onClick={() => { onInventoryClick(inventory) }}
                                                    >
                                                        <img className='craft-item-background' src={inventory.type == 'item' ? inventory_item_back : (inventory.type == 'tool' ? inventory_tool_back : inventory_recipe_back)} />
                                                        <div className='craft-item-container'>
                                                            <div className='craft-item-name recipe'>
                                                                <span>{inventory.name}</span>
                                                            </div>
                                                            <img className='craft-item-img recipe' src={inventory.image ? inventory.image : '..'}></img>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div> : null}

                                    {!inventoryData.length ?
                                        <div className='ATM'>
                                            <p className='notAvailableATM'>
                                                Hello Citizen! Welcome to my Emporium. I’m currently lost in my expeditions, I’ll be back soon with the best trades in the Empire!
                                            </p>
                                            <img src={imgEmporium} className='notAvailableATM_Img' />
                                        </div>
                                        : null}


                                    {detailVisible &&
                                        <div className={'detailView'}>
                                            <div className='container'>
                                                <div className='left-side'>
                                                    <div className='backBtn' onClick={onCloseDetailView}>
                                                        <img className='backImg' src={iconBack} />
                                                        <span className='backText'>Back</span>
                                                    </div>
                                                    <img className='inventory-image' src={currentInventory.image} />
                                                    <span className='inventory-name'>
                                                        {currentInventory.name}
                                                    </span>
                                                    {(idDelegate == null || delegationData.inventory) && <span className='inventory-description'>{currentInventory.description}</span>}
                                                </div>
                                                <div className='right-side'>
                                                    {(idDelegate == null || delegationData.inventory) ? <>
                                                        {currentInventory.isAvailable && (currentInventory.isAvailable.craft == true || currentInventory.isAvailable.craft == false) &&
                                                            <div className='action-panel craft-panel'>

                                                                {currentInventory.isAvailable.max &&
                                                                    <p className='supply-limited-info'>
                                                                        Supply Available: {currentInventory.isAvailable.now} / {currentInventory.isAvailable.max}
                                                                    </p>}

                                                                <div className='awards'>
                                                                    <div className='award-desc'>What will you get: </div>
                                                                    <img className='award-image' src={currentInventory.craft.product.image} />
                                                                    <div className='award-name'>{currentInventory.craft.product.name}</div>
                                                                    <div className='award-quantity'> x{currentInventory.craft.product.quantity}</div>
                                                                </div>


                                                                {currentInventory.isAvailable.craft ?
                                                                    <div className='needs'>
                                                                        <div className='actions'>
                                                                            <div className='multiple-description'>
                                                                                You can craft max {Math.max(
                                                                                    Math.min(
                                                                                        (currentInventory.isAvailable.now != null ? currentInventory.isAvailable.now : 100),
                                                                                        maxPossibleCraftCount,
                                                                                        (currentInventory.craft.hasToolBurn ? 1 : 100)
                                                                                    ),
                                                                                    1
                                                                                )} recipes at a time.
                                                                            </div>
                                                                            <input
                                                                                className='multipleInput'
                                                                                step={1}
                                                                                type='number'
                                                                                value={craftRecipeCount}
                                                                                onKeyPress={(e) => {
                                                                                    if (e.code === 'Minus') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'NumpadSubtract') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'Period') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'NumpadDecimal') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'Equal') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'NumpadAdd') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'Comma') {
                                                                                        e.preventDefault();
                                                                                    } else if (e.code === 'KeyE') {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                                onChange={(e) => {
                                                                                    if (e.target.value == 0) {
                                                                                        setCraftRecipeCount('')
                                                                                    } else {
                                                                                        setCraftRecipeCount(Math.max(
                                                                                            Math.min(
                                                                                                (currentInventory.isAvailable.now != null ? currentInventory.isAvailable.now : 100),
                                                                                                maxPossibleCraftCount,
                                                                                                parseInt(e.target.value),
                                                                                                (currentInventory.craft.hasToolBurn ? 1 : 100)
                                                                                            ),
                                                                                            1
                                                                                        ));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <div className={'actionBtn craftBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}>
                                                                                <Button variant="contained" onClick={onCraftBtnClick}>
                                                                                    Craft
                                                                                </Button>
                                                                            </div>
                                                                            <div className='consumables'>
                                                                                {currentInventory.craft.hasConsumables ?
                                                                                    <><span className='desc'>Consumable</span>
                                                                                        <div className='consumable-panel'>
                                                                                            <div
                                                                                                className={'consumableBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}
                                                                                                onClick={(e) => { onConsumableBtnClick(e, 'craft1') }}
                                                                                                id='craftConsumableBtn1'
                                                                                                aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu1' : undefined}
                                                                                                aria-haspopup="true"
                                                                                                aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                                                                                            >
                                                                                                {craftConsumables[0].id != undefined && <img className='consumable-image' src={craftConsumables[0].image}></img>}
                                                                                            </div>
                                                                                            <Menu
                                                                                                id='craftConsumableMenu1'
                                                                                                anchorEl={consumableAnchorEl}
                                                                                                open={consumableOpen == 'craft1'}
                                                                                                onClose={onCloseConsumable}
                                                                                                MenuListProps={{
                                                                                                    'aria-labelledby': 'craftConsumableBtn1',
                                                                                                }}
                                                                                                anchorOrigin={{
                                                                                                    vertical: 'bottom',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                                transformOrigin={{
                                                                                                    vertical: 'top',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                            >
                                                                                                <div className='noConsumableText'>
                                                                                                    No More Consumable
                                                                                                </div>
                                                                                                {currentInventory.craft.consumables.map((consumable, index) => (
                                                                                                    consumable.id != craftConsumables[0].id && consumable.id != craftConsumables[1].id &&
                                                                                                    <MenuItem key={index} onClick={() => onConsumableClick('craft1', consumable)}>
                                                                                                        <img className='consumableImage' src={consumable.image}></img>
                                                                                                        <div className='consumableDesc'>
                                                                                                            <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                                            <span className='consumableName'>{consumable.name}</span>
                                                                                                            <span className='consumableDescription'>{consumable.description}</span>
                                                                                                        </div>
                                                                                                    </MenuItem>
                                                                                                ))}
                                                                                            </Menu>
                                                                                            <div
                                                                                                className={'consumableBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}
                                                                                                onClick={(e) => { onConsumableBtnClick(e, 'craft2') }}
                                                                                                id='craftConsumableBtn2'
                                                                                                aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu2' : undefined}
                                                                                                aria-haspopup="true"
                                                                                                aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                                                                                            >
                                                                                                {craftConsumables[1].id != undefined && <img className='consumable-image' src={craftConsumables[1].image}></img>}
                                                                                            </div>
                                                                                            <Menu
                                                                                                id='craftConsumableMenu2'
                                                                                                anchorEl={consumableAnchorEl}
                                                                                                open={consumableOpen == 'craft2'}
                                                                                                onClose={onCloseConsumable}
                                                                                                MenuListProps={{
                                                                                                    'aria-labelledby': 'craftConsumableBtn2',
                                                                                                }}
                                                                                                anchorOrigin={{
                                                                                                    vertical: 'bottom',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                                transformOrigin={{
                                                                                                    vertical: 'top',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                            >
                                                                                                <div className='noConsumableText'>
                                                                                                    No More Consumable
                                                                                                </div>
                                                                                                {currentInventory.craft.consumables.map((consumable, index) => (
                                                                                                    consumable.id != craftConsumables[0].id && consumable.id != craftConsumables[1].id &&
                                                                                                    <MenuItem key={index} onClick={() => onConsumableClick('craft2', consumable)}>
                                                                                                        <img className='consumableImage' src={consumable.image}></img>
                                                                                                        <div className='consumableDesc'>
                                                                                                            <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                                            <span className='consumableName'>{consumable.name}</span>
                                                                                                            <span className='consumableDescription'>{consumable.description}</span>
                                                                                                        </div>
                                                                                                    </MenuItem>
                                                                                                ))}
                                                                                            </Menu>
                                                                                        </div>
                                                                                        <div className='resetBtn'>
                                                                                            <Button variant="contained" onClick={() => onResetConsumables()}>
                                                                                                Reset
                                                                                            </Button>
                                                                                        </div></> :
                                                                                    <div className='noConsumableText'>
                                                                                        {/* No Consumable */}
                                                                                    </div>}
                                                                            </div>

                                                                        </div>
                                                                        <div className='cost-list'>
                                                                            {currentInventory.craft.requirements.length == 0 &&
                                                                                <div className='noRequirementsText'>No requirements</div>}
                                                                            {currentInventory.craft.requirements.map((requirement, index) => (
                                                                                <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                                                    <div className='costDesc'>
                                                                                        {
                                                                                            requirement.level == undefined ? <span className='costQuantity'>x {requirement.quantity}</span> :
                                                                                                requirement.burn == 1 ? <span className='burnMark'>Sacrifice</span> : null
                                                                                        }
                                                                                        <span className='costName'>{requirement.name}{requirement.level != undefined ? ' + ' + requirement.level : ''}</span>
                                                                                    </div>
                                                                                    {requirement.burn != 1 && <img className='costImg' src={requirement.image} />}
                                                                                    {requirement.burn == 1 &&
                                                                                        <>
                                                                                            <div
                                                                                                className={'consumableBtn'}
                                                                                                onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + index) }}
                                                                                                id={'consumableSlot' + index}
                                                                                                aria-controls={consumableOpen == 'consumableSlot' + index ? 'consumableSlotMenu' + index : undefined}
                                                                                                aria-haspopup="true"
                                                                                                aria-expanded={consumableOpen == 'consumableSlot' + index ? 'true' : undefined}
                                                                                            >
                                                                                                {consumableSlots[index] != undefined && <img className='consumable-image' src={consumableSlots[index].image}></img>}
                                                                                            </div>
                                                                                            <Menu
                                                                                                id={'consumableSlotMenu' + index}
                                                                                                anchorEl={consumableAnchorEl}
                                                                                                open={consumableOpen == 'consumableSlot' + index}
                                                                                                onClose={onCloseConsumable}
                                                                                                MenuListProps={{
                                                                                                    'aria-labelledby': 'craftConsumableBtn',
                                                                                                }}
                                                                                                anchorOrigin={{
                                                                                                    vertical: 'bottom',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                                transformOrigin={{
                                                                                                    vertical: 'top',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                            >
                                                                                                <div className='noConsumableText'>
                                                                                                    No More Tools
                                                                                                </div>
                                                                                                {toolList.map((tool, tIndex) => (
                                                                                                    consumableSlots[index] == undefined && tool.level == requirement.level &&
                                                                                                    <MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, index)}>
                                                                                                        <img className='consumableImage' src={tool.image}></img>
                                                                                                        <div className='consumableDesc'>
                                                                                                            <span className='slotDurability'>Durable: {tool.durability}</span>
                                                                                                            <span className={'slotName' + tool.rarity}>{tool.name} + {tool.level}</span>
                                                                                                        </div>
                                                                                                    </MenuItem>
                                                                                                ))}
                                                                                            </Menu>
                                                                                        </>
                                                                                    }
                                                                                </div>
                                                                            ))}
                                                                        </div></div>
                                                                    :
                                                                    <span className='availableText'>
                                                                        {currentInventory.isAvailable.now == 0
                                                                            ? "The supply is over!"
                                                                            : "Can't craft"}
                                                                    </span>}
                                                            </div>}
                                                    </> :
                                                        <div className='item-description' style={{ marginTop: "1rem" }}>
                                                            {currentInventory.description}
                                                        </div>}

                                                </div>

                                            </div>
                                        </div>
                                    }
                                </div>
                                {!detailVisible &&
                                    <div className='pagination-panel'>
                                        <div className={'paginationBtn prevBtn'/*  + (canPreviousPage ? '' : ' notAllowed') */} onClick={() => /* canPreviousPage &&  */goToPrevPage()} ></div>
                                        <div className={'paginationBtn nextBtn'/*  + (canNextPage ? '' : ' notAllowed') */} onClick={() => /* canNextPage &&  */goToNextPage()} ></div>
                                    </div>}
                            </>
                        }
                    </div>
                </div>
                <div className='footer'>
                    <div className='footer-container'>
                        <img className='gameComponentFooterBack' src={gameComponentFooterBack} alt='game-component-footer-back'></img>
                        <img className='gameComponentFooterMark' src={gameComponentFooterMark} alt='game-component-footer-mark'></img>
                    </div>
                </div>
            </div>
            <props.ConfirmContext.ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                    {
                        currentInventory.name
                    }
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
                            slotNeed ? 'You should select the tools to be burnt' :
                                <>
                                    Do you want to try the craft? The craft could fail.<br />
                                    Probability of Success: {currentInventory.craft?.probability}%<br />
                                    Multiple crafting could take some time, max a few minutes.
                                </>
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => slotNeed ? onCloseConfirmModal() : onCraft()} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>

            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {actionRes?.data.success && actionRes?.data.data.done ? 'Success!' : 'Failed!'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {!actionRes?.data.success ? actionRes?.data.error.errorMessage : <>
                            {actionRes?.data.data.message}
                        </>}

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseActionResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {/* { onLoading ?
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
        : null } */}
    </>)
}

export default GameNPC // Component_Name_You_Want