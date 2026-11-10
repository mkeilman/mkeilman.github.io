'use strict';

const SUGGESTION_ROW_ID_PREFIX = 'suggestion-';
let gifter;
let giftee;

const loadGiftData = async (year, callback) => {
    try {
        const res = await fetch (
            `https://slickanix.com/giftExchange/data/${year}.json`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        // declared in index.html <script> tag
        exchangeData = await res.json();

        if (callback) {
            callback(exchangeData);
        }
    }
    catch (error) {
        console.log(error);
    }
}

const addSuggestion = () => {
    if (! gifter.suggestions) {
        gifter.suggestions = [];
    }
    gifter.suggestions.push(document.getElementById('newSuggestionText').value.trim());
    buildSuggestionTable(gifter);
};

const buildSuggestionRow = (participant, index) => {

    const suggestion = participant.suggestions[index];
        
    if (! suggestion || ! suggestion.length) {
        return;
    }

    const row = document.createElement('tr');
    row.setAttribute('id', `${SUGGESTION_ROW_ID_PREFIX}-${index}`);
                
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

    // non-anonymous so re-adding does not duplicate listeners
    function addSuggestionListener() {
        addSuggestion(participant);
    }
    
    if (isGifter(participant)) {
        //document.getElementById('addSuggestionButton')
        //    .addEventListener('click', addSuggestionListener);
        document.getElementById('newSuggestionText').value = '';
    }

    const t = document.getElementById(prefix + 'SuggestionsTable');
    
    // easiest to clear out all data and regenerate them
    // start at the end so the row is always the "last"
    for (let i = t.children.length - 1; i >= 0; --i) {
        const r = t.children[t.children.length - 1];
        // don't delete the "add" row if it exists
        if (r.id.startsWith(SUGGESTION_ROW_ID_PREFIX)) {
            t.deleteRow(-1);
        }
    }

    if (! isGifter(participant)) {
        const hasSuggestions = "suggestions" in participant && participant.suggestions.length;
        document.getElementById('gifteeSuggestionsTableCaption').innerHTML =
            giftee.name +
                hasSuggestions ?
                ' has no suggestions yet' :
                "'s Suggestions";
    }

    for (let i = 0; i < participant.suggestions.length; ++i) {
        t.appendChild(buildSuggestionRow(participant, i));
    }
};

const deleteSuggestion = (participant, index) => {
    participant.suggestions.splice(index, 1);
    buildSuggestionTable(participant);
};

const isGiftee = (participant) => participant == giftee;
const isGifter = (participant) => participant == gifter;

// executed on page load
const setExchange = (exchangeData) => {
    const params = new URLSearchParams(window.location.search);
    if (params.size == 0 || ! params.has("code")) {
        return;
    }
    //const p = getParticipant(params.get("code"));
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

    buildSuggestionTable(gifter);
    buildSuggestionTable(giftee);
};

const getParticipant = (participantCode) => {
    const participants = exchangeData.participants;
    for (let n in participants) {
        const p = participants[n];
        if (p.code == participantCode) {
            return p;
        }
    }
    return null;
}

const handleClick = (participantCode) => {
    gifteeLabel = document.getElementById('gifteeLabel');
    gifteeLabel.innerHTML = '';
    if (! exchangeData) {
        gifteeLabel.innerHTML = 'ERROR';
        return;
    }
    const gifter = getParticipant(participantCode);
    if (! gifter) {
        gifteeLabel.innerHTML = 'NO SUCH GIFTER!';
        return;
    }
    const giftee = getParticipant(gifter.gifteeCode);
    console.log(giftee);
    gifteeLabel.innerHTML = giftee.name;


};
