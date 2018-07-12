'use strict'
const wrapper = require('../index')

let data  ="123456"

console.log("md5: "+wrapper.md5(data));
console.log("sha1: "+wrapper.sha1(data));
console.log("sha256: "+wrapper.sha256(data));
console.log("sha512: "+wrapper.sha512(data));


console.log("md5Hmac: "+wrapper.md5Hmac(data, "aaa"));
console.log("sha512Hmac: "+wrapper.sha512Hmac(data, "aaa"));

console.log("aesEncrypt: "+wrapper.aesEncrypt(data, "aaa"));

let enc = '5981d2ab33af04e6fee09e0610334dac'
console.log("aesDecrypt: "+wrapper.aesDecrypt(enc, "aaa"));

console.log("base64Encode: "+wrapper.base64Encode("abcdefg"));
console.log("base64Decode: "+wrapper.base64Decode("YWJjZGVmZw=="));