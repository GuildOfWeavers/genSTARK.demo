"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const crypto = require("crypto");
const elliptic_1 = require("elliptic");
const genstark_1 = require("@guildofweavers/genstark");
// MODULE VARIABLES
// ================================================================================================
const curve = new elliptic_1.ec('p224');
const field = genstark_1.createPrimeField(BigInt(curve.n.toString()));
// PUBLIC FUNCTIONS
// ================================================================================================
function getGenerator() {
    return pointToArray(curve.g);
}
exports.getGenerator = getGenerator;
function getRandomKeys() {
    const keys = curve.genKeyPair();
    const sk = keys.getPrivate().toString();
    const pk = keys.getPublic();
    return {
        sk: BigInt(sk.toString()),
        pk: pointToArray(pk)
    };
}
exports.getRandomKeys = getRandomKeys;
function sign(m, sk) {
    const keys = curve.keyFromPrivate(bigintToBuffer(sk));
    const pk = keys.getPublic();
    const k = BigInt(`0x${crypto.randomBytes(28).toString('hex')}`);
    const r = curve.g.mul(k.toString(16));
    const h = hashMessage(m, pointToArray(pk), pointToArray(r));
    const s = field.add(field.mul(h, sk), k);
    return { r: pointToArray(r), s };
}
exports.sign = sign;
function verify(m, pk, sig) {
    const lhs = curve.g.mul(sig.s.toString(16));
    const p = curve.keyFromPublic({ x: pk[0].toString(16), y: pk[1].toString(16) }).getPublic();
    const r = curve.keyFromPublic({ x: sig.r[0].toString(16), y: sig.r[1].toString(16) }).getPublic();
    const h = hashMessage(m, pk, sig.r);
    const rhs = p.mul(h.toString(16)).add(r);
    const a1 = pointToArray(lhs);
    const a2 = pointToArray(rhs);
    return a1[0] === a2[0] && a1[1] === a2[1];
}
exports.verify = verify;
function hashMessage(m, p, r) {
    const pBuf = Buffer.from(p[0].toString(16) + p[1].toString(16), 'hex');
    const rBuf = Buffer.from(r[0].toString(16) + r[1].toString(16), 'hex');
    const mBuf = Buffer.from(m);
    const buf = Buffer.concat([pBuf, rBuf, mBuf]);
    const h = crypto.createHash('sha256').update(buf).digest();
    return BigInt(`0x${h.slice(0, 28).toString('hex')}`);
}
exports.hashMessage = hashMessage;
// HELPER FUNCTIONS
// ================================================================================================
function bigintToBuffer(value) {
    return Buffer.from(value.toString(16), 'hex');
}
function pointToArray(point) {
    return [
        BigInt(point.getX().toString()),
        BigInt(point.getY().toString())
    ];
}
function signatureToString(sig) {
    return `r: [${sig.r[0].toString()}, ${sig.r[1].toString()}]\ns: ${sig.s.toString()}`;
}
//# sourceMappingURL=utils.js.map