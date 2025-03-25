//
//  WordPlay.ts
//  WatchWords
//
//  Models a particular game
//  Created by Michael Keilman on 2025-03-14.
//  Copyright (c) 2025 Michael Keilman. All rights reserved.
//
import { ModifierType } from "./common.js";
export class WordPlay {
    static fromJSON(json) {
        const p = json[WordPlay.KEY_WORD_PLAY];
        return new WordPlay(p[WordPlay.KEY_WORD_PLAY_PLAY_WORD], p[WordPlay.KEY_WORD_PLAY_PLAY_POINTS], p[WordPlay.KEY_WORD_PLAY_PLAY_WORD_INDEX]);
    }
    constructor(word, points, wordIndex) {
        this.points = points;
        this.word = word;
        this.wordIndex = wordIndex;
    }
    toJSON(includeWord = false, includeMods = false) {
        const json = {
            KEY_WORD_PLAY_PLAY_WORD_INDEX: this.wordIndex,
            KEY_WORD_PLAY_PLAY_POINTS: this.points,
        };
        if (includeWord) {
            json[WordPlay.KEY_WORD_PLAY_PLAY_WORD] = this.word;
        }
        if (includeMods && this.mods != null) {
            json[WordPlay.KEY_WORD_PLAY_PLAY_MODS] = this.mods;
        }
        return {
            KEY_WORD_PLAY: json,
        };
    }
    unshieldedWord() {
        if (!this.mods) {
            return this.word;
        }
        let uw = "";
        let i = 0;
        for (const c of this.word) {
            if (this.mods[i] != ModifierType.shield) {
                uw += c;
            }
            i += 1;
        }
        return uw;
    }
    ;
}
WordPlay.KEY_WORD_PLAY = "WP";
WordPlay.KEY_WORD_PLAY_PLAY_ID = WordPlay.KEY_WORD_PLAY + ".pid";
WordPlay.KEY_WORD_PLAY_PLAY_WORD = WordPlay.KEY_WORD_PLAY + ".pw";
WordPlay.KEY_WORD_PLAY_PLAY_WORD_INDEX = WordPlay.KEY_WORD_PLAY + ".pwi";
WordPlay.KEY_WORD_PLAY_PLAY_POINTS = WordPlay.KEY_WORD_PLAY + ".pp";
WordPlay.KEY_WORD_PLAY_PLAY_MODS = WordPlay.KEY_WORD_PLAY + ".pmds";
