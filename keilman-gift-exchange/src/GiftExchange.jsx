import { useState } from 'react'
import './css/GiftExchange.css'


const GiftExchange = () => {

    const handleClick = (userCode) => {
        console.log(userCode);
        const j =  getData();
        console.log(j);
    };

    async function getData() {
        const res = await fetch('https://mkeilman.github.io/keilman-gift-exchange/data/2025.json');
        const jres = await res.json();
        return jres;
    }

    return (
        <div>
            Code<input name="userCode" id="user_code" type="text"></input>
            <button onClick={(e) => handleClick(document.getElementById("user_code").value)}>Enter</button>
        </div>
    )
};

export default GiftExchange;
