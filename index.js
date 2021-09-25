const bodyParser=require('body-parser');
const express =require('express');
const request=require('request');
const Blockchain=require('./blockchain/blockchain');
const PubSub=require('./app/pubsub');
const path=require('path');
const TransactionPool=require('./wallet/transaction-pool');
const Wallet=require('./wallet');
const TransactionMiner=require('./app/transaction-miner');
const isDevelopment=process.env.ENV==='development';
const app=express();
const blockchain=new Blockchain();
const transactionPool=new TransactionPool();
const wallet=new Wallet();
const pubsub=new PubSub({blockchain,transactionPool,wallet});
const transactionMiner=new TransactionMiner({blockchain,transactionPool,wallet,pubsub});

const DEFAULT_PORT=3000;
const ROOT_NODE_ADDRESS=`http://localhost:${DEFAULT_PORT}`;


setTimeout(()=>pubsub.broadcastChain(),1000);//with a delay of 1 sec
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'client/dist')));
app.get('/api/blocks',(req,res)=>{

    res.json(blockchain.chain);
});


app.post('/api/mine',(req,res)=>{
const {data}=req.body;
blockchain.addBlock({data});
pubsub.broadcastChain();
res.redirect('/api/blocks');

});
 



app.post('/api/transact',(req,res)=>{
const {amount,recipient}=req.body;

let transaction=transactionPool.existingTransaction({inputAddress:wallet.publicKey});
try{
if(transaction)
transaction.update({senderWallet:wallet,recipient,amount});
else
 transaction=wallet.createTransaction({
     recipient,
    amount,
    chain:blockchain.chain
});


}catch(error){
    return res.json({type:'error',message:error.message});//400 meansa bad bad request
}
transactionPool.setTransaction(transaction);
pubsub.broadcastTransaction(transaction);

res.json({type:'success',transaction});
});

app.get('/api/transaction-pool-map',(req,res)=>{
res.json(transactionPool.TransactionMap);
});

app.get('/api/mine-transactions',(req,res)=>{
   transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});
app.get('/api/wallet-info',(req,res)=>{
    const address=wallet.publicKey;
    res.json({
        address:wallet.publicKey,
        balance:Wallet.calculateBalance({chain:blockchain.chain,address})
    });
});

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'client/dist/index.html'));
});//  *  means it serves the request at any endpoint  that we have prevoiusly defined
const syncWithRootState=()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
        if(!error&&response.statusCode===200){
            const rootChain=JSON.parse(body);
            console.log('replace chain on a sync with ',rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},(error,response,body)=>{
        if(!error&&response.statusCode===200){
            const rootTransactionPoolMap=JSON.parse(body);
            console.log('replace Transaction pool Map on a sync with ',rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });

}
// jsut putting some  dummy  transactions
if(isDevelopment){
const walletFoo=new Wallet();
const walletBar=new Wallet();
const generateWalletTransaction=({wallet,recipient,amount})=>{
const transaction=wallet.createTransaction({
    recipient,amount,chain:blockchain.chain
});

transactionPool.setTransaction(transaction);
}

const walletAction=()=>generateWalletTransaction({
    wallet,recipient:walletFoo.publicKey,amount:5
});

const walletFooAction=()=>generateWalletTransaction({
    wallet:walletFoo,recipient:walletBar.publicKey,amount:15
});
const walletBarAction=()=>generateWalletTransaction({
    wallet:walletBar,recipient:wallet.publicKey,amount:15
});

for(let i=0;i<10;i++){
    if(i%3===0){
        walletAction();
        walletFooAction();
    }else if(i%3===1){
walletAction();
walletBarAction();
    }else{
        walletFooAction();
        walletBarAction();
    }
    transactionMiner.mineTransactions();
}
}


let PEER_PORT;
if(process.env.GENERATE_PEER_PORT==='true'){
    PEER_PORT=DEFAULT_PORT+Math.ceil(Math.random()*1000);
}
const PORT=process.env.PORT||PEER_PORT||DEFAULT_PORT;//if peer, port is set then take that else take default port

app.listen(PORT,()=>{
    console.log(`listening at localhost $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$:${PORT}`);

    syncWithRootState();
});
