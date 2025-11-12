import { expect, test } from 'vitest';
import {randomExchanges} from '../src/js/index.js';

test('randomExchanges', () => {
    const e = randomExchanges(['A', 'B', 'C', 'D']);
});

