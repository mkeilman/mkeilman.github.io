//
//  common.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-05
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
import { readFile } from "fs";
import { promises as fs_promises } from "fs";

export enum DifficultyLevels {
	easy,
	normal,
	hard,
	expert,
}

export enum ModifierType {
	noSuchModifier = -1,
	poison,
	shield,
	spin,  // not really a mod but helpful to have here
	lightning,
}

export enum TurnType {
	regular,
	newRound,
	gameOver,
	newGame,
	forfeit,
}

// nonsense word indicating that the word played was invalid (pro level only)
const INVALID_WORD_TOKEN: String = "🚫"; 
// nonsense word indicating that the player passed
const PASS_TOKEN = "⇢";
const WATCH_WORD_PLACEHOLDER = "●";

export {INVALID_WORD_TOKEN, PASS_TOKEN, WATCH_WORD_PLACEHOLDER};

const DAYS_TO_RESPOND = 7;
const TIME_TO_PLAY = DAYS_TO_RESPOND * 24 * 60 * 60.0;

export {DAYS_TO_RESPOND, TIME_TO_PLAY}

export async function readText(filename: string, handler: (data: string) => any) {
    const data = await fs_promises.readFile(filename, "utf-8");
    handler(data);
};

export function randomString(length: number=32) {
    const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return new Array(length)
        .fill('')
        .map(x => BASE62[Math.floor(BASE62.length * Math.random())])
        .join('');
}

export function maskStringWithPlaceHolder(s: string, mask: boolean[], p: string): string {
	if (! s) {
        return null;
    }
    if (! mask.length || s.length != mask.length) {
        return s;
    }

    let ms = "";
    let i = 0;
    for (const c of s) {
        ms += (mask[i] ? c : p);
        i += 1;
    }
    
    return ms;
}