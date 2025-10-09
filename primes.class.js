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

    constructor() { }

    isPrime(number) { }

    countPrimes(range, start = 0) { }

    getPrimes(range, start = 0) { }

    selfTest() { }

    #generateSmallPrimes(range) { }

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