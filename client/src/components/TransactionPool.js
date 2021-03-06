
import React,{Component} from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transation";
import { Link } from "react-router-dom";
import history from'../history';

const POLL_INTERVAL_MS=10000;// for every 10 seconds
class TransactionPool extends Component{
    state={transactionPoolMap:{}};
    fetchTransactionPoolMap=()=>{
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response =>response.json())
        .then(json=>this.setState({transactionPoolMap:json}));
    }


    fetchMineTransactions=()=>{
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response=>{
            if(response.status===200){
                alert('success');
                history.push('/blocks');
            }else{
                alert('The mine-transaction block request did not complete.');
            }
        });
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();
      this.fetchPoolMapInterval=  setInterval(
            ()=>this.fetchTransactionPoolMap(),POLL_INTERVAL_MS //for every 10 seconds u will be able to view transaction pool submitted by your peer
        );
    }

componentWillUnmount(){
    clearInterval(this.fetchPoolMapInterval);
}

    render(){
        return(
<div  className='TransactionPool'>
<div><Link to='/'>Home</Link></div>
<h3>TransactionPool</h3>
{
    Object.values(this.state.transactionPoolMap).map(transaction =>{
        return (
            <div key={transaction.id}>

<hr/>
<Transaction transaction={transaction}/>
            </div>
           
        )
    })
}
<hr/>
<Button 
bsStyle="danger" 
onClick={this.fetchMineTransactions}
>
    Mine the Transactions
    </Button>
</div>

        )
    }
}
export default TransactionPool;