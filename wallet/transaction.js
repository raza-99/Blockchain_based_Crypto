const uuid=require('uuid/v1');
const {verifySignature}=require('../util');
const {REWARD_INPUT,MINING_REWARD}=require('../config');
class Transaction{
    constructor({senderWallet,recipient,amount,outputMap,input}){
        this.id=uuid();
this.outputMap=outputMap||this.createOutMap({senderWallet,recipient,amount})//when miners get reward in order to do transaction we  do not have to provide  them our signature or our output map right?? ie we have to hard code the input and output map if it is a reward , so  the idea is in constructor we pass the input and outputmap if it is defined then go with it else create signature all those
this.input=input||this.createInput({senderWallet,outputMap:this.outputMap});    
}
createOutMap({senderWallet,recipient,amount}){
    const outputMap={};
    outputMap[recipient]=amount;
    outputMap[senderWallet.publicKey]=senderWallet.balance-amount;
    return outputMap;
}
createInput({senderWallet,outputMap}){
    return{
        timestamp:Date.now(),
        amount:senderWallet.balance,
        address:senderWallet.publicKey,
        signature:senderWallet.sign(outputMap)
    };
}


update ({senderWallet,recipient,amount}){

if(amount>this.outputMap[senderWallet.publicKey]){
    throw new Error('Amount exceeds balance');
}
if(!this.outputMap[recipient]){
this.outputMap[recipient]=amount;//if u are sending to diffrenet person {within same transaction}
}else{
this.outputMap[recipient]=this.outputMap[recipient]+amount;//if same person and sending extra money then just adding the amout

}

    
    this.outputMap[senderWallet.publicKey]=
    this.outputMap[senderWallet.publicKey]-amount;
    this.input=this.createInput({senderWallet,outputMap:this.outputMap});//when u call input though the values are changed int the object according to javascripts it will not check the values rather it goes for data fields if they are same it wil consider the same value
    //so which means it will generate same digital sig nature
    // one of the patch is before hashing ,first map through all the objects and convert it into JSON string then sort and join and then hash
    //through this we will get an entirely diffrent has
    //which helps to create a new digital signature
}


static validTransaction(transaction){
    const{input:{address,amount,signature},outputMap}=transaction;//amount is reffred as balance since it is input field
    const outputTotal=Object.values(outputMap).reduce((total,outputAmount)=>total+outputAmount);
    if(amount!==outputTotal){
        console.error(`Invalid Transaction from ${address}`);
        return false;
    }
    if(!verifySignature({publicKey:address,data:outputMap,signature})){
        console.error(`Invalid siagnature from ${address}`);
        return false;
    }
    return true;
}
static rewardTransaction({minerWallet}){
return new this({
input:REWARD_INPUT,
outputMap:{[minerWallet.publicKey]:MINING_REWARD}

});


}
}
module.exports=Transaction;