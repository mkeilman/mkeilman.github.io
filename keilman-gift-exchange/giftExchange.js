'use strict';

const SUGGESTION_ROW_ID_PREFIX = 'suggestion-';
let myGiftData;
let gifter;
let giftee;
let year;

const addSuggestion = async () => {
    if (! gifter.suggestions) {
        gifter.suggestions = [];
    }
    gifter.suggestions.push(document.getElementById('newSuggestionText').value.trim());
    await saveMyGiftData();
};

const buildSuggestionRow = (participant, index) => {

    const suggestion = participant.suggestions[index];
        
    if (! suggestion || ! suggestion.length) {
        return;
    }

    const row = document.createElement('tr');
    row.setAttribute('id', `${SUGGESTION_ROW_ID_PREFIX}${index}`);

    let el = document.createElement('td');
    el.appendChild(document.createTextNode(suggestion));
    const bg = index % 2 ? '#ffffff' : '#cccccc';
    el.setAttribute('style', `background-color: ${bg};`);
    row.appendChild(el);

    if (participant !== gifter) {
        return row;
    }
    
    // row deletion button
    el = document.createElement('td');
    el.setAttribute('class', 'suggestion-cell');
    const b = document.createElement('button');
    b.setAttribute('type', 'button');
    b.setAttribute('value', 'Delete');
    b.setAttribute('title', 'Delete this suggestion');
    b.setAttribute('class', 'delete-suggestion');
    b.appendChild(document.createTextNode('\u20E0'));
    
    // note this cannot be done by setting the onclick attribute - 
    // "participant" is not defined in the global scope
    b.addEventListener(
        'click',
        () => { deleteSuggestion(participant, index); }
    );
    el.appendChild(b);
    row.appendChild(el);

    return row;
};

// if gifter, include add row and delete buttons
// if giftee, onliy list the suggestions
const buildSuggestionTable = (participant) => {

    if (! participant) {
        return;
    }
    
    const prefix = isGifter(participant) ? 'gifter' : 'giftee';
    
    const t = document.getElementById(prefix + 'SuggestionsTable').tBodies[0];
    
    if (isGifter(participant)) {
        document.getElementById('newSuggestionText').value = '';
        validateSuggestion();
        setNotifyEnabled(participant.suggestions.length > 0);
    }
    
    // easiest to clear out all data and regenerate them.
    // start at the end so the row is always the "last"
    for (let i = t.children.length - 1; i >= 0; --i) {
        const r = t.children[t.children.length - 1];
        // don't delete the "add" row if it exists
        if (r.id.startsWith(SUGGESTION_ROW_ID_PREFIX)) {
            t.deleteRow(-1);
        }
    }

    if (isGiftee(participant)) {
        const hasSuggestions = "suggestions" in giftee && giftee.suggestions.length > 0;
        document.getElementById('gifteeSuggestionsTableCaption').innerHTML =
            giftee.name + (
                hasSuggestions ?
                "'s Suggestions" :
                ' has no suggestions yet. '
            ) + (
                gifter.email ?
                'Expect an email from support@slickanix.com or check' :
                'Check'
            ) + ' back later!';
    }

    if (! participant.suggestions) {
        return;
    }
    for (let i = 0; i < participant.suggestions.length; ++i) {
        t.appendChild(buildSuggestionRow(participant, i));
    }
};

const countdown = () => {

    const pad = (n) => String(n).padStart(2, '0');

    const MILLIS_PER_SEC = 1000;
    const MILLIS_PER_MIN = 60 * MILLIS_PER_SEC;
    const MILLIS_PER_HOUR = 60 * MILLIS_PER_MIN;
    const MILLIS_PER_DAY = 24 * MILLIS_PER_HOUR;

    const MILLIS_PER_MONTH = 30 * MILLIS_PER_DAY;

    const now = new Date();
    const xmas = new Date(`${now.getFullYear()}-12-25`);
    const dayAfter = new Date(xmas);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    // xmas day
    if (now >= xmas && now < dayAfter) {
        return 'Today\'s the Day!';
    }
    
    const xmasDiff = xmas.getTime() - now.getTime();

    // after xmas, it's in the past until the new year
    if (xmasDiff < 0) {
         return 'See you Next Year!';
    }

    // until two months out, too early
    if (xmasDiff > 2 * MILLIS_PER_MONTH) {
         return 'Jumping the Gun!';
    }
    
    const days = pad(Math.floor(xmasDiff / MILLIS_PER_DAY));
    const hours = pad(Math.floor((xmasDiff % MILLIS_PER_DAY) / MILLIS_PER_HOUR));
    const minutes = pad(Math.floor((xmasDiff % MILLIS_PER_HOUR) / MILLIS_PER_MIN));
    const seconds = pad(Math.floor((xmasDiff % MILLIS_PER_MIN) / MILLIS_PER_SEC));

    return `${days}d ${hours}h ${minutes}:${seconds}`;
};

const deleteSuggestion = async (participant, index) => {
    participant.suggestions.splice(index, 1);
    await saveMyGiftData();
};

const displayCountdown = () => {
    const el = document.getElementById('countdown');
    el.innerHTML = `~ ${countdown()} ~`;
    const _ = setInterval(() => {
        el.innerHTML = `~ ${countdown()} ~`;
    }, 1000);
};

const getGiftersGifter = (participantCode) => {
    const participants = myGiftData.participants;
    for (let n in participants) {
        const p = participants[n];
        if (p.gifteeCode == participantCode) {
            return p;
        }
    }
    return null;
};

const getParticipant = (participantCode) => {
    const participants = myGiftData.participants;
    for (let n in participants) {
        const p = participants[n];
        if (p.code == participantCode) {
            return p;
        }
    }
    return null;
};

const giftersGifterHasEmail = () => {
    return ! ! (getGiftersGifter(gifter.code) || {}).email;
}

const isGiftee = (participant) => participant == giftee;
const isGifter = (participant) => participant == gifter;

const isSuggestionValid = () => document.getElementById('newSuggestionText').value.trim().length > 0;

const loadMyGiftData = async () => {
    displayCountdown();
    year = new URLSearchParams(window.location.search).get("year");
    
    myGiftData = await loadData(`https://slickanix.com/giftExchange/data/${year}.json`);
    setExchange();
};

const notifyGifter = async () => {
    const now = new Date();
    
    document.getElementById('notificationDatestamp').innerHTML = '';
    document.getElementById('notificationSuccess').innerHTML = '';
    document.getElementById('notificationFailure').innerHTML = '';
    
    const g = getGiftersGifter(gifter.code);
    const d = await loadData(`https://slickanix.com/giftExchange/admin/giftExchangeAdmin.php?year=${year}&code=${gifter.code}&mode=notify`);
    
    document.getElementById('notificationDatestamp').innerHTML = now.toLocaleDateString('en-CA') + ' ' + now.toLocaleTimeString();
    if (d.status == 'ok') {
        document.getElementById('notificationSuccess').innerHTML = d.message;
    }
    if (d.status == 'error') {
        document.getElementById('notificationFailure').innerHTML = d.message;
    }
}

const saveMyGiftData = async () => {
    const _ = await saveData(
        `https://slickanix.com/giftExchange/admin/giftExchangeAdmin.php?year=${year}&mode=update`,
        myGiftData
    );
    buildSuggestionTable(gifter);
};

const setExchange = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.size == 0 || ! params.has("code")) {
        return;
    }
    gifter = getParticipant(params.get("code"));
    if (! gifter) {
        return;
    }
    document.getElementById('gifterLabel').innerHTML = gifter.name;

    giftee = getParticipant(gifter.gifteeCode);
    if (! giftee) {
        return;
    }
    
    document.getElementById('gifteeLabel').innerHTML = giftee.name;
    
    setNotifyVisibility();

    buildSuggestionTable(gifter);
    buildSuggestionTable(giftee);
};

const setNotifyEnabled = (doEnable) => {
    document.getElementById('notifyGifterButton').disabled = ! doEnable;
};

const setNotifyVisibility = () => {
    const h = ! giftersGifterHasEmail();
    document.getElementById('notifyGifter').hidden = h;
    document.getElementById('noGifterEmail').hidden = ! h;
};

const validateSuggestion = () => {
    document.getElementById('addSuggestionButton').disabled = ! isSuggestionValid();
};
