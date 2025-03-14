//
//  common.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-05
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
export var ModifierType;
(function (ModifierType) {
    ModifierType[ModifierType["noSuchModifier"] = -1] = "noSuchModifier";
    ModifierType[ModifierType["poison"] = 0] = "poison";
    ModifierType[ModifierType["shield"] = 1] = "shield";
    ModifierType[ModifierType["spin"] = 2] = "spin";
    ModifierType[ModifierType["lightning"] = 3] = "lightning";
})(ModifierType || (ModifierType = {}));
