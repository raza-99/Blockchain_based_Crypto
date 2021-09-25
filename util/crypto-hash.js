const crypto=require('crypto');
const cryptoHash=(...inputs)=>{
    const hash=crypto.createHash('sha256');
    hash.update(inputs.map(input=>JSON.stringify(input)).sort().join(''));//maping every values of javascript and the stringify in jason format followed by hash
    return hash.digest('hex');
};
module.exports=cryptoHash;