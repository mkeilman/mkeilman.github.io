import { useState } from 'react'
import './css/GiftExchange.css'


const GiftExchange = () => {

    const getGiftee = (code) => {
        //fetch()
        console.log(code)
    };

    return (
        <div>
            Code<input type="text"></input>
            <button onclick="getGiftee()">Enter</button>
        </div>
    )
};

export default GiftExchange;
