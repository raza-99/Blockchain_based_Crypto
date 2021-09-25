const EC=require('elliptic').ec;
const cryptoHash=require('./crypto-hash')
const ec=new EC('secp256k1');//EC has handfull of algorithms but bitcoin uses sep256k1 so i am using that one itself
const verifySignature=({publicKey,data,signature})=>{
    const keyFromPublic=ec.keyFromPublic(publicKey,'hex');//temp storing because this verify method is available in the key instance
    return keyFromPublic.verify(cryptoHash(data),signature);
};

module.exports={ec,verifySignature};