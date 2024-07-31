import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import {PlayingCard} from './js/Card.js'
import {Utils} from './js/Utils.js';

const Card = ({card}) => {

    //const c = new PlayingCard(suit, rank);
    return (
        <>
            <span>{card.toString()}</span>
        </>
    );
};

export default Card;
