'use strict'
const crypto = require('crypto')

function hash(hashName = "", data = "") {
    const hash = crypto.createHash(hashName);
    hash.update(data);
    return hash.digest('hex');
}

function hmac(hashName = "", data = "", key = "") {
    const mac = crypto.createHmac(hashName, key)
    mac.update(data)
    return mac.digest('hex');
}

function md5(data = "") {
    return hash("md5", data);
}

function sha1(data = "") {
    return hash("sha1", data);
}

function sha256(data = "") {
    return hash("sha256", data);
}

function sha512(data = "") {
    return hash("sha512", data);
}

function md5Hmac(data = "", key = "") {
    return hmac('md5', data, key);
}

function sha1Hmac(data = "", key = "") {
    return hmac('sha1', data, key);
}

function sha256Hmac(data = "", key = "") {
    return hmac('sha256', data, key);
}

function sha512Hmac(data = "", key = "") {
    return hmac('sha512', data, key);
}

function aesEncrypt(data = "", key = "") {
    const cipher = crypto.createCipher('aes192', key)
    let encrypted = cipher.update(data, 'utf-8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted;
}

function aesDecrypt(data = "", key = "") {
    const decipher = crypto.createDecipher('aes192', key)
    let decrypted = decipher.update(data, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted;
}

function rsaEncrypt(data = "", privateKey = "") {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    return sign.sign(privateKey, 'hex');
}

function rsaDecrypt(data = "", publicKey = "") {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    return verify.verify(publicKey, data, 'hex');
}

function base64Encode(data = "") {
    return new Buffer(data, "utf-8").toString("base64")
}

function base64Decode(data = "") {
    return new Buffer(data, "base64").toString("utf-8")
}

module.exports = {
    md5, sha1, sha256, sha512,
    md5Hmac, sha1Hmac, sha256Hmac, sha512Hmac,
    aesEncrypt, aesDecrypt,
    rsaEncrypt, rsaDecrypt,
    base64Encode, base64Decode
}