import './rshoppanel.scss';

import * as React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import useSound from 'use-sound';

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Badge,
  CircularProgress,
  Menu,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material';

import AlphaMarketplaceABI from '../../../../ABIs/alpha-market-abi.json';
import { serverConfig } from '../../../../config/serverConfig';
import {
  format,
  toFixed,
} from '../../../../utils/utils';
import PVPPoints from '../../assets/basic/PVPPoints.png';
import TestDropImg from '../../assets/inventory-panel/chest.png';
import RBackdrop from '../basic/backdrop/RBackdrop';
import RButton from '../basic/button/RButton';
import RInput from '../basic/input/RInput';
import RModal from '../basic/modal/RModal';
import RInventory from '../inventory-panel/inventory/RInventory';

const tabNames = ['All', 'Card', 'Gear', 'Item', 'Buy']
//Alpha Ancient Marketplace Contract Address
const contractAlphaMarketplaceAddress = serverConfig?.contracts.gemMarketplace || '0x0000000000000000000000000000000000000000'
//Alpha Ancient Marketplace Contract ABI
const contractAlphaMarketplaceABI = AlphaMarketplaceABI
function RShopePanel(props) {
	const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;
	const isMute = localStorage.getItem('isMute')
	const [play, { stop }] = useSound(
		`${ASSETS_PATH}/common/touch.mp3`,
		{ volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
	);
	const [playConfirm] = useSound(
		`${ASSETS_PATH}/common/confirm.mp3`,
		{ volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
	);
	// set loading bar
	const [loadingBar, setLoadingBar] = useState(false)
	// get all inventories
	const [toolList, setToolList] = useState([])
	const [inventories, setInventories] = useState([]);
	const [currentBalanceNative, setCurrentBalanceNative] = useState(0)
	useEffect(() => {
		console.log('get all inventories')
		getAllInventories()
		getAllUserCards()
		setCurrentBalanceNative(checkBalanceNATIVE())
	}, [])

	// get all user inventories from server
	const getAllInventories = () => {
		setLoadingBar(true)
		axios
			.post("/api/m1/pvp/getInventoryListPvp", {
				address: props.metamask,
			})
			.then((response) => {
				if (response.data.success) {
					// set user inventories from server
					let newInventories = JSON.parse(JSON.stringify(response.data.data))
					var newToolList = []
					for (var i = 0; i < newInventories?.length; ++i) {
						if (newInventories[i].type == 'gear' || newInventories[i].type == 'item') {
							newToolList.push(newInventories[i])
						}
					}
					setToolList(newToolList)
				}
				setLoadingBar(false)
			})
			.catch((error) => {
				console.log(error)
				setLoadingBar(false)
			});
	}

	const [cards, setCards] = useState([])
	// get all user cards from server
	const getAllUserCards = () => {
		setLoadingBar(true)
		axios
			.post("/api/m1/pvp/getCardList", {
				address: props.metamask,
			})
			.then((response) => {
				if (response.data.success) {
					// set user inventories from server
					let newCards = JSON.parse(JSON.stringify(response.data.data))
					newCards.sort((curr, next) => { return next.level - curr.level })
					setCards(newCards)
				}
				setLoadingBar(false)
			})
			.catch((error) => {
				console.log(error)
				setLoadingBar(false)
			});
	}

	const [contentLoading, setContentLoading] = useState(false)
	const getAllNPCs = () => {
		setContentLoading(true)
		axios
			.post("/api/m1/inventory/getPvpRecipeNPC", {
				address: props.metamask,
			})
			.then((response) => {
				if (response.data.success) {
					// set user inventories from server
					let newInventories = JSON.parse(JSON.stringify(response.data.data))
					setInventories(newInventories)
				}
				setContentLoading(false)
			})
			.catch((error) => {
				console.log(error)
				setContentLoading(false)
			});
	}

	const [gems, setGems] = useState([]);
	const [bundleGems, setBundleGems] = useState([]);
	const getAllBundleGems = () => {
		setContentLoading(true)
		axios
			.post("/api/m1/pvp/getBundleGemPvp", {
				address: props.metamask,
			})
			.then((response) => {
				if (response.data.success) {
					console.log(response.data.data)
					// set user inventories from server
					let newGems = JSON.parse(JSON.stringify(response.data?.data?.gemList))
					setBundleGems(newGems)
				}
				setContentLoading(false)
			})
			.catch((error) => {
				console.log(error)
				setContentLoading(false)
			});
	}

	const getAllGems = () => {
		setContentLoading(true)
		axios
			.post("/api/m1/pvp/getRecipeGemPvp", {
				address: props.metamask,
			})
			.then((response) => {
				if (response.data.success) {
					// set user inventories from server
					let newGems = JSON.parse(JSON.stringify(response.data.data?.recipeListFinal))
					setGems(newGems)
				}
				setContentLoading(false)
			})
			.catch((error) => {
				console.log(error)
				setContentLoading(false)
			});
	}
	// basic attr className|style
	const [className, setClassName] = useState(props.className)
	useEffect(() => {
		setClassName(props.className)
	}, [props.className])

	const [style, setStyle] = useState(props.style)
	useEffect(() => {
		setStyle(props.style)
	}, [props.style])

	// tab handling
	const [currentTabName, setCurrentTabName] = useState(tabNames[0])
	const onTabClick = (tabName) => {
		setCurrentTabName(tabName)
	}
	useEffect(() => {
		setInventories(inventories)
	}, [currentTabName])

	const tabFilter = (item) => {
		if (currentTabName == 'All' || currentTabName == 'Buy')
			return true
		if (currentTabName == 'Card') {
			return item.idCard != null
		}
		if (currentTabName == 'Gear') {
			return item.idGear != null
		}
		if (currentTabName == 'Item') {
			return item.idItem != null
		}
		if (item.type == currentTabName.toLocaleLowerCase())
			return true
		else
			return false
	}

	const getCountsGroupByTabName = (tabName) => {
		let lists = []
		headerTab == 0 ? lists = inventories : lists = gems
		if (headerTab == 1 && tabName === 'Buy') {
			return bundleGems.length
		}
		else if (tabName == 'All')
			return lists.length
		else if (tabName == 'Item') {
			return lists.filter(item => item?.idItem != null).length
		}
		else if (tabName == 'Card') {
			return lists.filter(item => item?.idCard != null).length
		}
		else if (tabName == 'Gear') {
			return lists.filter(item => item?.idGear != null).length
		}
		else {
			return lists.filter(item => (tabName.toLowerCase() == item.type ? true : false)).length
		}
	}

	// Confirm Modal handling
	const [actionType, setActionType] = useState(null)
	const [actionContent, setActionContent] = useState('')
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [onDoing, setOnDoing] = useState(false)
	const [confirmActionType, setConfirmActionType] = useState(null)

	const onCancelAction = () => {
		setConfirmModalOpen(false)
	}

	// set burnId params
	const [burnToolList, setBurnToolList] = useState([])
	const [consumableAnchorEl, setConsumableAnchorEL] = useState(null)
	const [consumableOpen, setConsumableOpen] = useState('')
	const [consumableSlots, setConsumableSlots] = useState([])
	const onConsumableSlotClick = (tool, index, type) => {
		var newConsumableSlots = JSON.parse(JSON.stringify(consumableSlots))
		if (type == 'card') {
			newConsumableSlots[index] = { id: tool.idCard, image: tool.image, type: type, name: tool.name }
		}
		else {
			newConsumableSlots[index] = { id: tool.id, image: tool.image, type: type, name: tool.name }
		}
		setConsumableSlots(newConsumableSlots)
		onCloseConsumable()
	}

	const onConsumableBtnClick = (e, type) => {
		setConsumableAnchorEL(e.currentTarget)
		setConsumableOpen(type)
	}

	const onCloseConsumable = () => {
		setConsumableOpen('')
	}

	// click sure button
	const onSureAction = () => {
		console.log('buy chest', buyQuantity)
		setLoadingBar(true)
		let burnGearIds = [...consumableSlots.filter((record) => record?.type == 'gear')?.map((item) => { return item.id })]
		let burnCardIds = [...consumableSlots.filter((record) => record?.type == 'item')?.map((item) => { return item.id })]
		if (headerTab == 0) {
			axios
				.post("/api/m1/pvp/craftPvpNPC", {
					address: props.metamask,
					idRecipe: selectedInventoryData?.id,
					burnGearIds: burnGearIds,
					burnCardIds: burnCardIds,
					consumableIds: [],
					craftCount: buyQuantity
				})
				.then((response) => {
					console.log('craftPvpNPC:', response.data)
					if (response.data.success) {
						// show selected inventory details
						updateInventoryData(response.data.data)
						toast.success(response.data.data.data?.message)
						setConsumableSlots(new Array(3))
						setConfirmModalOpen(false)
						openDetail()
					}
					else {
						toast.warning(response.data?.error?.message)
					}
					setLoadingBar(false)
				})
				.catch((error) => {
					console.log(error)
					setConfirmModalOpen(false)
					toast.error('Something is wrong! please try again later.')
					setLoadingBar(false)
				});
		}
		else if (currentTabName != 'Buy') {
			axios
				.post("/api/m1/pvp/craftGemPvp", {
					address: props.metamask,
					idRecipe: selectedInventoryData?.id,
					burnGearIds: burnGearIds,
					burnCardIds: burnCardIds,
					consumableIds: [],
					craftCount: buyQuantity
				})
				.then((response) => {
					console.log('craftGemPvp:', response.data)
					if (response.data.success) {
						// show selected inventory details
						updateInventoryData(response.data.data)
						toast.success(response.data.data.data?.message)
						setConsumableSlots(new Array(3))
						setConfirmModalOpen(false)
						openDetail()
					}
					else {
						toast.warning(response.data?.error?.message)
					}
					setLoadingBar(false)
				})
				.catch((error) => {
					console.log(error)
					setConfirmModalOpen(false)
					toast.error('Something is wrong! please try again later.')
					setLoadingBar(false)
				});
		}
		else {
			Purchase()
		}
	}

	// purchase process
	const Purchase = async () => {
		console.log('purchase', selectedInventoryData, buyQuantity, selectedInventoryData.price)
		// check user's balance to purchase
		const purchaseNativePrice = selectedInventoryData.price * buyQuantity
		const _currentBalanceNative = await checkBalanceNATIVE()
		setCurrentBalanceNative(_currentBalanceNative)
		console.log(currentBalanceNative)
		if (currentBalanceNative < purchaseNativePrice) {
			onDidAction({
				data: {
					success: false,
					error: {
						errorMessage: `You haven't got enough MATIC to purchase, you have ${toFixed(currentBalanceNative, 4)} MATIC now`
					}
				}
			})
		} else {
			// call ABI-Purchase
			mint()
		}
		setLoadingBar(false)
	}
	const checkBalanceNATIVE = async () => {
		const balance = await props.walletProvider.getBalance(props.metamask);
		console.log('wallet balance', balance);
		return (ethers.utils.formatEther(balance))
	}

	const mint = async () => {
		console.log(props.walletSigner)
		//Vars Declaration
		let mint = null;
		let receipt = null;

		//Initialize the Contract Object
		let contract = new ethers.Contract(contractAlphaMarketplaceAddress, contractAlphaMarketplaceABI, props.walletSigner);

		//Purchase
		let overrides = {
			value: ethers.utils.parseEther(toFixed(selectedInventoryData.price * buyQuantity, 4).toString())
		}; //Because it's NATIVE CURRENCY

		try {
			mint = await contract.purchase(
				selectedInventoryData.idBundleGems,
				buyQuantity,
				overrides
			);
		} catch (err) {
			toast.warning(err.message);
			setLoadingBar(false);
			return
		}

		if (mint) {
			let toastLoading = toast.loading('Purchasing... Almost done!')

			receipt = await mint.wait();

			toast.update(toastLoading, {
				render: "Done!",
				type: "success",
				isLoading: false,
				autoClose: 5000
			});

			onDidAction({
				data: {
					success: true,
					data: {
						message: "Successfully done."
					}
				}
			})
		} else {
			toast.warning('Error, try again!');
			setLoadingBar(false);
		}
	}

	const onDidAction = (response) => {
		console.log('didAction confirmActionType: ', response)
		if (response.data.success) {
			toast.success(response.data.message)
		}
		else {
			toast.warning(response.data.error.errorMessage);
		}

		setConfirmModalOpen(false)
	}

	// update NPC data
	const updateInventoryData = (data) => {
		if (data.success && data.data?.inventory != undefined) {
			let orgInventoryData = JSON.parse(JSON.stringify(inventories))
			let orgCurrentInventory = JSON.parse(JSON.stringify(selectedInventoryData))
			const inventory = data.data?.inventory
			for (let i = 0; i < inventory.length; ++i) {
				const elements = inventory[i].elements
				for (let j = 0; j < elements.length; ++j) {
					const action = inventory[i].action, element = elements[j]
					if (action == 'edit') {
						editInventory(element, orgInventoryData, orgCurrentInventory)
					} else if (action == 'add') {
						if (element.type != 'card') {
							addInventory(element, orgInventoryData)
						}
					} else if (action == 'remove') {
						removeInventory(element, orgInventoryData)
					}
				}
			}
			let isCurrentInventoryEmpty = true
			for (let x in selectedInventoryData) {
				if (x != undefined && x != null) {
					isCurrentInventoryEmpty = false
					break
				}
			}
			if (!isCurrentInventoryEmpty) {
				setSelectedInventoryData(orgCurrentInventory)
			}

			var newInventoryData = []
			for (let i = 0; i < orgInventoryData.length; ++i) {
				if (orgInventoryData[i].remove) {
					continue
				}
				newInventoryData.push(orgInventoryData[i])
			}
			setInventories(JSON.parse(JSON.stringify(newInventoryData)))
			setCurrentTabName(currentTabName)
			// onShowDetail(selectedInventoryData)
		}

		if (data.success && data.data?.storage != undefined) {
			let storage = data.data?.storage
			if (storage.pvpPoints) {
				let userData = props.userdata
				userData.pvpPoints = storage.pvpPoints
				props.setUserData(userData, 'pvpPoints', storage.pvpPoints)
			}
			if (storage.warPoints) {
				let userData = props.userdata
				userData.pvpPoints = storage.warPoints
				props.setUserData(userData, 'warPoints', storage.warPoints)
			}
		}
	}

	const editInventory = (inventory, orgInventoryData, orgCurrentInventory) => {
		if (inventory.id == orgCurrentInventory.id && inventory.type == orgCurrentInventory.type) {
			for (let x in inventory) {
				orgCurrentInventory[x] = inventory[x]
				orgCurrentInventory[x] = inventory[x]
			}
			setMaxPossibleCraftCount(orgCurrentInventory.maxPossibleCraftCount)
		}
		for (let i = 0; i < orgInventoryData.length; ++i) {
			if (orgInventoryData[i].id == inventory.id && orgInventoryData[i].type == inventory.type) {
				for (let x in orgInventoryData[i]) {
					orgInventoryData[i][x] = inventory[x] != undefined ? inventory[x] : orgInventoryData[i][x]
				}
			}
		}
	}
	const addInventory = (inventory, orgInventoryData) => {
		if (orgInventoryData.type == 'recipe')
			orgInventoryData.push(inventory)
	}
	const removeInventory = (inventory, orgInventoryData) => {
		for (let i = 0; i < orgInventoryData.length; ++i) {
			if (orgInventoryData[i].id == inventory.id && orgInventoryData[i].type == inventory.type) {
				orgInventoryData[i].remove = true
			}
		}
		if (inventory.id == selectedInventoryData.id && inventory.type == selectedInventoryData.type) {
			setSelectedInventoryData({})
			setShowDetail(false)
		}
	}

	// detail view handling
	const [showDetail, setShowDetail] = useState(false)
	const [selectedInventoryData, setSelectedInventoryData] = useState({})
	const [drops, setDrops] = useState([])
	useEffect(() => {
		let gots = selectedInventoryData?.type == 'item' && selectedInventoryData?.isChest ? selectedInventoryData?.chest?.loots : [selectedInventoryData?.craft?.product]
		setDrops(gots)
	}, [selectedInventoryData])
	const onShowDetail = (inventoryData, isGem = false) => {
		setBuyQuantity(1)
		if (currentTabName == 'Buy') {
			setSelectedInventoryData(inventoryData)
			openDetail()
			return;
		}
		setConsumableSlots(new Array(3))
		setLoadingBar(true)

		if (isGem) {
			axios
				.post("/api/m1/pvp/getRecipeGemInstancePvp", {
					address: props.metamask,
					idRecipe: inventoryData.id,
				})
				.then((response) => {
					console.log('getRecipeGemInstancePvp', response.data)
					if (response.data.success) {
						// show selected inventory details
						let selectedGem = JSON.parse(JSON.stringify(response.data.data?.recipeGemData))
						selectedGem.product = {
							craftedImage: selectedGem?.craft?.product.image,
							craftedName: selectedGem?.craft?.product.name,
							quantity: selectedGem?.craft?.product.quantity,
						}
						setSelectedInventoryData(selectedGem)
						openDetail()
					}
					setLoadingBar(false)
				})
				.catch((error) => {
					console.log(error)
					setLoadingBar(false)
				});
		}
		else {
			axios
				.post("/api/m1/inventory/getPvpRecipeNPCInstance", {
					address: props.metamask,
					idRecipe: inventoryData.id,
				})
				.then((response) => {
					console.log('getPvpRecipeNPCInstance', response.data)
					if (response.data.success) {
						// show selected inventory details
						setSelectedInventoryData(JSON.parse(JSON.stringify(response.data.data)))
						openDetail()
					}
					setLoadingBar(false)
				})
				.catch((error) => {
					console.log(error)
					setLoadingBar(false)
				});
		}
	}
	const openDetail = () => {
		setShowDetail(true)
	}
	const closeDetail = () => {
		setShowDetail(false)
	}

	// Inventory Actions Open | Craft | Buy
	const [buyQuantity, setBuyQuantity] = useState(1)
	const onOpenQuantityChange = (e) => {
		onBuyQuantityChange(Math.max(0, Math.min(/* selectedInventoryData.quantity,  */e.target.value, 100)))
	}

	const onBuyQuantityChange = (e) => {
		setBuyQuantity(Math.max(0, Math.min(e.target.value, 100)))
	}
	const onBuyRecipe = () => {
		playConfirm()
		if (headerTab == 0) {
			let burnGearIds = [...consumableSlots.filter((record) => record?.type == 'gear')?.map((item) => { return item.id })]
			let burnCardIds = [...consumableSlots.filter((record) => record?.type == 'item')?.map((item) => { return item.id })]

			if (selectedInventoryData?.craft?.gear?.burn) {
				if (burnGearIds.length == 0) {
					toast.warning('You must select the burning gear to craft this NPC.')
					return
				}
			}
			if (selectedInventoryData?.craft?.card?.burn) {
				if (burnCardIds.length == 0) {
					toast.warning('You must select the burning card to craft this NPC.')
					return
				}
			}
			setActionType('Craft NPC')
		}
		if (headerTab == 1) {
			let burnGearIds = [...consumableSlots.filter((record) => record?.type == 'gear')?.map((item) => { return item.id })]
			let burnCardIds = [...consumableSlots.filter((record) => record?.type == 'item')?.map((item) => { return item.id })]

			if (selectedInventoryData?.craft?.gearRequirements?.burn) {
				if (burnGearIds.length == 0) {
					toast.warning('You must select the burning gear to craft this Gem.')
					return
				}
			}
			if (selectedInventoryData?.craft?.cardRequirements?.burn) {
				if (burnCardIds.length == 0) {
					toast.warning('You must select the burning card to craft this Gem.')
					return
				}
			}
			if (currentTabName == 'Buy') {
				setActionType('Buy Gem')
			}
			else {
				setActionType('Craft Gem')
			}
		}
		setConfirmModalOpen(true)
	}

	const [headerTab, setHeaderTab] = React.useState(0);

	const handleChange = (event, newValue) => {
		setCurrentTabName('All')
		setHeaderTab(newValue);
	};

	useEffect(() => {
		if (headerTab == 0) {
			getAllNPCs()
		}
		else if (headerTab == 1) {
			getAllGems()
			getAllBundleGems()
		}
	}, [headerTab])

	return (<>
		{!showDetail ?
			<Tabs value={headerTab} className='header-tab' onChange={handleChange} centered>
				<Tab iconPosition="start" className={`shop-tab-item` + (headerTab == 0 ? ' selected' : '')} label="NPC" />
				<Tab className={`shop-tab-item` + (headerTab == 1 ? ' selected' : '')} label="GEM" />
			</Tabs>
			:
			<></>
		}
		<div className={`rshoppanel ${className || ""}`} style={style || {}}>
			<RBackdrop
				open={loadingBar}
				loadingBar={<>
					<CircularProgress color="inherit" />
				</>}
				textContent={<>
					Loading.. It will take a few seconds. :)
				</>}
			/>
			{!showDetail ?
				<>
					<div className='panel-tabs'>
						{tabNames.map((tabName, index) => (
							headerTab == 0 && index == 4 ? ""
								:
								<div key={index} className={`panel-tab ${tabName == currentTabName ? 'selected' : ''} ${index == 4 ? 'buy-tab' : ''}`} onClick={() => { onTabClick(tabName) }}>
									{getCountsGroupByTabName(tabName) > 0 ?
										<Badge badgeContent={getCountsGroupByTabName(tabName) == 0 ? '' : getCountsGroupByTabName(tabName)} color="warning">
											{tabName}
										</Badge>
										:
										<>{tabName}</>
									}
								</div>
						))}
					</div>
					<div className='inventory-list'>

						{
							contentLoading ?
								<div className='api-loading' style={{ 'position': 'relative', 'background': 'none', "border": 'none' }}>
									{
										<span className='apiCallLoading'></span>
									}
								</div>
								:
								headerTab == 0 ?
									inventories.filter(tabFilter).length == 0 ?
										<>
											<div className='error-inventory'>There is nothing to buy.</div>
										</>
										:
										inventories.filter(tabFilter).map((data, index) => (
											<RInventory key={index} data={data} onShowDetail={() => [play(), onShowDetail(data)]} isShopInventory={true} />
										))
									:
									currentTabName !== 'Buy' ?
										gems.filter(tabFilter).length == 0 ?
											<>
												<div className='error-inventory'>There is nothing to buy.</div>
											</>
											:
											gems.filter(tabFilter).map((data, index) => (
												<RInventory key={index} data={data} onShowDetail={() => [play(), onShowDetail(data, true)]} isShopInventory={false} />
											))
										:
										bundleGems.length == 0 ?
											<>
												<div className='error-inventory'>There is no Gem to buy.</div>
											</>
											:
											bundleGems.map((data, index) => (
												<RInventory key={index} data={data} onShowDetail={() => [play(), onShowDetail(data, true)]} isShopInventory={false} />
											))
						}
					</div>
				</>
				:
				<>
					<div className='detail-view'>
						{/* back btn */}
						<div className='backBtn' onClick={closeDetail}>
							<KeyboardBackspaceIcon />
						</div>

						<div className='left-panel'>
							<div className='inventory-img'>
								<img src={selectedInventoryData?.img || selectedInventoryData?.image} alt={'inventory'} />
							</div>
							<div className='inventory-info'>
								<div className='inventory-name'>
									{selectedInventoryData?.name || 'Test Inventory Name'}
								</div>
								{/* <div className='inventory-quantity'>
                                    x {selectedInventoryData?.quantity || 1}
                                </div> */}
							</div>
							<div className='inventory-description'>
								{selectedInventoryData?.description || selectedInventoryData?.itemDescription || 'Test Inventory Description Here, you could see the detailed description of the Inventory(Chest)'}
							</div>
						</div>

						<div className='right-panel'>
							<div className='inventory-drop-text'>
								What you get
							</div>
							<div className='inventory-drops'>
								{
									currentTabName != 'Buy' ?
										selectedInventoryData?.product ?
											<div className='inventory-drop' title={selectedInventoryData?.product.craftedName || 'Drop'}>
												<div className='inventory-drop-img'>
													<img src={selectedInventoryData?.product.craftedImage} alt={'drop'} />
												</div>
												<div className='inventory-drop-info'>
													<div className='inventory-drop-name'>
														{selectedInventoryData?.product.craftedName || 'Drop'}
													</div>
													<div className='inventory-drop-quantity'>
														x {selectedInventoryData?.product.quantity || 1}
													</div>
												</div>
											</div>
											:
											<></>
										:
										<div className='inventory-drop' title={selectedInventoryData?.name || 'Drop'}>
											<div className='inventory-drop-img'>
												<img src={selectedInventoryData?.itemImage} alt={'drop'} />
											</div>
											<div className='inventory-drop-info'>
												<div className='inventory-drop-name'>
													{selectedInventoryData?.name || 'Drop'}
												</div>
												<div className='inventory-drop-quantity'>
													x {selectedInventoryData?.quantity || 1}
												</div>
											</div>
										</div>
								}
							</div>
							{selectedInventoryData?.craft ?
								<>
									<div className='inventory-cost-text'>
										Requirements
									</div>
									<div className='inventory-costs'>
										{
											headerTab == 0 ?
												<>
													{(selectedInventoryData?.craft?.card?.burn !== undefined) ?
														<div className={'inventory-cost' + (!selectedInventoryData?.craft?.card?.isAllowed ? '' : ' notAllowed')}>
															{selectedInventoryData?.craft?.card?.burn != 1 && <div className='inventory-cost-img'>
																<img src={selectedInventoryData?.craft?.card?.image || TestDropImg} alt={'cost'} />
															</div>}
															{selectedInventoryData?.craft?.card?.burn == 1 &&
																<>
																	<div
																		className={'consumableBtn'}
																		onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + 2) }}
																		id={'consumableSlot' + 2}
																		aria-controls={consumableOpen == 'consumableSlot' + 2 ? 'consumableSlotMenu' + 2 : undefined}
																		aria-haspopup="true"
																		aria-expanded={consumableOpen == 'consumableSlot' + 2 ? 'true' : undefined}
																	>
																		{consumableSlots[2] != undefined && <img className='consumable-image' src={consumableSlots[2].image || TestDropImg}></img>}
																	</div>
																	<Menu
																		id={'consumableSlotMenu' + 0}
																		anchorEl={consumableAnchorEl}
																		open={consumableOpen == 'consumableSlot' + 2}
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
																		{cards?.filter((card) => card.level == selectedInventoryData?.craft?.card?.level && card.card_id == selectedInventoryData?.craft?.card?.idCard).map((tool, tIndex) => (
																			(consumableSlots[2] == undefined || consumableSlots[2].id != tool.id) && tool.level == selectedInventoryData?.craft?.card.level &&
																			<MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, 2, 'card')}>
																				<img className='consumableImage' src={tool.image || TestDropImg}></img>
																				<div className='consumableDesc'>
																					{/* <BonusBar info={tool.bonuses} /> */}
																					<span className='slotDurability'>{tool.name}</span>
																					<span className={'slotName1'}>Lv : {selectedInventoryData?.craft?.card.level}</span>
																				</div>
																			</MenuItem>
																		))}
																	</Menu>
																</>
															}
															<div className='inventory-cost-info' title={(!selectedInventoryData?.craft?.card?.brun ? consumableSlots[2]?.name : selectedInventoryData?.craft?.gear?.name) || 'no selected'}>
																<div className='inventory-cost-name'>
																	{(!selectedInventoryData?.craft?.card?.brun ? consumableSlots[2]?.name : selectedInventoryData?.craft?.gear?.name) || 'no selected'}
																</div>
																<div className='inventory-cost-quantity'>
																	Lv : {selectedInventoryData?.craft?.card?.level}
																</div>
															</div>
														</div>
														:
														<></>
													}
													{(selectedInventoryData?.craft?.gear?.burn !== undefined) ?
														<div className={'inventory-cost' + (!selectedInventoryData?.craft?.gear?.isAllowed ? '' : ' notAllowed')}>
															{selectedInventoryData?.craft?.gear?.burn != 1 && <div className='inventory-cost-img'>
																<img src={selectedInventoryData?.craft?.gear?.image || TestDropImg} alt={'cost'} />
															</div>}
															{selectedInventoryData?.craft?.gear?.burn == 1 &&
																<>
																	<div
																		className={'consumableBtn'}
																		onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + 0) }}
																		id={'consumableSlot' + 0}
																		aria-controls={consumableOpen == 'consumableSlot' + 0 ? 'consumableSlotMenu' + 0 : undefined}
																		aria-haspopup="true"
																		aria-expanded={consumableOpen == 'consumableSlot' + 0 ? 'true' : undefined}
																	>
																		{consumableSlots[0] != undefined && <img className='consumable-image' src={consumableSlots[0].image || TestDropImg}></img>}
																	</div>
																	<Menu
																		id={'consumableSlotMenu' + 0}
																		anchorEl={consumableAnchorEl}
																		open={consumableOpen == 'consumableSlot' + 0}
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
																		{toolList?.filter((record) => record.type == 'gear' && record.name == selectedInventoryData?.craft?.gear?.name).map((tool, tIndex) => (
																			(consumableSlots[0] == undefined || consumableSlots[0].id != tool.id) && tool.name == selectedInventoryData?.craft?.gear.name && tool.level == selectedInventoryData?.craft?.gear.level &&
																			<MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, 0, 'gear')}>
																				<img className='consumableImage' src={tool.image || TestDropImg}></img>
																				<div className='consumableDesc'>
																					{/* <BonusBar info={tool.bonuses} /> */}
																					<span className='slotDurability'>{tool.name}</span>
																					<span className={'slotName' + tool.rarity}>Lv : {selectedInventoryData?.craft?.gear.level}</span>
																				</div>
																			</MenuItem>
																		))}
																	</Menu>
																</>
															}
															<div className='inventory-cost-info' title={(!selectedInventoryData?.craft?.gear?.brun ? consumableSlots[0]?.name : selectedInventoryData?.craft?.gear?.name) || 'no selected'}>
																<div className='inventory-cost-name'>
																	{(!selectedInventoryData?.craft?.gear?.brun ? consumableSlots[0]?.name : selectedInventoryData?.craft?.gear?.name) || 'no selected'}
																</div>
																<div className='inventory-cost-quantity'>
																	Lv : {selectedInventoryData?.craft?.gear?.level}
																</div>
															</div>
														</div>
														:
														<></>
													}
													{(selectedInventoryData?.craft?.item?.burn !== undefined) ?
														<div className={'inventory-cost' + (selectedInventoryData?.craft?.item?.isAllowed ? '' : ' notAllowed')} title={selectedInventoryData?.craft?.item?.name}>
															<div className='inventory-cost-img'>
																<img src={selectedInventoryData?.craft?.item?.image} alt={'cost'} />
															</div>
															<div className='inventory-cost-info'>
																<div className='inventory-cost-name'>
																	{selectedInventoryData?.craft?.item?.name}
																</div>
																<div className='inventory-cost-quantity'>
																	x {selectedInventoryData?.craft?.item?.quantityToUpgrade
																	}
																</div>
															</div>
														</div>
														:
														<></>
													}
													{(selectedInventoryData?.craft?.points?.burn !== undefined) ?
														<div className={'inventory-cost' + (selectedInventoryData?.craft?.points?.isAllowed ? '' : ' notAllowed')} title={'Points'}>
															<div className='inventory-cost-img'>
																<img src={PVPPoints} alt={'cost'} />
															</div>
															<div className='inventory-cost-info'>
																<div className='inventory-cost-name'>
																	{'Points'}
																</div>
																<div className='inventory-cost-quantity'>
																	x {selectedInventoryData?.craft?.points?.pointRequired
																	}
																</div>
															</div>
														</div>
														:
														<></>
													}
												</>
												:
												currentTabName !== 'Buy' ?
													<>
														{(selectedInventoryData?.craft?.cardRequirements?.burn !== undefined) ?
															<div className={'inventory-cost' + (!selectedInventoryData?.craft?.cardRequirements?.isAllowed ? '' : ' notAllowed')}>
																{selectedInventoryData?.craft?.cardRequirements?.burn != 1 && <div className='inventory-cost-img'>
																	<img src={selectedInventoryData?.craft?.cardRequirements?.image || TestDropImg} alt={'cost'} />
																</div>}
																{selectedInventoryData?.craft?.cardRequirements?.burn == 1 &&
																	<>
																		<div
																			className={'consumableBtn'}
																			onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + 2) }}
																			id={'consumableSlot' + 2}
																			aria-controls={consumableOpen == 'consumableSlot' + 2 ? 'consumableSlotMenu' + 2 : undefined}
																			aria-haspopup="true"
																			aria-expanded={consumableOpen == 'consumableSlot' + 2 ? 'true' : undefined}
																		>
																			{consumableSlots[2] != undefined && <img className='consumable-image' src={consumableSlots[2].image || TestDropImg}></img>}
																		</div>
																		<Menu
																			id={'consumableSlotMenu' + 0}
																			anchorEl={consumableAnchorEl}
																			open={consumableOpen == 'consumableSlot' + 2}
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
																			{cards?.filter((card) => card.level == selectedInventoryData?.craft?.cardRequirements?.level && card.card_id == selectedInventoryData?.craft?.cardRequirements?.idCard).map((tool, tIndex) => (
																				(consumableSlots[2] == undefined || consumableSlots[2].id != tool.id) && tool.level == selectedInventoryData?.craft?.cardRequirements.level &&
																				<MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, 2, 'card')}>
																					<img className='consumableImage' src={tool.image || TestDropImg}></img>
																					<div className='consumableDesc'>
																						{/* <BonusBar info={tool.bonuses} /> */}
																						<span className='slotDurability'>{tool.name}</span>
																						<span className={'slotName1'}>Lv : {selectedInventoryData?.craft?.cardRequirements.level}</span>
																					</div>
																				</MenuItem>
																			))}
																		</Menu>
																	</>
																}
																<div className='inventory-cost-info' title={(!selectedInventoryData?.craft?.cardRequirements?.brun ? consumableSlots[2]?.name : selectedInventoryData?.craft?.gear?.name) || 'no selected'}>
																	<div className='inventory-cost-name'>
																		{(!selectedInventoryData?.craft?.cardRequirements?.brun ? consumableSlots[2]?.name : selectedInventoryData?.craft?.gear?.name) || 'no selected'}
																	</div>
																	<div className='inventory-cost-quantity'>
																		Lv : {selectedInventoryData?.craft?.cardRequirements?.level}
																	</div>
																</div>
															</div>
															:
															<></>
														}
														{(selectedInventoryData?.craft?.gearRequirements?.burn !== undefined) ?
															<div className={'inventory-cost' + (!selectedInventoryData?.craft?.gearRequirements?.isAllowed ? '' : ' notAllowed')}>
																{selectedInventoryData?.craft?.gearRequirements?.burn != 1 && <div className='inventory-cost-img'>
																	<img src={selectedInventoryData?.craft?.gearRequirements?.image || TestDropImg} alt={'cost'} />
																</div>}
																{selectedInventoryData?.craft?.gearRequirements?.burn == 1 &&
																	<>
																		<div
																			className={'consumableBtn'}
																			onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + 0) }}
																			id={'consumableSlot' + 0}
																			aria-controls={consumableOpen == 'consumableSlot' + 0 ? 'consumableSlotMenu' + 0 : undefined}
																			aria-haspopup="true"
																			aria-expanded={consumableOpen == 'consumableSlot' + 0 ? 'true' : undefined}
																		>
																			{consumableSlots[0] != undefined && <img className='consumable-image' src={consumableSlots[0].image || TestDropImg}></img>}
																		</div>
																		<Menu
																			id={'consumableSlotMenu' + 0}
																			anchorEl={consumableAnchorEl}
																			open={consumableOpen == 'consumableSlot' + 0}
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
																			{toolList?.filter((record) => record.type == 'gear' && record.name == selectedInventoryData?.craft?.gearRequirements?.name).map((tool, tIndex) => (
																				(consumableSlots[0] == undefined || consumableSlots[0].id != tool.id) && tool.name == selectedInventoryData?.craft?.gearRequirements.name && tool.level == selectedInventoryData?.craft?.gearRequirements.level &&
																				<MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, 0, 'gear')}>
																					<img className='consumableImage' src={tool.image || TestDropImg}></img>
																					<div className='consumableDesc'>
																						{/* <BonusBar info={tool.bonuses} /> */}
																						<span className='slotDurability'>{tool.name}</span>
																						<span className={'slotName' + tool.rarity}>Lv : {selectedInventoryData?.craft?.gearRequirements.level}</span>
																					</div>
																				</MenuItem>
																			))}
																		</Menu>
																	</>
																}
																<div className='inventory-cost-info' title={(!selectedInventoryData?.craft?.gearRequirements?.brun ? consumableSlots[0]?.name : selectedInventoryData?.craft?.gearRequirements?.name) || 'no selected'}>
																	<div className='inventory-cost-name'>
																		{(!selectedInventoryData?.craft?.gearRequirements?.brun ? consumableSlots[0]?.name : selectedInventoryData?.craft?.gearRequirements?.name) || 'no selected'}
																	</div>
																	<div className='inventory-cost-quantity'>
																		Lv : {selectedInventoryData?.craft?.gearRequirements?.level}
																	</div>
																</div>
															</div>
															:
															<></>
														}
														{(selectedInventoryData?.craft?.itemRequirements?.burn !== undefined) ?
															<div className={'inventory-cost' + (selectedInventoryData?.craft?.itemRequirements?.isAllowed ? '' : ' notAllowed')} title={selectedInventoryData?.craft?.itemRequirements?.name}>
																<div className='inventory-cost-img'>
																	<img src={selectedInventoryData?.craft?.itemRequirements?.image} alt={'cost'} />
																</div>
																<div className='inventory-cost-info'>
																	<div className='inventory-cost-name'>
																		{selectedInventoryData?.craft?.itemRequirements?.name}
																	</div>
																	<div className='inventory-cost-quantity'>
																		x {selectedInventoryData?.craft?.itemRequirements?.quantityToUpgrade
																		}
																	</div>
																</div>
															</div>
															:
															<></>
														}
														{(selectedInventoryData?.craft?.pointRequirements?.burn !== undefined) ?
															<div className={'inventory-cost' + (selectedInventoryData?.craft?.pointRequirements?.isAllowed ? '' : ' notAllowed')} title={'Points'}>
																<div className='inventory-cost-img'>
																	<img src={PVPPoints} alt={'cost'} />
																</div>
																<div className='inventory-cost-info'>
																	<div className='inventory-cost-name'>
																		{'Points'}
																	</div>
																	<div className='inventory-cost-quantity'>
																		x {selectedInventoryData?.craft?.pointRequirements?.pointRequired
																		}
																	</div>
																</div>
															</div>
															:
															<></>
														}
														{(selectedInventoryData?.craft?.recipeRequirements?.burn == undefined) ?
															<div className={'inventory-cost' + (selectedInventoryData?.craft?.recipeRequirements?.isAllowed ? '' : ' notAllowed')} title={selectedInventoryData?.craft?.recipeRequirements?.name}>
																<div className='inventory-cost-img'>
																	<img src={selectedInventoryData?.craft?.recipeRequirements?.image} alt={'cost'} />
																</div>
																<div className='inventory-cost-info'>
																	<div className='inventory-cost-name'>
																		{selectedInventoryData?.craft?.recipeRequirements?.name}
																	</div>
																	<div className='inventory-cost-quantity'>
																		x 1
																	</div>
																</div>
															</div>
															:
															<></>
														}
													</>
													:
													<></>
										}
									</div>
								</> : ''
							}
							{
								headerTab == 1 && currentTabName == 'Buy' ?
									<>
										<div className='inventory-cost-text'>
											Requirements
										</div>
										<div className='inventory-costs'>
											<div className={'inventory-cost' + (currentBalanceNative < selectedInventoryData.price * buyQuantity ? '' : ' notAllowed')} title={'MATICS'}>
												<div className='inventory-cost-img'>
													<img src={PVPPoints} alt={'cost'} />
												</div>
												<div className='inventory-cost-info'>
													<div className='inventory-cost-name'>
														{'Matics'}
													</div>
													<div className='inventory-cost-quantity'>
														x {selectedInventoryData?.price
														}
													</div>
												</div>
											</div>
										</div>
									</>
									:
									<></>
							}
							<div className='separator'>
							</div>
							<div className='inventory-buy-text'>
								Do you want to buy?
							</div>
							<div className='inventory-buy-description'>
								You can buy this {headerTab == 0 ? 'recipe' : 'gem'} <a>{selectedInventoryData?.craft?.maxPossibleCraftCount || 100}</a> times at a once.
							</div>
							<div className='inventory-buy-action'>
								<RInput
									className='buyQuantityInput'
									type={'number'}
									placeholder={'Ex: 1'}
									value={buyQuantity}
									onChange={onBuyQuantityChange} />
								<RButton
									className={`buyChestBtn ${buyQuantity <= 0 ? 'notAllowed' : ''}`}
									disabled={buyQuantity <= 0}
									onClick={onBuyRecipe}>
									Buy
								</RButton>
							</div>
						</div>
					</div>
				</>
			}
		</div>
		<RModal
			className={'inventoryConfirmModal'}
			style={''}
			open={confirmModalOpen}
			title={actionType}
			content={<>
				{
					onDoing ?
						<div className='api-loading'>
							<span className='apiCallLoading'></span>
							<span className={'loader ' + confirmActionType + '-loader'}></span>
						</div> : ''
				}
				<div className='upgrade-confirm-text'>
					{
						actionType == 'Buy Gem' ?
							<>
								Do you want to purchase <a>{selectedInventoryData.name} x{buyQuantity}</a> with <a>{format(toFixed(selectedInventoryData.price * buyQuantity, 4))} MATIC</a>?<br />
								Totally, you will get <a>x{selectedInventoryData.quantity * buyQuantity}</a> "{selectedInventoryData.itemName}"
							</>
							:
							<>
								Are you sure you want to buy {buyQuantity} <a>recipes</a>?
								{selectedInventoryData?.craft?.probability ?
									<>
										<br></br>
										Probability of Success: <a>{selectedInventoryData?.craft?.probability}%</a>
									</>
									:
									<></>
								}
							</>
					}
				</div>

			</>}
			actions={<>
				<RButton onClick={onSureAction}>Sure</RButton>
			</>}
			onClose={onCancelAction}
		/>
	</>)
}

export default RShopePanel