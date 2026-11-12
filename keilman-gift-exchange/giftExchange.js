'use strict';

const SUGGESTION_ROW_ID_PREFIX = 'suggestion-';
let gifter;
let giftee;
let year;

const addSuggestion = async () => {
    if (! gifter.suggestions) {
        gifter.suggestions = [];
    }
    gifter.suggestions.push(document.getElementById('newSuggestionText').value.trim());
    await save();
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
    row.appendChild(el);

    if (participant !== gifter) {
        return row;
    }
    
    // row deletion button
    el = document.createElement('td');
    const b = document.createElement('button');
    b.setAttribute('type', 'button');
    b.setAttribute('value', 'Delete');
    b.setAttribute('title', 'Delete this suggestion');
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
    
    if (isGifter(participant)) {
        document.getElementById('newSuggestionText').value = '';
    }

    const t = document.getElementById(prefix + 'SuggestionsTable');
    
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
                ' has no suggestions yet'
            );
    }

    if (! participant.suggestions) {
        return;
    }
    for (let i = 0; i < participant.suggestions.length; ++i) {
        t.appendChild(buildSuggestionRow(participant, i));
    }
};

const deleteSuggestion = async (participant, index) => {
    participant.suggestions.splice(index, 1);
    await save();
};

const getActiveYear = async() => {
    const cfg = await loadData('https://slickanix.com/giftExchange/admin/config.json');
    return (cfg || {}).activeYear;
};

/*
const getData = async(url) => {
    let data;
    try {
        // tack on the timestamp for cache-busting
        const res = await fetch (
            url + `?t=${new Date().getTime()}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        data = await res.json();
    }
    catch (error) {
        console.log(error);
    }
    finally {
        return data;
    }
};
*/

const getParticipant = (data, participantCode) => {
    const participants = data.participants;
    for (let n in participants) {
        const p = participants[n];
        if (p.code == participantCode) {
            return p;
        }
    }
    return null;
};

const isGiftee = (participant) => participant == giftee;
const isGifter = (participant) => participant == gifter;

const loadMyGiftData = async (_year) => {
    const d = await loadData(`https://slickanix.com/giftExchange/data/${_year}.json`);
    setExchange(d);
};

const save = async () => {
    const _ = await saveData(
        `https://slickanix.com/giftExchange/admin/giftExchangeAdmin.php?year=${year}&mode=update`,
        giftData
    );
    buildSuggestionTable(gifter);
};

/*
const saveData = async (url, data) => {
    const json = JSON.stringify(data, null, 4);
    let savedData;

    try {
        const res = await fetch (
            url,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: json,
            }
        );
        // clone the response to ensure the promise is not locked
        savedData = await res.clone().json();
    }
    catch (error) {
        console.log(error);
    }
    finally {
        return savedData;
    }
};
*/

// executed on page load
const setExchange = (data) => {

    const params = new URLSearchParams(window.location.search);
    if (params.size == 0 || ! params.has("code")) {
        return;
    }
    gifter = getParticipant(data, params.get("code"));
    if (! gifter) {
        return;
    }
    document.getElementById('gifterLabel').innerHTML = gifter.name;

    giftee = getParticipant(data, gifter.gifteeCode);
    if (! giftee) {
        return;
    }

    document.getElementById('gifteeLabel').innerHTML = giftee.name;

    buildSuggestionTable(gifter);
    buildSuggestionTable(giftee);
};
