import { useState } from 'react'
import './css/GiftExchange.css'

let exchangeData;

window.onload = async () => {
    const res = await fetch('https://mkeilman.github.io/keilman-gift-exchange/data/2025.json');
    exchangeData = await res.json();
}

const GiftExchange = () => {

    const handleClick = (userCode) => {
        console.log(userCode);
        console.log(exchangeData);
    };


    return (
        <div>
            Code<input name="userCode" id="user_code" type="text"></input>
            <button onClick={(e) => handleClick(document.getElementById("user_code").value)}>Enter</button>
        </div>
    )
};

export default GiftExchange;
