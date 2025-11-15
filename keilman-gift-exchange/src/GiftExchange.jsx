import { useState } from 'react'
import './css/GiftExchange.css'


const GiftExchange = () => {

    const handleClick = (userCode) => {
        //fetch()
        //console.log(this.userCode.value);
        console.log('POOP');
    };

    return (
        <div>
            Code<input name="userCode" type="text"></input>
            <button onClick={handleClick}>Enter</button>
        </div>
    )
};

export default GiftExchange;
