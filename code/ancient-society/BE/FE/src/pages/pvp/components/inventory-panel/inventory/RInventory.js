import './rinventory.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import TestUnitImg from '../../../assets/inventory-panel/chest.png';

const imagePath = '../../../assets/inventory-panel/'
const images = require.context('../../../assets/inventory-panel', true);
function RInventory(props) {
    // basic attr className|style
    const className = useMemo(() => props.className, [props.className])
    const style = useMemo(() => props.style, [props.style])

    // true if it's shop inventory
    const isShopInventory = useMemo(() => props.isShopInventory, [props.isShopInventory])

    // inventory data
    const [data, setData] = useState(props.data)
    useEffect(() => {
        setData(props.data)
    }, [props.data])

    return (<>
        <div className={`rinventory ${className || ""}`} style={style || {}} onClick={() => props.onShowDetail(data)}>
            <div className={`unit-back-img rarity-${data?.rarity || 1}`}></div>

            <div className='unit-img'>
                <img src={data?.image || TestUnitImg} alt={'unit'} />
            </div>

            <div className='unit-name'>
                {data?.name || 'Test Unit Name'}
            </div>

            {
                !isShopInventory && data?.quantity && 
                <div className='unit-quantity'>
                    {data?.quantity || 0}
                </div>
            }

            {
                !isShopInventory && data?.type == 'recipe' &&
                <div className='unit-category'>
                    {data?.category || 'category'}
                </div>
            }
            {
                isShopInventory &&
                <div className='unit-shop-category'>
                    {data?.idCard ? 'Card' : data?.idGear ? 'Gear' : data?.idItem ? 'item' : 'Category'}
                </div>
            }
        </div>
    </>)
}

export default RInventory