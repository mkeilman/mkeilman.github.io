var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { promises as fs_promises } from "fs";
export var DifficultyLevels;
(function (DifficultyLevels) {
    DifficultyLevels[DifficultyLevels["easy"] = 0] = "easy";
    DifficultyLevels[DifficultyLevels["normal"] = 1] = "normal";
    DifficultyLevels[DifficultyLevels["hard"] = 2] = "hard";
    DifficultyLevels[DifficultyLevels["expert"] = 3] = "expert";
})(DifficultyLevels || (DifficultyLevels = {}));
export var ModifierType;
(function (ModifierType) {
    ModifierType[ModifierType["noSuchModifier"] = -1] = "noSuchModifier";
    ModifierType[ModifierType["poison"] = 0] = "poison";
    ModifierType[ModifierType["shield"] = 1] = "shield";
    ModifierType[ModifierType["spin"] = 2] = "spin";
    ModifierType[ModifierType["lightning"] = 3] = "lightning";
})(ModifierType || (ModifierType = {}));
export var TurnType;
(function (TurnType) {
    TurnType[TurnType["regular"] = 0] = "regular";
    TurnType[TurnType["newRound"] = 1] = "newRound";
    TurnType[TurnType["gameOver"] = 2] = "gameOver";
    TurnType[TurnType["newGame"] = 3] = "newGame";
    TurnType[TurnType["forfeit"] = 4] = "forfeit";
})(TurnType || (TurnType = {}));
// nonsense word indicating that the word played was invalid (pro level only)
const INVALID_WORD_TOKEN = "🚫";
// nonsense word indicating that the player passed
const PASS_TOKEN = "⇢";
const WATCH_WORD_PLACEHOLDER = "●";
export { INVALID_WORD_TOKEN, PASS_TOKEN, WATCH_WORD_PLACEHOLDER };
const DAYS_TO_RESPOND = 7;
const TIME_TO_PLAY = DAYS_TO_RESPOND * 24 * 60 * 60.0;
export { DAYS_TO_RESPOND, TIME_TO_PLAY };
export function readText(filename, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fs_promises.readFile(filename, "utf-8");
        handler(data);
    });
}
;
export function randomString(length = 32) {
    const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return new Array(length)
        .fill('')
        .map(x => BASE62[Math.floor(BASE62.length * Math.random())])
        .join('');
}
export function maskStringWithPlaceHolder(s, mask, p) {
    if (!s) {
        return null;
    }
    if (!mask.length || s.length != mask.length) {
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
