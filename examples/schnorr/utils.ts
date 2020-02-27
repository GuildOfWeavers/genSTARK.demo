// IMPORTS
// ================================================================================================
import * as crypto from 'crypto';
import { ec as Curve } from 'elliptic';
import { createPrimeField } from '@guildofweavers/genstark';

// INTERFACES
// ================================================================================================
export interface Signature {
    readonly r  : [bigint, bigint];
    readonly s  : bigint;
}

// MODULE VARIABLES
// ================================================================================================
const curve = new Curve('p224');
const field = createPrimeField(BigInt(curve.n!.toString()));

// PUBLIC FUNCTIONS
// ================================================================================================
export function getGenerator() {
    return pointToArray(curve.g);
}

export function getRandomKeys() {
    const keys = curve.genKeyPair();
    const sk = keys.getPrivate().toString();
    const pk = keys.getPublic();
    return {
        sk  : BigInt(sk.toString()),
        pk  : pointToArray(pk)
    };
}

export function sign(m: string, sk: bigint): Signature {
    const keys = curve.keyFromPrivate(bigintToBuffer(sk));
    const pk = keys.getPublic();

    const k = BigInt(`0x${crypto.randomBytes(28).toString('hex')}`);
    const r = curve.g.mul(k.toString(16));
    const h = hashMessage(m, pointToArray(pk), pointToArray(r));
    const s = field.add(field.mul(h, sk), k);

    return { r: pointToArray(r), s };
}

export function verify(m: string, pk: [bigint, bigint], sig: Signature): boolean {
    const lhs = curve.g.mul(sig.s.toString(16));

    const p = curve.keyFromPublic({ x: pk[0].toString(16), y: pk[1].toString(16) }).getPublic();
    const r = curve.keyFromPublic({ x: sig.r[0].toString(16), y: sig.r[1].toString(16) }).getPublic();
    const h = hashMessage(m, pk, sig.r);
    const rhs = p.mul(h.toString(16) as any).add(r);

    const a1 = pointToArray(lhs);
    const a2 = pointToArray(rhs);

    return a1[0] === a2[0] && a1[1] === a2[1];
}

export function hashMessage(m: string, p: [bigint, bigint], r: [bigint, bigint]): bigint {
    const pBuf = Buffer.from(p[0].toString(16) + p[1].toString(16), 'hex');
    const rBuf = Buffer.from(r[0].toString(16) + r[1].toString(16), 'hex');
    const mBuf = Buffer.from(m);
    const buf = Buffer.concat([pBuf, rBuf, mBuf]);
    const h = crypto.createHash('sha256').update(buf).digest();
    return BigInt(`0x${h.slice(0, 28).toString('hex')}`);
}

// HELPER FUNCTIONS
// ================================================================================================
function bigintToBuffer(value: bigint): Buffer {
    return Buffer.from(value.toString(16), 'hex');
}

function pointToArray(point: any): [bigint, bigint] {
    return [
        BigInt(point.getX().toString()),
        BigInt(point.getY().toString())
    ];
}

function signatureToString(sig: Signature): string {
    return `r: [${sig.r[0].toString()}, ${sig.r[1].toString()}]\ns: ${sig.s.toString()}`;
}