import { useState } from 'react'
import './css/GiftExchange.css'


const GiftExchange = () => {

    const handleClick = (userCode) => {
        //fetch()
        //console.log(this.userCode.value);
        console.log(userCode);
    };

    return (
        <div>
            Code<input name="userCode" type="text"></input>
            <button onClick={(e) => handleClick('PEEP')}>Enter</button>
        </div>
    )
};

export default GiftExchange;
