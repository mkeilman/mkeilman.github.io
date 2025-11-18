import { useState } from 'react'
import './css/GiftExchange.css'

let exchangeData;

window.onload = async () => {
    try {
        const res = await fetch(
            'https://mkeilman.github.io/keilman-gift-exchange/data/2025.json',
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                }
            }
        );
        exchangeData = await res.json();
    }
    catch (error) {
        console.log(error);
    }

}

const GiftExchange = () => {

    const handleClick = (userCode) => {
        console.log(userCode);
        //console.log(exchangeData);
        gifteeLabel = document.getElementById("gifteeLabel");
        if (! exchangeData) {
            gifteeLabel.innerHTML = "ERROR";
            return;
        }
        const giftee = exchangeData.participants[userCode].giftee;
        gifteeLabel.innerHTML = giftee;
    };


    return (
        <div>
            <label>Code</label><input id="userCode" type="text"></input>
            <button onClick={(e) => handleClick(document.getElementById("userCode").value)}>Enter</button>
            <div id="gifteeLabel"></div>
        </div>
    )
};

export default GiftExchange;
