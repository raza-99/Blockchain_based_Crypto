const PubNub=require('pubnub');
const Blockchain = require('../blockchain/blockchain');
const credentials={
    publishKey:'pub-c-dc53d6d3-65e4-4f66-863a-d4eb706ecfda',
    subscribeKey:'sub-c-e31a41ca-1aac-11ec-9ca7-5693d1c31269',
    secretKey:'sec-c-NjBlYmI2NWEtZTY1MC00NTc1LWFkMDQtMDhlNGE3N2MxNGI0'
};
const CHANNELS={
    TEST:'TEST',
    BLOCKCHAIN:'BLOCKCHAIN',
    TRANSACTION:'TRANSACTION'
};
class PubSub{
    constructor({blockchain,transactionPool,wallet}){
        this.blockchain=blockchain;
        this.wallet=wallet;
        this.transactionPool=transactionPool;
        this.pubnub=new PubNub(credentials);
        this.pubnub.subscribe({channels:Object.values(CHANNELS)});
        this.pubnub.addListener(this.listener())
    }
    listener(){
        return{
            //add listener comes with params oneof them is message
            //and that message has a call back which appears with parameters here it is message objects
            message:(messageObject)=>{
                const{channel,message}=messageObject;
            console.log(`Message receives. Channel: ${channel}.Message:${message}`);
            const parsedMessage=JSON.parse(message);

            switch(channel){
                case CHANNELS.BLOCKCHAIN:
                    this.blockchain.replaceChain(parsedMessage,true,()=>{
                        this.transactionPool.clearBlockchainTransactions({
                            chain:parsedMessage
                        });
                    });

                    break;
                    case CHANNELS.TRANSACTION://we have to verify again this is beacuse of pub nub ,CHANNELS.TRANSACTION case should be updated to only call `setTransaction` if there isn't an existing transaction
                        if (!this.transactionPool.existingTransaction({
                            inputAddress: this.wallet.publicKey
                          })) {
                            this.transactionPool.setTransaction(parsedMessage);
                          }
                        default:
                            return;
            }
          
        }
        };
    }
    publish({channel,message}){
        
        this.pubnub.publish({channel,message});
    }
    broadcastChain(){
        this.publish({
            channel:CHANNELS.BLOCKCHAIN,
            message:JSON.stringify(this.blockchain.chain)
        });
    }
    broadcastTransaction(transaction){
this.publish({
    channel:CHANNELS.TRANSACTION,
    message:JSON.stringify(transaction)
});
    }
}

module.exports=PubSub;