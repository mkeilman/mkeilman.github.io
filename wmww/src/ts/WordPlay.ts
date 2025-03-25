//
//  WordPlay.ts
//  WatchWords
//
//  Models a particular game
//  Created by Michael Keilman on 2025-03-14.
//  Copyright (c) 2025 Michael Keilman. All rights reserved.
//
import { ModifierType, PASS_TOKEN } from "./common.js";

export class WordPlay {

    mods: ModifierType[];
    points: number;
    word: string; 
    wordIndex: number;
    
    static KEY_WORD_PLAY = "WP";
    static KEY_WORD_PLAY_PLAY_ID =  WordPlay.KEY_WORD_PLAY + ".pid";
    static KEY_WORD_PLAY_PLAY_WORD =  WordPlay.KEY_WORD_PLAY + ".pw";
    static KEY_WORD_PLAY_PLAY_WORD_INDEX =  WordPlay.KEY_WORD_PLAY + ".pwi";
    static KEY_WORD_PLAY_PLAY_POINTS =  WordPlay.KEY_WORD_PLAY + ".pp";
    static KEY_WORD_PLAY_PLAY_MODS =  WordPlay.KEY_WORD_PLAY + ".pmds";

    static fromJSON(json: object): WordPlay {
        const p:object = json[WordPlay.KEY_WORD_PLAY];
        return new WordPlay(
            p[WordPlay.KEY_WORD_PLAY_PLAY_WORD],
            p[WordPlay.KEY_WORD_PLAY_PLAY_POINTS],
            p[WordPlay.KEY_WORD_PLAY_PLAY_WORD_INDEX]
        );
    }

    constructor(word: string, points: number, wordIndex: number) {
        this.points = points;
        this.word = word;
        this.wordIndex = wordIndex;
    }
    
    toJSON(includeWord: boolean=false, includeMods: boolean=false): object {
        
        const json: object = {
            KEY_WORD_PLAY_PLAY_WORD_INDEX : this.wordIndex,
            KEY_WORD_PLAY_PLAY_POINTS : this.points,
        };
        
        if (includeWord) {
            json[WordPlay.KEY_WORD_PLAY_PLAY_WORD] = this.word;
        }

        if (includeMods && this.mods != null) {
            json[WordPlay.KEY_WORD_PLAY_PLAY_MODS] = this.mods;
        }
        
        return {
            KEY_WORD_PLAY : json,
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
