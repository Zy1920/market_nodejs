## lxj-crypto
A simple wrapper for node crypto module, zero dependency, very easy to use!


## methods
- md5
- sha1
- sha256
- sha512
- md5Hmac
- sha1Hmac
- sha256Hmac
- sha512Hmac
- aesEncypt
- aesDecypt
- rsaEncypt
- rsaDecypt
- base64Encode
- base64Decode


## how to use
first, install.
```bash
npm i crypto-wrapper -S
```

then, like this:
```
const crypto = require('crypto-wrapper');
crypto.md5("xx");

crypto.aesEncypt("data", "key");
```