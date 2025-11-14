import { useState } from 'react'
import './css/GiftExchange.css'


const GiftExchange = () => {

    const getGiftee = (e) => {
        //fetch()
        console.log(this.userCode.value);
    };

    return (
        <div>
            Code<input name="userCode" type="text"></input>
            <button onclick="getGiftee">Enter</button>
        </div>
    )
};

export default GiftExchange;
