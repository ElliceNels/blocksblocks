let web3;
import { abi } from "./abi.js";

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);
const contractAddress = "0x7FdCd17404394CCaad8D89EC274fB8a445646cC8";
const contract = new web3.eth.Contract(abi, contractAddress);

async function getBalance(event) {
    event.preventDefault();
    const walletAddress = document.getElementById("wallet-address").value;

    if (walletAddress === "") {
        alert("Please enter a wallet address.");
        return;
    }
    try {
        const balance = await web3.eth.getBalance(walletAddress); // wallet wei balance
        const tokBalance = await contract.methods.balanceOf(walletAddress).call();
        let currencyLabel = "SepETH";

        document.getElementById("detail-heading").innerText = "Wallet Details";
        document.getElementById("wallet-details").innerText = `Balance: ${web3.utils.fromWei(balance, 'ether')} ${currencyLabel}`;
        document.getElementById("hamilton-details").innerText = `HamiltonToken Balance: ${tokBalance} HSP`;
    } catch (error) {
        alert("Error unlocking wallet: " + error.message);
    }
}

async function showWalletDetails(balance, walletAddress, web3) {
    
}

document.getElementById("wallet-form").addEventListener("submit", getBalance);
