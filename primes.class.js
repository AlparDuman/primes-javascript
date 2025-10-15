/*
    Copyright (C) 2025 Alpar Duman
    This file is part of primes-javascript.

    primes-javascript is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as
    published by the Free Software Foundation.

    primes-javascript is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with primes-javascript. If not, see
    <https://github.com/AlparDuman/primes-javascript/blob/main/LICENSE>
    else <https://www.gnu.org/licenses/>.
*/

class Primes {

    #smallPrimes;
    #smallPrimesLast;
    #smallPrimesSize;
    #demask;

    constructor() {
        this.#smallPrimes = this.#generateSmallPrimes(Number.MAX_SAFE_INTEGER);
        this.#smallPrimesLast = this.#smallPrimes.at(-1);
        this.#smallPrimesSize = this.#smallPrimes.length;
        this.#demask = { 0x1: 1, 0x2: 7, 0x4: 11, 0x8: 13, 0x10: 17, 0x20: 19, 0x40: 23, 0x80: 29 };
    }

    isPrime(number) {
        if (!Number.isInteger(number) || number < 2)
            return false;
        for (let i = 0; i < this.#smallPrimesSize; i++)
            if (number % this.#smallPrimes[i] == 0)
                return number == this.#smallPrimes[i];
        return true;
    }

    countPrimes(range, start = 0) {
        return this.getPrimes(range, start).length;
    }

    getPrimes(range, start = 0) {
        if (!Number.isInteger(range) || !Number.isInteger(start) || range < 1 || start + range < 2)
            return [];

        if (start < 0) {
            range -= abs(start);
            start = 0;
            if (range < 1)
                return [];
        }

        const field = this.#bucketSieve(range, start);
        const sizeField = field.length;
        const limit = start + range;
        const shift = Math.floor(start / 30);
        const primes = [];
        let i = 0;

        if (start <= 2 && start + range >= 2) primes.push(2);
        if (start <= 3 && start + range >= 3) primes.push(3);
        if (start <= 5 && start + range >= 5) primes.push(5);

        iField: for (; i < sizeField; i++)
            for (const demask in this.#demask)
                if ((field[i] & demask) == 0) {
                    const prime = shift + i * 30 + this.#demask[demask];
                    if (prime <= 5)
                        continue;
                    if (prime > limit)
                        break iField;
                    primes.push(prime);
                }

        return primes;
    }

    test() {

        function isTest(number) {
            if (!Number.isInteger(number) || number < 2 || number != 2 && number % 2 == 0)
                return false;
            const limit = Math.trunc(Math.sqrt(number));
            for (let divisor = 3; divisor <= limit; divisor += 2)
                if (number % divisor == 0)
                    return false;
            return true;
        }

        function countTest(range, start = 0) {
            return getTest(range, start).length;
        }

        function getTest(range, start = 0) {
            if (!Number.isInteger(range) || !Number.isInteger(start) || range < 1 || start + range < 2)
                return [];
            const end = start + range;
            let primes = start <= 2 && end >= 2 ? [2] : [];
            for (let number = start % 2 == 1 ? start : ++start; number <= end; number += 2)
                if (isTest(number))
                    primes.push(number);
            return primes;
        }

        const start = 0;
        const range = 1e5;
        const results = { countPrimes: 0, countTest: 0, isPrime: [], isTest: [], getPrimes: [], getTest: [] };
        console.log('[Primes|Test] Get result of methods from', start, 'to', start + range);

        for (const select in results) {
            const timeStart = performance.now();
            switch (select) {
                case 'isPrime':
                    for (let number = start; number < start + range; number++)
                        if (this.isPrime(number))
                            results[select].push(number);
                    break;
                case 'isTest':
                    for (let number = start; number < start + range; number++)
                        if (isTest(number))
                            results[select].push(number);
                    break;
                case 'countPrimes':
                    results[select] = this.countPrimes(range, start);
                    break;
                case 'countTest':
                    results[select] = countTest(range, start);
                    break;
                case 'getPrimes':
                    results[select] = this.getPrimes(range, start);
                    break;
                case 'getTest':
                    results[select] = getTest(range, start);
                    break;
            }
            const timeEnd = performance.now();

            let messageIntro = `[Primes|Test] ${(`${select}()`).padEnd(13, ' ')}`;
            if (typeof results[select] == 'number')
                console.log(`${messageIntro} count`, results[select], 'primes in', Math.trunc(timeEnd - timeStart), 'ms');
            else
                console.log(`${messageIntro} found`, results[select].length, 'primes', results[select].slice(0, 5), results[select].slice(-5), 'primes in', Math.trunc(timeEnd - timeStart), 'ms');
        }

    }

    #generateSmallPrimes(range) {
        const timeStart = performance.now();

        range = Math.trunc(Math.sqrt(range));
        const field = new Primes.BitArray(range);
        const limit = Math.trunc(Math.sqrt(range));
        let primes = [];
        let number = 7;

        if (range >= 2) primes.push(2);
        if (range >= 3) primes.push(3);
        if (range >= 5) primes.push(5);

        for (; number <= limit; number += 2)
            if (field.get(number)) {
                primes.push(number);
                const step = number * 2;
                for (let multiple = number + step; multiple <= range; multiple += step)
                    field.set(multiple);
            }

        for (; number <= range; number += 2)
            if (field.get(number))
                primes.push(number);

        const defragment = primes.slice();

        const timeEnd = performance.now();
        console.log('[Primes] Prepared', defragment.length, 'small primes in', Math.ceil(timeEnd - timeStart), 'ms');
        return defragment;
    }

    #bucketSieve(range, start = 0) {
        const field = new Primes.BitArray(range);
        const limit = start + range;
        let shift = Math.floor(start / 30);
        let prime, multiplier, multiple, step;

        for (let i = 1; i < this.#smallPrimesSize; i++) {
            prime = this.#smallPrimes[i];
            step = prime * 2;
            multiplier = Math.ceil(start / prime);
            multiple = multiplier > 1 ? prime * multiplier : prime * 3;
            if (multiple > limit)
                break;
            for (; multiple <= limit; multiple += step)
                field.set(multiple - shift);
        }

        return field.getField();
    }

    static BitArray = class {

        #mask;
        #field;
        #reciprocal30;

        constructor(size) {
            if (!Number.isInteger(size) || size < 1)
                throw new Error(`[Primes] Bitarray expects the type of the argument to be Integer, but ${typeof size} was given.`);
            this.#mask = [0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80];
            this.#field = new Uint8Array(Math.trunc(size / 30) + 1);
            this.#reciprocal30 = 1 / 30;
        }

        set(number) {
            const mask = this.#mask[number % 30];
            if (mask != 0) this.#field[Math.trunc(number * this.#reciprocal30)] |= mask;
        }

        get(number) {
            const mask = this.#mask[number % 30];
            return mask != 0 ? ((this.#field[Math.trunc(number * this.#reciprocal30)] & mask) == 0) : false;
        }

        getField() {
            return this.#field;
        }

    }

}

const classPrimes = new Primes();
classPrimes.test();