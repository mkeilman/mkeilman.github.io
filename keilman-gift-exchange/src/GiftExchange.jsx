import { useState } from 'react'
import './css/GiftExchange.css'


const GiftExchange = () => {

    const getGiftee = (userCode) => {
        //fetch()
        //console.log(this.userCode.value);
        console.log(userCode);
    };

    return (
        <div>
            Code<input name="userCode" type="text"></input>
            <button onclick={() => getGiftee('POOP')}>Enter</button>
        </div>
    )
};

export default GiftExchange;
