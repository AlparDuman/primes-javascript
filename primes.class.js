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

    constructor() {
        this.#smallPrimes = this.#generateSmallPrimes(Number.MAX_SAFE_INTEGER);
        this.#smallPrimesLast = this.#smallPrimes.at(-1);
    }

    isPrime(number) { }

    countPrimes(range, start = 0) { }

    getPrimes(range, start = 0) { }

    selfTest() { }

    #generateSmallPrimes(range) {
        const timeStart = performance.now();

        range = Math.floor(Math.sqrt(range));
        const field = new Primes.BitArray(range);
        const limit = Math.floor(Math.sqrt(range));
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

        const timeEnd = performance.now();
        console.log(`Prepared ${primes.length} small primes in ${Math.ceil(timeEnd - timeStart)}ms`);
        return primes;
    }

    static BitArray = class {

        #mask;
        #field;

        constructor(size) {
            if (!Number.isInteger(size) || size < 1)
                throw new Error(`Bitarray expects the type of the argument to be Integer, but ${typeof size} was given.`);
            this.#mask = [0, 0x1, 0, 0, 0, 0, 0, 0x2, 0, 0, 0, 0x4, 0, 0x8, 0, 0, 0, 0x10, 0, 0x20, 0, 0, 0, 0x40, 0, 0, 0, 0, 0, 0x80];
            this.#field = new Uint8Array(Math.floor(size / 30) + 1);
            this.size = size;
        }

        set(number) {
            const mask = this.#mask[number % 30];
            if (mask != 0)
                this.#field[Math.floor(number / 30)] |= mask;
        }

        get(number) {
            const mask = this.#mask[number % 30];
            if (mask != 0)
                return (this.#field[Math.floor(number / 30)] & mask) == 0
            return false;
        }

    }

}