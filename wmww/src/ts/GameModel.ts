//
//  GameModel.ts
//  WatchWords
//
//  Models a particular game
//  Created by Michael Keilman on 2025-03-14.
//  Copyright (c) 2025 Michael Keilman. All rights reserved.
//

import { buildObj } from "./collectionUtils.js";
import { DifficultyLevels, ModifierType, TurnType, maskStringWithPlaceHolder, randomString, PASS_TOKEN, TIME_TO_PLAY, WATCH_WORD_PLACEHOLDER } from "./common.js";

import { LetterBank } from "./LetterBank.js";
import { LetterSet } from "./LetterSet.js";
import { TextManager } from "./TextManager.js";
import { WordPlay } from "./WordPlay.js";

enum GameTypes {
	normal,
	blitz
}

const DEFAULT_ROUNDS_PER_GAME = 1;
const DEFAULT_NUM_SPINS = 3;
const DEFAULT_STARTING_RUNES = 10;

const WATCHWORD_PLAYED_BONUS_FACTOR = 1;
const WATCHWORD_PLAYED_BONUS = 10;
const WATCHWORD_REVEALED_BONUS_FACTOR = 1;
const WATCHWORD_REVEALED_BONUS = 20;

const WOD_PLAYED_BONUS_FACTOR = 2;

const DEFAULT_NUM_POISONS = 0;
const DEFAULT_NUM_SHIELDS = 0;
const DEFAULT_NUM_LIGHTNING = 0;

const DEFAULT_NUM_MODS: object = buildObj(
    [ModifierType.shield, ModifierType.poison, ModifierType.lightning],
    [DEFAULT_NUM_SHIELDS, DEFAULT_NUM_POISONS, DEFAULT_NUM_LIGHTNING]
);

const MOD_POINT_COSTS: object = buildObj(
    [ModifierType.poison, ModifierType.shield, ModifierType.spin, ModifierType.lightning],
    [15, 15, 15, 50]
);

const KVO_KEY_PATH_POINTS_SCORED = "pointsScored";
const KVO_KEY_PATH_PLAY_FLAG = "playFlag";
const KVO_KEY_PATH_NUM_SPINS = "numSpins";
const KVO_KEY_PATH_SWAP_FLAG = "swapFlag";
const KVO_KEY_PATH_MOD_FLAG = "modFlag";
const KVO_KEY_PATH_NEW_ROUND_FLAG = "newRoundFlag";
const KVO_KEY_PATH_INVALID_WORD_FLAG = "invalidWordFlag";

enum BonusMultipliers {
	none = 1,
	bronze,
	silver,
	gold,
}

let WORD_LENGTH_RANGE: object = buildObj(
	[DifficultyLevels.easy, DifficultyLevels.normal, DifficultyLevels.hard, DifficultyLevels.expert],
    [[2,6], [3,9], [5,11], [2, Number.MAX_SAFE_INTEGER]]
);

let WATCH_WORD_LENGTH_RANGE: object = buildObj(
	[DifficultyLevels.easy, DifficultyLevels.normal, DifficultyLevels.hard, DifficultyLevels.expert],
    [[4,6], [5,8], [6,9], [7, 12]]
);

let WORDS_FOR_LETTERS_MAX: object = buildObj(
	[DifficultyLevels.easy, DifficultyLevels.normal, DifficultyLevels.hard, DifficultyLevels.expert],
    [20, 10, 5, 0]
);

let WOD_LENGTH_MIN = 4;
let WOD_LENGTH_MAX = 6;

let WORDS_FOR_LETTERS_MAX_LEN = 8;
let WORDS_FOR_LETTERS_MAX_COUNT = 20;

let NO_SUCH_PLAYER_ID = "NO_SUCH_PLAYER_ID";

class WordPlayTurn {
    play: WordPlay;
    position: number;
    timeStamp: number;
    
    static KEY_WORD_PLAY_TURN = "PT";
    static KEY_WORD_PLAY_TURN_PLAY = WordPlayTurn.KEY_WORD_PLAY_TURN + ".wp";
    static KEY_WORD_PLAY_TURN_POSITION = WordPlayTurn.KEY_WORD_PLAY_TURN + ".pos";
    static KEY_WORD_PLAY_TURN_FROM_WATCH = WordPlayTurn.KEY_WORD_PLAY_TURN + ".fw";
    static KEY_WORD_PLAY_TURN_TIMESTAMP = WordPlayTurn.KEY_WORD_PLAY_TURN + ".ts";
    static KEY_GAME_MODEL_LAST_TURN: String =  WordPlayTurn.KEY_WORD_PLAY_TURN + ".lt";     

    constructor(pl: WordPlay, fw: boolean, pos: number, ts: number=Date.now()) {
        this.play = pl;
        this.position = pos;
        this.timeStamp = ts;
    }
    
    tostring(): string {
        return `Player at ${this.position} played ${this.play} at ${this.timeStamp})`;
    }

    toJSON(includeWord: boolean=false, includeMods: boolean=false): object {
        return {
            KEY_WORD_PLAY_TURN : {
                KEY_WORD_PLAY_TURN_PLAY : this.play.toJSON(includeWord, includeMods),
                KEY_WORD_PLAY_TURN_POSITION : this.position,
                KEY_WORD_PLAY_TURN_TIMESTAMP : this.timeStamp,
            },
        };
    }
    
}

export class GameModel {

	difficulty: DifficultyLevels = DifficultyLevels.normal;
    gameID: string;
    lastPlay: WordPlay;
    letterBank: LetterBank;
	textManager: TextManager;
    numPlayers = 2;
    pointsSpent: number[];
	wordOfTheDay: string;
    watchWords: string[][];
	wwLength: number[];
    myNumModsInReserve: object = DEFAULT_NUM_MODS;
	myWordInProgress: number[];
	myWordInProgressMods: ModifierType[];
    playTurns: WordPlayTurn[][][];
    playerNames: string[];
	myNumModsInPlay:object = buildObj(
        [ModifierType.shield, ModifierType.poison],
        [0, 0]
    );
	//myNumModsInPlay: [ModifierType : number] = [.shield:0, .poison:0, .lightning:0]
    playFlag = false;
    invalidWordFlag = false;
    modFlag = false;
    bonusMultiplier = 2;
    bonusLetterIndex = -1;
    myPosition = -1;
    currentPosition = -1;
    firstRetiredPlayerPosition: number[];
	isMyTurn = true;
    myTurnStartDate: Date;
    myTurnTimeLeft: number;
    currentTurnHoursLeft: number
	roundsInThisGame: number = 1;
	currentRound: number = 0;
    newRoundFlag = false;
	myPickedArray: number[] = [];
	numSpins: number = DEFAULT_NUM_SPINS;
	didSpin = false;
	isMyTurnPending = false;
	gotNewPickedArray = false;
    playerData: object[];
    watchWordMods: ModifierType[][][] = [];
    swapFlag = false;
	forfeitingPositions: number[];
    isGameInProgress = false;

    static KEY_GAME_MODEL = "GameModel";
    static KEY_GAME_MODEL_GAME_ID = "gameId";
    static KEY_GAME_MODEL_IS_CURRENT_GAME = "isCurrentGame";
    static KEY_GAME_MODEL_DIFFICULTY_LEVEL = "difficulty";
    static KEY_GAME_MODEL_NUM_PLAYERS = "numPlayers";
    static KEY_GAME_MODEL_PLAYER_NAMES = "playerNames";
    static KEY_GAME_MODEL_MY_POSITION = "myPosition";
    static KEY_GAME_MODEL_CURRENT_POSITION = "currentPosition";
    static KEY_GAME_MODEL_IS_IN_PROGRESS = "isInProgress";
    static KEY_GAME_MODEL_TURN_TYPE = "turnType";
    static KEY_GAME_MODEL_WOD = "wod";

    static KEY_GAME_MODEL_TEXT_MANAGER = TextManager.KEY_TEXT_MANAGER;
    static KEY_GAME_MODEL_LETTER_BANK = LetterBank.KEY_LETTER_BANK;
    static KEY_GAME_MODEL_LETTERS = "letters";

    static KEY_GAME_MODEL_TOTAL_ROUNDS = "totalRounds";
    static KEY_GAME_MODEL_CURRENT_ROUND = "currentRound";
    static KEY_GAME_MODEL_IS_MY_TURN = "isMyTurn";
    static KEY_GAME_MODEL_FIRST_RETIRED_POSITION = "firstRetiredPosition";

    static KEY_GAME_MODEL_SPINS = "spins";

    static KEY_GAME_MODEL_WORDS_PLAYED = "wordsPlayed";
    static KEY_GAME_MODEL_POINTS_SCORED = "pointsScored";
    static KEY_GAME_MODEL_PLAYS_MADE = "playsMade";
    static KEY_GAME_MODEL_TURNS_TAKEN = "turnsTaken";
    static KEY_GAME_MODEL_BONUS_LETTER = "bonusLetter";
    static KEY_GAME_MODEL_NUM_MODS = "numMods";
    static KEY_GAME_MODEL_BONUS_MULT = "bonusMult";
    static KEY_GAME_MODEL_POINTS_SPENT = "pointsSpent";
    static KEY_GAME_MODEL_LAST_PLAY =  "latPlay";

    static KEY_GAME_MODEL_WATCH_WORDS = "watchWords";
    static KEY_GAME_MODEL_WATCH_WORD_MASKS = "watchWordMasks";
    static KEY_GAME_MODEL_WATCH_WORD_MODS = "watchWordMods";

    static KEY_GAME_MODEL_PRIVATE_DATA = "privateData";
    static KEY_GAME_MODEL_PLAYER_DATA = "playerData";
    static KEY_GAME_MODEL_VALID_WORDS = "valisWords";
    static KEY_GAME_MODEL_WINNING_POSITIONS = "winningPositions";

    static KEY_PRIVATE_DATA_GAME_ID = "gameId";
    static KEY_PRIVATE_DATA_DID_SPIN =  "didSpin";
    static KEY_PRIVATE_DATA_NUM_MODS_IN_RESERVE =  ".numModsInReserve";
    static KEY_PRIVATE_DATA_LAST_PLAY =  "latPlay";
    static KEY_PRIVATE_DATA_WORD_IN_PROGRESS =  "wordInProgress";
    static KEY_PRIVATE_DATA_WORD_IN_PROGRESS_MODS =  "wordInProgressMods";
    static KEY_PRIVATE_DATA_PICKED_ARRAY = "pickedArray";

    static fromJSON(json: object, pos: number): GameModel {
		const model = new GameModel();
        model.fillInGame(json);
        return model;
	}

    static async instantiate(numPlayers: number=2, difficulty: DifficultyLevels = DifficultyLevels.normal) {
        const gm = new GameModel(numPlayers, difficulty);
        gm.textManager = await TextManager.instantiate(difficulty);
        gm.letterBank = new LetterBank(gm.textManager.letterSet);
        gm.bonusLetterIndex = gm.textManager.letterSet.randomLetterIndex();
        gm.myPickedArray = gm.letterBank.pick(null, false, gm.bonusLetterIndex, gm.isDifficultyEasyHalf());
		gm.wordOfTheDay = gm.textManager.getRandomWordOfLength(WOD_LENGTH_MIN, WOD_LENGTH_MAX, true);
        gm.playerData[0] = gm.toPlayerData();
        gm.newWatchWord();
        return gm;
    }

    private constructor(numPlayers: number=2, difficulty: DifficultyLevels = DifficultyLevels.normal) {
		
		this.gameID = randomString();
		//this.textManager = await TextManager.instantiate(difficulty);
		//this.bonusLetterIndex = this.textManager.letterSet.randomLetterIndex();
		this.myPosition = 0;
		this.numPlayers = numPlayers;
		this.difficulty = difficulty
		this.pointsSpent = Array(this.numPlayers).fill(0);

        //TODO: "no face"
		this.playerNames = Array(this.numPlayers).fill("None"); 
		
		this.watchWords = [];
        this.wwLength = Array(this.roundsInThisGame).fill(0);
		this.playTurns =  Array(this.roundsInThisGame).fill(
            Array(this.numPlayers).fill([])
        );
		this.firstRetiredPlayerPosition = Array(this.roundsInThisGame).fill(-1);

		this.playerData = Array(this.numPlayers).fill({});
		
		//this.newWatchWord();
		this.bonusMultiplier = this.newBonusMultiplier();
		//this.myPickedArray = this.letterBank.pick(null, false, this.bonusLetterIndex, this.isDifficultyEasyHalf());
		//this.wordOfTheDay = this.textManager.getRandomWordOfLength(WOD_LENGTH_MIN, WOD_LENGTH_MAX, true);
		//this.playerData[0] = this.toPlayerData();
		
	}

     // for convenience
	isDifficultyEasyHalf(): boolean {
		return this.difficulty <= DifficultyLevels.normal;
	}

	wordLengthRange(): number[] {
		return WORD_LENGTH_RANGE[this.difficulty] || [this.textManager!.minWordLength, this.textManager!.minWordLength];
	}

	watchWordLengthRange(): number[] {
		return WATCH_WORD_LENGTH_RANGE[this.difficulty] || [this.textManager!.minWordLength, this.textManager!.minWordLength];
	}

	// use these to construct plays using the text manager
	buildWordPlay(word: string, points: number): WordPlay {
        const i = this.textManager.find(word);
		return new WordPlay(word, i == TextManager.INVALID_WORD_INDEX ? 0 : points, i);
	}

/*
	buildWordPlay(json: object ): WordPlay {
		
		let wp: WordPlay;
		if( pj.length > 0 ) {
			let p = pj[KEY_WORD_PLAY] as! [string:AnyObject];
			let pid = p[KEY_WORD_PLAY_PLAY_ID] as? string;
			let pwdex = p[KEY_WORD_PLAY_PLAY_WORD_INDEX] as? number;
			let pp = p[KEY_WORD_PLAY_PLAY_POINTS] as! number;
			
			let numWords = this.textManager!.wordSearchArray.length;
			if pwdex != null {
			if( pwdex! >= INVALID_WORD_INDEX && pwdex! < numWords ) {
				let pw: string?;
				if( pwdex! >= INVALID_WORD_INDEX ) {
					if( pwdex! == PASS_TOKEN_INDEX  ) {
						pw = PASS_TOKEN;
					}
					else if pwdex! == INVALID_WORD_INDEX {
						if let sw = p[KEY_WORD_PLAY_PLAY_WORD] as? string {
							pw = sw
						}
						else {
							pw = INVALID_WORD_TOKEN
						}
					}
					else {
						pw = this.textManager?.wordSearchArray[pwdex!].toUpperCase();
					}
				}
				if( pw != null ) {
					wp = WordPlay(word: pw!, points: pp);
					wp!.wordIndex = pwdex!;
					wp!.playID = (pid == "" ? null : pid);
					if let pmods = p[KEY_WORD_PLAY_PLAY_MODS] as? [number] {
						wp!.mods = pmods.map( { ModifierType(rawValue: $0) ?? .noSuchModifier } );
					}
				}
			}
			}
			else {
				
			}
		}
		return wp;
	}
	*/

	plays(): WordPlay[][][] {
		return this.playTurns.map(x => x.map(y => y.map(z => z.play)));
	}

	flattenedPlays(): WordPlay[] {
        return this.plays().flat(2);
        
		let fp: WordPlay[] = [];
		for (const rArr of this.plays()) {
			for (const pArr of rArr) {
				for (const wp of pArr) {
					fp.push(wp);
				}
			}
		}
		return fp;
	}

    // for tables etc.
	numPlays(): number {
		return this.flattenedPlays().length;
	}

	myPlays(): WordPlay[] {
		return this.playsForPos(this.myPosition);
	}

	playsForPos(pos: number): WordPlay[] {
		return this.turnsForPos(pos).map(x => x.play);
	}
	
	wordsPlayed(): string[][][] {
		return this.plays().map(x => x.map(y => y.map(z => z.word)));
	}

	unshieldedWordsPlayed(): string[][][] {
		return this.plays().map(x => x.map(y => y.filter(z => z.wordIndex != TextManager.INVALID_WORD_INDEX).map(a => a.unshieldedWord())));
	}

    // don't count passes
	flattenedWordsPlayed(): string[] {  
		return this.flattenedPlays().map(x => x.word).filter(y => y != PASS_TOKEN);
	}
	
	concattedWordsPlayed(): string[][] {
		return this.unshieldedWordsPlayed().map(x => x.map(y => y.reduce((prev, curr) => prev + (curr == PASS_TOKEN ? "" : curr))));
	}

	concattedWordsPlayedInGameByPosition(): string[] {
		const cwpArr: string[] = Array(this.numPlayers).fill("");
		for (const sArr of this.concattedWordsPlayed()) {
			for (let i = 0; i < sArr.length; ++i) {
				cwpArr[i] += sArr[i];
			}
		}
		return cwpArr;
	}

	lettersUsedByPosition(): Set<string>[] {
		return this.concattedWordsPlayedInGameByPosition().map(x => new Set(x));
	}

    //TODO: equivalent of symmetricDifference
	//lettersNotUsedByPosition(): Set<string>[] {
	//	const alphaset = Set(this.textManager.letterSet.letters);
	//	return this.lettersUsedByPosition.map({ alphaset.symmetricDifference($0) })
	//}

	buildWordPlayTurn(wptDict: object): WordPlayTurn {
        const ptj:object = wptDict[WordPlayTurn.KEY_WORD_PLAY_TURN];
        if (! ptj) {
            return null;
        }
		const pj:object = ptj[WordPlayTurn.KEY_WORD_PLAY_TURN_PLAY];
        if (! pj) {
            return null;
        }

        return new WordPlayTurn(
			WordPlay.fromJSON(pj),
			ptj[WordPlayTurn.KEY_WORD_PLAY_TURN_POSITION],
			ptj[WordPlayTurn.KEY_WORD_PLAY_TURN_TIMESTAMP]
		);
	}

	
	orderedTurns(): WordPlayTurn[][] {
		return this.playTurns.map(x => x.reduce((prev, curr) => prev.concat(curr), []).sort((a, b) => a.timeStamp - b.timeStamp));
	}

	flattenedTurns(): WordPlayTurn[] {
		return this.playTurns.flat(2);
	}

	turnsForPos(pos: number): WordPlayTurn[] {
		return this.flattenedTurns().filter(x => x.position == pos);
	}

	
	myNumMods():object {
		let mnm: object = {};
		for (const mod in this.myNumModsInReserve) {
			mnm[mod] = this.myNumModsInReserve[mod] + (this.myNumModsInPlay[mod] || 0);
		}
		return mnm;
	}

	addNumModsInPlay(n: number, mod: ModifierType, adjustReserve: boolean=true) {
        if (mod == ModifierType.noSuchModifier) {
            return;
        }
		if (! this.myNumModsInPlay[mod]) {
            this.myNumModsInPlay[mod] = 0;
        }
		this.myNumModsInPlay[mod]! += n;
        if (! adjustReserve) {
            return;
        }
        if (! this.myNumModsInReserve[mod]) {
            this.myNumModsInReserve[mod] = DEFAULT_NUM_MODS[mod];
        }
        this.addNumModsInReserve(-n, mod);
	}

	addNumModsInReserve(n: number, mod: ModifierType) {
		if (this.myNumModsInReserve[mod] != null)  {
			this.myNumModsInReserve[mod] += n;
		}
	}

	numModsPlayedForPos(pos: number):object {
		let mti: {};
		for (const p of this.playsForPos(pos)) {
			for (const mod of (p.mods || []).filter(x => x != ModifierType.noSuchModifier)) {
				if (! mti[mod]) {
                    mti[mod] = 0;
                }
				mti[mod]! += 1;
			}
		}
		for (let r = 0; r <= this.currentRound; ++r) {
			for (const mod of this.watchWordMods[r][pos].filter(x => x != ModifierType.noSuchModifier)) {
                if (! mti[mod]) {
                    mti[mod] = 0;
                }
                mti[mod]! += 1;
			}
		}
		return mti;
	}

	numModsJSON(): object {
		let json = {};
		for (const mod in this.myNumMods()) {
			json[`${mod}`] = this.myNumMods()[mod];
		}
		return json;
	}

	jsonToNumMods(json:object):object {
        if (! json) {
            return {};
        }

		const nm = {};
        for (const mod in json) {
            nm[mod] = json[mod];
        }
		return nm;
	}

	pointsScored(): number[][][] {
		return this.plays().map(x => x.map(y => y.map(z => z.points)));
	}

	pointsByPos(): number[] {
		const pbp = Array(this.numPlayers).fill(0);
		for (let i = 0; i < this.numPlayers; ++i) {
			for (const rArr of this.pointsScored()) {
				pbp[i] += rArr[i].reduce((prev, curr) => prev + curr, 0);
			}
		}
		return pbp;
	}

    // take points spent into account
	scoreByPos(): number[] {
		const sbp = Array(this.numPlayers).fill(0);
		for (let i = 0; i < sbp.length; ++i) {
			if( (this.forfeitingPositions || []).indexOf(i) >= 0) {
				sbp[i] = -1;
			}
			else {
				sbp[i] = this.pointsByPos()[i] - (this.pointsSpent == null ? 0 : this.pointsSpent[i])
			}
		}
		return sbp;
	}

	myScore(): number {
		return this.scoreForPosition(this.myPosition) || 0;
	}

	flattenedPointsScored(): number[] {
		return this.flattenedPlays().map(x => x.points);
	}

	highestWordScoreByPos(): number[] {
		let wmax = Array(this.numPlayers).fill(0);
		for (let i = 0; i < wmax.length; ++i) {
            wmax[i] = Math.max(...this.playsForPos(i).map(x => x.points));
		}
		return wmax;
	}

	setBonusLetterIndex(index: number) {
        this.bonusLetterIndex = index;
        this.bonusMultiplier = this.newBonusMultiplier();
	};

	bonusLetterChar(): string {
		return this.bonusLetterIndex >= 0 ? this.textManager.letterSet.letters[this.bonusLetterIndex] : null;
	}
	
	nextPosition(): number {
		return (this.myPosition + 1) % this.numPlayers;
	}

	nextActivePosition(apArr?: boolean[]): number {
        if (apArr == undefined) {
            apArr = this.activePlayers()[this.currentRound];
        }
		let nap: number;
		let nextPos = this.nextPosition();
		while (! apArr[nextPos] && nextPos != this.currentPosition) {
            nextPos = (nextPos + 1) % apArr.length;
        }
        // if we wrap around there is no next active position
		if (nextPos != this.currentPosition) {
			nap = nextPos;
		}
		
		return nap;
	}

	lastPosition(): number {
		return (this.myPosition + this.numPlayers - 1) % this.numPlayers;
	}

	startPositionForRound(): number {
		return this.getStartPosition(this.currentRound);
	}

	getStartPosition(round: number): number {
		return round % this.roundsInThisGame;
	}
	
    activePlayers(): boolean[][] {
		const ap: boolean[][] = [];
        let aArr: boolean[];

        // iterating over rounds
		for (const wwup of this.watchWordUnmaskedPcts()) {
			aArr = wwup.map(x => x < 1.0);
			for (let i = 0; i < aArr.length; ++i) {
				aArr[i] = aArr[i] && ( this.forfeitingPositions.indexOf(i) < 0);
			}
			ap.push(aArr);
		}
		return ap;
	}

	numActivePlayers(): number[] {
		let nap: number[] = [];
		for (const ap of this.activePlayers()) {
			nap.push(ap.reduce((prev, curr) => prev + (curr ? 1 : 0), 0));
		}
		return nap;
	}

	activePlayerPositions(): number[][] {
		const app: number[][] = [];
        let posArr: number[];
		for (const apArr of this.activePlayers()) {
			posArr = [];
			for (let i = 0; i < apArr.length; ++i) {
				if (apArr[i]) {
					posArr.push(i);
				}
			}
			app.push(posArr);
		}
		
		return app;
	}

	setMyTurnStartDate(date: Date) {
        this.myTurnStartDate = date;
        if (this.myTurnStartDate) {
            this.myTurnTimeLeft = this.myTurnStartDate.getSeconds() + TIME_TO_PLAY;
        }
	};

	myTurnHoursLeft(): number {  // for convenince
		return Math.max(Math.ceil(this.myTurnTimeLeft / (60.0 * 60)), 0);
	}

	isRoundOver(r?: number): boolean {
        if (r == undefined) {
            r = this.currentRound;
        }
		return this.numActivePlayers[r] == 1;
	}
	
	flattenedWatchWords(): string[] {
        if (! this.watchWords) {
            return null;
        }

		let fww: string[]= [];
		for (const rArr of this.watchWords) {
			fww = fww.concat(rArr);
		}
		return fww;
	}

	jsonWatchWord(): string[][] {
		let jww: string[][] = [];
		if (this.watchWords) {
			for (const wwArr of this.watchWords) {
				jww.push(wwArr);
			}
		}
		else {
			jww.push(Array(this.numPlayers).fill(""));
		}
		
		return jww;
	}

	maskedWatchWords(): string[][] {
        if (! this.watchWords) {
            return null;
        }

		const mww: string[][] = [];
        let rww: string[];
        let wwArr: string[];
        let wwm: boolean[][];
        let pos: number;
        for (let r = 0; r <= this.currentRound; ++r) {
            pos = 0;
            wwArr = this.watchWords[r];
            wwm = this.watchWordMasks![r];
            rww = [];
            for (const ww of wwArr) {
                rww.push(maskStringWithPlaceHolder(ww, wwm[pos], WATCH_WORD_PLACEHOLDER));
                pos += 1;
            }
            mww!.push(rww);
        }
		
		return mww;
	}
    
	myWatchWords(): string[] {
		return this.watchWordsForPos(this.myPosition);
	}

	watchWordsForPos(pos: number): string[] {
        if (! this.watchWords) {
            return null;
        }

		const mww: string[] = [];
        for (const rArr of this.watchWords) {
            if( pos < rArr.length ) {
                mww.push(rArr[pos]);
            }
        }
		
		return mww;
	}

	watchWordMasks(): boolean[][][] {
		if (! this.watchWords) {
            return null;
        }

		const wwm: boolean[][][] = [];
        let wwArr: string[];

        for (let r = 0; r <= this.currentRound; ++r) {
            wwArr = this.watchWords[r];
            const rww = [];
            const cwpArrArr = this.concattedWordsPlayed();
            for (let pos = 0; r < wwArr.length; ++r) {
                const lastPos = (pos + this.numPlayers - 1) % this.numPlayers;
                rww.push(this.buildMaskForWordUsingWord(wwArr[pos], cwpArrArr[r][lastPos]));
            }
            wwm!.push(rww)
        }

		return wwm
	}

	newMaskFromPlay(pl: WordPlay): boolean[] {
		return this.newMaskFromWord(pl.word);
	}

	newMaskFromWord(word: string): boolean[] {
        if (! this.watchWordMasks()) {
            return [];
        }

		const newMask: boolean[] = [];
        const r = this.currentRound;
        let nextPos = this.nextPosition();
        const newCC = this.concattedWordsPlayed[r][this.myPosition] + word;
        return this.buildMaskForWordUsingWord(this.watchWords[r][nextPos], newCC);
	}

	oppMasksToChangeFromPlay(pl: WordPlay): boolean[] {
		if (! this.watchWordMasks()) {
            return [];
        }

		const maskXOR: boolean[] = [];
	
        const r = this.currentRound;
        const nextPos = this.nextPosition();
        const oppWWMask = this.watchWordMasks()[r][nextPos];
        const newMask = this.newMaskFromPlay(pl);
         // XOR the two
        for (let i = 0; i < oppWWMask.length; ++i) { 
            maskXOR.push( (oppWWMask[i] || newMask[i]) && !(oppWWMask[i] && newMask[i]) );
        }
		
		return maskXOR;
	}

	oppShieldsInvokedByPlay(pl: WordPlay): boolean[] {
		const shieldMask: boolean[] = [];
		
		const maskXOR = this.oppMasksToChangeFromPlay(pl);
		const oppWWMods = this.watchWordMods[this.currentRound][this.nextPosition()];
		let s: boolean;
		for (let i = 0; i < maskXOR.length; ++i) {
			s = maskXOR[i] && oppWWMods[i] == ModifierType.shield;
			shieldMask.push(s);
		}

		return shieldMask;
	}

	oppShieldPositionsInvokedByPlay(pl: WordPlay): number[] {
		const shieldPos: number[] = [];
		
		const shieldMask = this.oppShieldsInvokedByPlay(pl);
		let i = 0;
		for (const s of shieldMask) {
			if(s) {
                shieldPos.push(i);
            }
			i += 1;
		}
	
		return shieldPos;
	}

	oppShieldCharsInvokedByPlay(pl: WordPlay): string[] {
		const shieldChar: string[] = [];
		
		let shieldMask = this.oppShieldsInvokedByPlay(pl);
		let i = 0;
		for (const c of this.watchWords![this.currentRound][this.nextPosition()]) {
			if( shieldMask[i] ) {
                shieldChar.push(c);
            }
			i += 1;
		}
		
		return shieldChar;
	}
	
    // for json saves
	jsonWatchWordMasks(): boolean[][][] {
		const jwwm: boolean[][][] = [];
        
        const allWWM = this.watchWordMasks();
		if(allWWM) {
			for (const wwmArr of allWWM) {
				jwwm.push(wwmArr);
			}
		}
		else {
			jwwm.push(Array(this.numPlayers).fill([]));
		}
		
		return jwwm;
	}

	watchWordUnmaskedPcts(): number[][] {
		if (! this.watchWords) {
            return [];
        }

		const pct: number[][] = [];
        for (let r = 0; r <= this.currentRound; ++r) {
            const dArr = [];
            const wwm = this.watchWordMasks[r];
            for (const m of wwm) {
                let numUnmasked = m.reduce((prev, curr) => prev + (curr ? 1 : 0), 0);
                dArr.push(m.length == 0 ? 0.0 : numUnmasked / m.length);
            }
            pct.push(dArr);
        }
		
		return pct;
	}
	
	numModsInMyCurrentWatchWord(mod: ModifierType): number {
		return this.watchWordMods[this.currentRound][this.myPosition].reduce((prev, curr) => prev + (curr == mod ? 1 : 0), 0);
	}

	fillInWatchWordMods(round?: number, pos?: number) {
        if (round == undefined || pos == undefined) {
            if (this.currentRound <= this.watchWordMods.length - 1) {
                return;
            }
            let r = this.watchWordMods.length;
			do {
				this.watchWordMods.push(Array(this.numPlayers).fill([]));
				for (let pos = 0; pos < this.numPlayers; ++pos) {
					this.fillInWatchWordMods(r, pos);
				}
				r += 1;
			}
            while (r <= this.currentRound);
            return;
        }
		let wwm = this.watchWordMods;
		if (round <= this.currentRound && pos < this.numPlayers) {
			let mods = wwm[round][pos];
			if (! mods.length) {
				this.watchWordMods[round][pos] = Array(this.watchWords![round][pos].length).fill(ModifierType.noSuchModifier);
			}
		}
	}
	
    winningPositions():number [] {
        return this.isGameInProgress ? this.activePlayerPositions()[this.currentRound] : [];
	}

	async fillInGame(json:object) {
		
        function _fillTurns(t: object[][][]) {
            if (! t) {
                return;
            }
            // match the number of rounds
            if (t.length > this.playTurns.length) {  
				this.playTurns += Array(t.length - this.playTurns.length).fill(
                    Array(this.numPlayers).fill([])
                );
			}
			for (let i = 0; i < t.length; ++i) {
				for (let j = 0; j < t[i].length; ++j) {
                    if (t[i][j].length <= this.playTurns[i][j].length) {
                        continue;
                    }
                    for (let k = this.playTurns[i][j].length; k < t[i][j].length; ++k) {
                        const newplt = this.buildWordPlayTurn(t[i][j][k]);
                        if (! newplt) {
                            continue;
                        }
                        this.playTurns[i][j].push(newplt);
                    }
				}
			}
        }

		this.gameID = (json[GameModel.KEY_GAME_MODEL_GAME_ID]).toLowerCase();
		this.numPlayers = json[GameModel.KEY_GAME_MODEL_NUM_PLAYERS];
		this.difficulty = json[GameModel.KEY_GAME_MODEL_DIFFICULTY_LEVEL];
		
		if (! this.playerNames.length) {
			this.playerNames = Array(this.numPlayers).fill("None");
		}
		
		this.roundsInThisGame = json[GameModel.KEY_GAME_MODEL_TOTAL_ROUNDS];
		this.currentRound = json[GameModel.KEY_GAME_MODEL_CURRENT_ROUND];
		this.firstRetiredPlayerPosition = json[GameModel.KEY_GAME_MODEL_FIRST_RETIRED_POSITION] || Array(this.roundsInThisGame).fill(-1);
		this.isGameInProgress = json[GameModel.KEY_GAME_MODEL_IS_IN_PROGRESS];
		
		this.textManager = await TextManager.fromJSON(json[GameModel.KEY_GAME_MODEL_TEXT_MANAGER]);
		
        _fillTurns(json[GameModel.KEY_GAME_MODEL_TURNS_TAKEN]);
		
		this.pointsSpent = json[GameModel.KEY_GAME_MODEL_POINTS_SPENT]  || Array(this.numPlayers).fill(0);
		this.watchWords = json[GameModel.KEY_GAME_MODEL_WATCH_WORDS];

        //this.wwLength = Array(this.roundsInThisGame).fill(0);
        this.wwLength = this.watchWords.map(x => x[0].length);
		
        this.watchWordMods = json[GameModel.KEY_GAME_MODEL_WATCH_WORD_MODS];

		this.bonusLetterIndex = json[GameModel.KEY_GAME_MODEL_BONUS_LETTER];
		this.bonusMultiplier = json[GameModel.KEY_GAME_MODEL_BONUS_MULT];
        this.wordOfTheDay = json[GameModel.KEY_GAME_MODEL_WOD];
		
		this.playerData = json[GameModel.KEY_GAME_MODEL_PLAYER_DATA];
		this.fillInPlayerData(this.playerData[this.myPosition][GameModel.KEY_GAME_MODEL_PRIVATE_DATA]);
	}

    // must be invoked after position is set
	fillInPlayerData(pd: object) {
		if (Object.keys((pd || {})).length) {
            this.myPosition = pd[GameModel.KEY_GAME_MODEL_MY_POSITION];
			this.numSpins = pd[GameModel.KEY_GAME_MODEL_SPINS];
			this.didSpin = pd[GameModel.KEY_PRIVATE_DATA_DID_SPIN];
			this.lastPlay = WordPlay.fromJSON(pd[GameModel.KEY_PRIVATE_DATA_LAST_PLAY]);
			this.myNumModsInReserve = this.jsonToNumMods(pd[GameModel.KEY_GAME_MODEL_NUM_MODS]);
            this.letterBank = LetterBank.fromJSON(pd[GameModel.KEY_GAME_MODEL_LETTER_BANK]);
            this.myWordInProgress = pd[GameModel.KEY_PRIVATE_DATA_WORD_IN_PROGRESS].map(x => x == TextManager.INVALID_WORD_INDEX ? null : x);

            const pa = pd[GameModel.KEY_PRIVATE_DATA_PICKED_ARRAY] ;
            this.myPickedArray = pa.length ? pa : this.letterBank.pick(null, false, this.bonusLetterIndex, this.isDifficultyEasyHalf());
            this.myWordInProgressMods = pd[GameModel.KEY_PRIVATE_DATA_WORD_IN_PROGRESS_MODS];
			this.myNumModsInPlay = Array(this.addNumModsInPlay.length).fill(0);

			for (const mod of this.myWordInProgressMods || []) {
				this.addNumModsInPlay(1, mod);
			}
			for (const mod of this.watchWordMods[this.currentRound][this.myPosition]) {
				this.addNumModsInPlay(1, mod);
			}
		}
        // we got game data but don't yet have private data
		else {
			this.letterBank = new LetterBank(this.textManager.letterSet);
            const pd = this.playerData[this.myPosition][GameModel.KEY_GAME_MODEL_PRIVATE_DATA];
            if (pd) {
                const opplb = LetterBank.fromJSON(pd[GameModel.KEY_GAME_MODEL_LETTER_BANK]);
                this.letterBank.letterCounts[this.bonusLetterIndex] = opplb.letterCounts[this.bonusLetterIndex];
            }

			if (this.plays()[this.currentRound][this.lastPosition()].length > 0) {
				let firstOppWord = this.plays()[this.currentRound][this.lastPosition()][0].word
				let nbl = this.textManager.numCharsWithIndex(firstOppWord, this.bonusLetterIndex);
			}
			this.myPickedArray = this.letterBank.pick(null, false, this.bonusLetterIndex, this.isDifficultyEasyHalf());
			this.playerData[this.myPosition] = this.toPlayerData();
		}
	}
	
	scorePlayUsingLetterSet(pl: WordPlay, lSet: LetterSet): number {
        if (! this.watchWords || ! this.watchWords[this.watchWords.length - 1]) {
            return;
        }

		let score = this.baseScoreForPlayUsingLetterSet(pl, lSet);
        if (pl.word == this.watchWords[this.watchWords.length - 1][this.nextPosition()] ) {
            score *= WATCHWORD_REVEALED_BONUS_FACTOR;
            score += WATCHWORD_REVEALED_BONUS;
        }
        else {
            let newMask = this.newMaskFromWord(pl.word || "");
            let isAllTrue = false;
            if( newMask.length > 0 ) {
                isAllTrue = newMask.reduce((prev, curr) => prev && curr, true);
            }
            if( isAllTrue ) {
                score *= WATCHWORD_PLAYED_BONUS_FACTOR;
                score += WATCHWORD_PLAYED_BONUS
            }
        }
		
		return score;
	}

	scoreWord(word: string): number {
		return this.scorePlay(this.buildWordPlay(word, 0));
	}

	baseScoreForWordUsingLetterSet(word: string, lSet: LetterSet, mods: ModifierType[]): number {
		let score: number = 0;
        let i: number;
        let j = 0;
        let mod: ModifierType;
		for (const c of word.toUpperCase()) {
			i = lSet.letters.indexOf(c);
			if( i >= 0 ) {
				if( j < (mods || []).length ) {
					mod = mods[j];
				}
				score += this.bonusForLetter(i, mod) * lSet.letterValues[i];
			}
			j += 1;
            mod = null;
		}
		score *= (word.toUpperCase() == this.wordOfTheDay.toUpperCase() ? WOD_PLAYED_BONUS_FACTOR : 1);
		return score;
	}

	baseScoreForPlayUsingLetterSet(pl: WordPlay, lSet: LetterSet): number {
        if (! pl || ! pl.word) {
            return 0;
        }

		let score = 0;
        let i: number;
        let j = 0;
        let mod: ModifierType;

		for (const c of pl.word.toUpperCase()) {
			i = lSet.letters.indexOf(c);
			if (i >= 0 ) {
				if (j < pl.mods.length) {
					mod = pl.mods[j];
				}
				score += this.bonusForLetter(i, mod) * lSet.letterValues[i];
			}
			j += 1;
            mod = null;
		}
		score *= (pl.word.toUpperCase() == this.wordOfTheDay.toUpperCase() ? WOD_PLAYED_BONUS_FACTOR : 1);
		return score;
	}

	bonusForLetter(lIndex: number, mod?: ModifierType): number {
		const m = mod == undefined ? ModifierType.noSuchModifier : mod;
		let modMult:number = (m == ModifierType.poison || m == ModifierType.lightning) ? 0 : 1;
		return (lIndex == this.bonusLetterIndex ? this.bonusMultiplier : modMult);
	}
	
	scorePlay(pl?: WordPlay): number {
		return this.scorePlayUsingLetterSet(pl, this.textManager.letterSet);
	}

	baseScoreForWord(word: string, mods?: ModifierType[] ): number {
		return this.baseScoreForWordUsingLetterSet(word, this.textManager.letterSet, mods);
	}

	baseScoreForPlay(pl?: WordPlay): number {
		return this.baseScoreForPlayUsingLetterSet(pl, this.textManager!.letterSet );
	}

	scoreForPosition(pos: number): number {
        return pos < this.numPlayers ? this.scoreByPos[pos] : null;
	}
	
	newBonusMultiplier(): number {
		
		let mult = 2;
		let r = Math.floor(10 * Math.random());
		if( r < 6 ) {
			mult = BonusMultipliers.bronze;
		}
		else if( r < 8 ) {
			mult =  BonusMultipliers.silver;
		}
		else {
			mult =  BonusMultipliers.gold;
		}

		return mult;
	}
	
	newWatchWord(): boolean {
		return this.newWatchWordAtPosition(this.myPosition);
	}

	newWatchWordAtPosition(pos: number): boolean {
		let ww: string;
        let index: number;
        let wwIndex: number;

        // add spots for new round if needed
		if (this.currentRound > this.watchWords.length - 1) {  
			let r = this.watchWords.length;
			do {
				this.watchWords.push(Array(this.numPlayers).fill(""));
				this.watchWordMods.push(Array(this.numPlayers).fill([]));
				r += 1;
			}
            while (r <= this.currentRound);
		}
		if (this.watchWords[this.currentRound][pos].length) {
            this.fillInWatchWordMods();
            return false;
        }
			
        let wwLenMin = this.watchWordLengthRange[0]
        let wwLenMax = this.watchWordLengthRange[1]
        let oppPos = (pos+1) % this.numPlayers
        let oppWW = this.watchWords![this.currentRound][oppPos]
        let oppWWLen = oppWW.length
        if( oppWWLen > 0 ) {  // if opponent has WW, this should be the same length
            wwLenMin = oppWWLen;  wwLenMax = oppWWLen
        }
        let wwGenTries = 0;
        let firstOppWord = "";
        if (this.plays()[this.currentRound][oppPos].length > 0) {
            firstOppWord = this.plays[this.currentRound][oppPos][0].word;
        }
        do {
            ww = this.textManager.getRandomWordOfLength(wwLenMin, wwLenMax)!.toUpperCase()
            index = this.flattenedWordsPlayed().indexOf(ww);
            wwIndex = this.flattenedWatchWords().indexOf(ww);
            wwGenTries += 1;
        }
        while (index >= 0 || wwIndex >= 0 || this.textManager.haveCharsInCommon(firstOppWord, ww) || ww == this.wordOfTheDay.toUpperCase());

        this.watchWords![this.currentRound][pos] = ww;
        this.watchWordMods[this.currentRound][pos] = Array(ww.length).fill(ModifierType.noSuchModifier);
		this.fillInWatchWordMods();
		
		return true;
	}
	
	buildMaskForWordUsingWord(wordToMask: string, wordAsMask: string): boolean[] {
		const mask = Array(wordToMask.length).fill(false);

        for (const c of wordAsMask) {
            let wwsub = wordToMask;
            let iIndex = 0;
            let wordToMaskIndex = wwsub.indexOf(c);
            while (wordToMaskIndex >= 0) {
                iIndex += wordToMaskIndex;
                if (! mask[iIndex]) {
                    mask[iIndex] = true;
                    break;
                }
                // already unmasked
                wwsub = wwsub.slice(wordToMaskIndex + 1);
                iIndex += 1;
                wordToMaskIndex = wwsub.indexOf(c);
            }
        }
		
		return mask;
	}

	hasWordBeenPlayed(word: string ): boolean {
		return this.flattenedWordsPlayed().reduce((prev, curr) => prev || curr == word, false);
	}

	toTurnData(play?: WordPlay, pickedArray: number[]=null, type:TurnType=TurnType.regular): object {
		
		const pa = pickedArray || this.myPickedArray;

		this.playerData[this.myPosition] = this.toPlayerData(pa);

		return buildObj(
            [GameModel.KEY_GAME_MODEL],
            [buildObj(
                [
                    GameModel.KEY_GAME_MODEL_GAME_ID,
                    GameModel.KEY_GAME_MODEL_IS_IN_PROGRESS,
                    GameModel.KEY_GAME_MODEL_NUM_PLAYERS ,
                    GameModel.KEY_GAME_MODEL_DIFFICULTY_LEVEL,
                    GameModel.KEY_GAME_MODEL_TOTAL_ROUNDS,
                    GameModel.KEY_GAME_MODEL_CURRENT_ROUND,
                    GameModel.KEY_GAME_MODEL_TURNS_TAKEN,
                    GameModel.KEY_GAME_MODEL_BONUS_LETTER ,
                    GameModel.KEY_GAME_MODEL_BONUS_MULT,
                    GameModel.KEY_GAME_MODEL_POINTS_SPENT,
                    GameModel.KEY_GAME_MODEL_WATCH_WORDS,
                    GameModel.KEY_GAME_MODEL_WATCH_WORD_MASKS,
                    GameModel.KEY_GAME_MODEL_WATCH_WORD_MODS,
                    GameModel.KEY_GAME_MODEL_PLAYER_DATA,
                    GameModel.KEY_GAME_MODEL_LAST_PLAY,
                    GameModel.KEY_GAME_MODEL_FIRST_RETIRED_POSITION,
                    GameModel.KEY_GAME_MODEL_TURN_TYPE,
                    GameModel.KEY_GAME_MODEL_WOD,
                ],
                [
                    this.gameID,
                    this.isGameInProgress,
                    this.numPlayers,
                    this.difficulty,
                    this.roundsInThisGame,
                    this.currentRound,
                    this.playTurns.map(x => x.map(y => y.map(z => z.toJSON(z.play.wordIndex == TextManager.INVALID_WORD_INDEX, true)))),
                    this.bonusLetterIndex,
                    this.bonusMultiplier,
                    this.pointsSpent || [],
                    this.watchWords,
                    this.jsonWatchWordMasks(),
                    this.watchWordMods,
                    this.playerData,
                    (play != undefined ? play.toJSON(play.wordIndex == TextManager.INVALID_WORD_INDEX, true) : {} ),
                    this.firstRetiredPlayerPosition,
                    type,
                    this.wordOfTheDay || "",
                ]
            )]
        );
	}

	toPlayerData(pickedArray?: number[]): object {
		
		const pa = pickedArray || this.myPickedArray;
        return buildObj(
            [GameModel.KEY_GAME_MODEL_PRIVATE_DATA],
            [
                buildObj(
                    [
                        GameModel.KEY_GAME_MODEL_MY_POSITION,
                        GameModel.KEY_GAME_MODEL_IS_MY_TURN,
                        GameModel.KEY_GAME_MODEL_LETTER_BANK,
                        GameModel.KEY_PRIVATE_DATA_WORD_IN_PROGRESS,
                        GameModel.KEY_PRIVATE_DATA_WORD_IN_PROGRESS_MODS,
                        GameModel.KEY_GAME_MODEL_SPINS ,
                        GameModel.KEY_PRIVATE_DATA_DID_SPIN,
                        GameModel.KEY_GAME_MODEL_NUM_MODS,
                        GameModel.KEY_PRIVATE_DATA_LAST_PLAY,
                        GameModel.KEY_PRIVATE_DATA_PICKED_ARRAY,
                    ],
                    [
                        this.myPosition,
                        this.isMyTurn,
                        this.letterBank!.toJSON(),
                        (this.myWordInProgress || []).map(x => x >= 0 ? x : TextManager.INVALID_WORD_INDEX),
                        this.myWordInProgressMods || [],
                        this.numSpins,
                        this.didSpin,
                        this.numModsJSON(),
                        this.lastPlay != null ? this.lastPlay.toJSON(true, this.lastPlay.wordIndex == TextManager.INVALID_WORD_INDEX) : {},
                        pa,
                    ]
                )
            ]
        );
	}

}
