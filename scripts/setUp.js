const errorLength = document.getElementById("error-length");
const errorContent = document.getElementById("error-content");
const uiKeys = document.getElementsByClassName("key");
const aIndex = getAnswerIndex();

var letters = 5;
var tries = 6;

var keyboardUsed = new Object();
var guess = new String();
var keyboard = new Object();

const initDate = new Date("03/20/2022");
const initDateLondon = new Date((typeof initDate === "string" ? new Date(initDate) : (initDate)).toLocaleString("en-US", {timeZone: "Europe/London"}));
const currentDate = new Date();
const currentDateLondon = new Date((typeof currentDate === "string" ? new Date(currentDate) : (currentDate)).toLocaleString("en-US", {timeZone: "Europe/London"}));
const noDays = String(Math.floor((currentDateLondon.getTime() - initDateLondon.getTime()) / (1000 * 3600 * 24)) + 1);

var endingStr = "Wiccle Phase Springs Eternal " + noDays + " %n/6\n";
var green = "correct";
var yellow = "wrongplace";
var black = "wrong";

var priority = new Object();
priority[green] = 2;
priority[yellow] = 1;
priority[black] = 0;

var blockGame = false;
var stats = [0,0,0,0,0,0], gameState = 0, shown = false, cookieDate = getFinalDate();
//var cookieLetters, cookieColours = new Array();
var guessesStr = new String(), prioritiesStr = new Array();
var theme = 1;

var cookies = new Object();

window.onload = async () => {
    cookies = await getCookies();

    if (cookies.STATE) {
        cookies.STATE.name = "STATE=";
        const state = cookies.STATE;
        if (state.THEME) {theme = state.THEME; updateTheme(theme,true);}
        if (state[1]) stats = [state[1],state[2],state[3],state[4],state[5],state[6]];
    }
    else {
        let state = new Object();
        state.name = "STATE=";
        state.THEME = theme;
        state[1] = 0;
        state[2] = 0;
        state[3] = 0;
        state[4] = 0;
        state[5] = 0;
        state[6] = 0;
        cookies.STATE = state;
    }
    if (cookies.SECONDARY) {
        cookies.SECONDARY.name = "SECONDARY=";
        const secondary = cookies.SECONDARY;
        if (secondary.DATE) cookieDate = secondary.DATE;
        if (Number(cookieDate) == getFinalDate()) {
            if (secondary.LETTERS) guessesStr = secondary.LETTERS;
            if (secondary.COLOURS) for (let i = 0; i < secondary.COLOURS.length; i++)
                prioritiesStr[i] = getKey(priority,Number(secondary.COLOURS[i]));
            if (secondary.GAME) gameState = Number(secondary.GAME);
            for (i=0;i < guessesStr.length; i+=5) {
                updateEndingStr(prioritiesStr.slice(i,i+5));
                await initUpdateColours(guessesStr.substring(i,i+5), prioritiesStr.slice(i,i+5));
            }
        }
        else {
            let secondary = new Object();
            secondary.name = "SECONDARY=";
            secondary.DATE = cookieDate = getFinalDate();
            secondary.LETTERS = guessesStr;
            secondary.COLOURS = prioritiesStr;
            secondary.GAME = gameState = 0;
            cookies.SECONDARY = secondary;
            setCookies(cookies.SECONDARY);
        }
    }

    function getKey(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
      
    if (gameState && !shown) {
        if (gameState == 0) openStats();
        else victory(guessesStr.substring(guessesStr.length-5,guessesStr.length));
        shown = true;
        await showAlert(document.getElementById("answer"));
        return;
    }
}

function updateTheme(newTheme, init=null) {
    if (!init) {
        theme = cookies.STATE.THEME = newTheme;
        setCookies(cookies.STATE);
    }

    const root = document.querySelector(':root');
    const favicon = document.getElementById("favicon");
    if (newTheme == 1) {
        //root.style.setProperty('--green', '#3a753f');
        //root.style.setProperty('--yellow', '#75653a');
        //root.style.setProperty('--black', '#343434');
        root.style.setProperty('--background', '#181818');
        root.style.setProperty('--text', 'black');
        root.style.setProperty('--body', 'url(imgs/1.jpg)');
        root.style.setProperty('--button', '#212529');
        favicon.setAttribute("href","imgs/favicon.jpg");
    }
    else {
        root.style.setProperty('--green', '#43945d');
        root.style.setProperty('--yellow', '#69308a');
        root.style.setProperty('--black', '#4a4a4a');
        root.style.setProperty('--background', '#003859');
        root.style.setProperty('--text', 'white');
        root.style.setProperty('--body', 'url(imgs/2.jpg)');
        root.style.setProperty('--button', '#21252900');
        favicon.setAttribute("href","imgs/favicon_light.jpg");
    }
}

async function initUpdateColours(letters, colours) {
    for (let i = 0; i < 5; i++) {
        square = document.getElementById('guesses').getElementsByClassName("row")[6-tries].getElementsByClassName("col")[i];
        square.classList.add("border-invisible");
        square.classList.remove("border-secondary");
        if (!(letters[i] in keyboardUsed))
            keyboardUsed[letters[i]] = colours[i];
        else if (priority[colours[i]] > priority[keyboardUsed[letters[i]]])
            keyboardUsed[letters[i]] = colours[i];

        square.innerHTML = letters[i];
        await initFlashBackground([square], [colours[i]]);
    }
    await sleep(500);
    let keyboardElements = new Array();
    let keyboardColours = new Array();
    for ([letter, colour] of Object.entries(keyboardUsed)) {
        keyboardElements.push(document.getElementById(letter));
        keyboardColours.push(colour);
    }
    await initFlashBackground(keyboardElements, keyboardColours);
    tries--;
    letters = 5;
}

async function initFlashBackground(squares, backgroundClasses) {
    for (square of squares) square.classList.add("white-background");
    await sleep(100);
    if (backgroundClasses) {
        for (let i = 0; i < squares.length; i++) {
            squares[i].classList.add(backgroundClasses[i]);
            squares[i].classList.remove("bg-secondary");
        }
        await sleep(50);
    }
    for (square of squares) square.classList.remove("white-background");
}