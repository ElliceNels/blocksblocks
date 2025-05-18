import { web3, contract } from "./blockchain_config.js";
import { abi } from "./abi.js";

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

document.getElementById("wallet-form").addEventListener("submit", getBalance);
