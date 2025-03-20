//
//  WordPlay.ts
//  WatchWords
//
//  Models a particular game
//  Created by Michael Keilman on 2025-03-14.
//  Copyright (c) 2025 Michael Keilman. All rights reserved.
//
import { ModifierType, PASS_TOKEN } from "./common";
import { TextManager } from "./TextManager";

let KEY_WORD_PLAY = "WP";
let KEY_WORD_PLAY_PLAY_ID =  KEY_WORD_PLAY + ".pid";
let KEY_WORD_PLAY_PLAY_WORD =  KEY_WORD_PLAY + ".pw";
let KEY_WORD_PLAY_PLAY_WORD_INDEX =  KEY_WORD_PLAY + ".pwi";
let KEY_WORD_PLAY_PLAY_POINTS =  KEY_WORD_PLAY + ".pp";
let KEY_WORD_PLAY_PLAY_MODS =  KEY_WORD_PLAY + ".pmds";

class WordPlay {

    mods: ModifierType[];
    points: number;
    word: string; 
    wordIndex: number;
    
    constructor(word: string, points: number ) {
        this.word = word;
        this.points = points;
    }
    
    toJSON(includeWord: boolean=false, includeMods: boolean=false): object {
        
        let pj: object;
        let wi: number;

        if (this.wordIndex == null) {
            wi = TextManager.INVALID_WORD_INDEX
        }
        else {
            if (this.word == PASS_TOKEN) {
                wi = TextManager.PASS_TOKEN_INDEX;
            }
            else {
                wi = this.wordIndex;
            }
        }

        const pjDict: object = {
            KEY_WORD_PLAY_PLAY_WORD_INDEX : wi,
            KEY_WORD_PLAY_PLAY_POINTS : this.points,
        };
        
        if (includeWord) {
            pjDict[KEY_WORD_PLAY_PLAY_WORD] = this.word;
        }

        if (includeMods && this.mods != null) {
            pjDict[KEY_WORD_PLAY_PLAY_MODS] = this.mods;
        }
        
        return {
            KEY_WORD_PLAY : pjDict,
        };
    }

    unshieldedWord(): string {
        if (! this.mods) {
            return this.word;
        }

        let uw = "";
        let i = 0;
        for (const c of this.word) {
            if (this.mods[i] != ModifierType.shield ) {
                uw += c;
            }
            i += 1
        }
        return uw;
    };

}
