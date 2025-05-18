import { web3, contract } from "./blockchain_config.js";
import { abi } from "./abi.js";
import { loadWallet, connectWithMetaMask, showWalletDetails, updateBalanceView } from "./wallet_utils.js";

var walletAddress = "";
var decryptedWallet = null; // Store decrypted wallet for keystore usage

async function useToken() {
    const ticketsUsed = 1;
    try {
        document.getElementById("transfer-status").innerText = "Status: In Progress";
        // Check if MetaMask is being used (walletAddress set by MetaMask, and window.ethereum exists)
        if (window.ethereum && walletAddress && !decryptedWallet) {
            const metaWeb3 = new Web3(window.ethereum);
            const metaContract = new metaWeb3.eth.Contract(abi, contract.options.address);
            // Invoke the useTicket function on the contract
            const tx = await metaContract.methods.useTicket(ticketsUsed).send({
                from: walletAddress,
            });
            alert(`Ticket purchased successfully! Transaction Hash: ${tx.transactionHash}`);
            updateBalanceView(walletAddress, contract);
            document.getElementById("transfer-status").innerText = "Status: Success";
        } else if (decryptedWallet) {
            // Keystore flow: sign and send raw transaction
            const txData = contract.methods.useTicket(ticketsUsed.toString()).encodeABI();
            const txCount = await web3.eth.getTransactionCount(walletAddress);
            const txObject = {
                to: contract.options.address,
                gas: 200000,
                gasPrice: await web3.eth.getGasPrice(),
                nonce: txCount,
                data: txData
            };
            // Sign the transaction with the decrypted wallet's private key
            const signedTx = await web3.eth.accounts.signTransaction(txObject, decryptedWallet.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            alert(`Ticket used successfully! Transaction Hash: ${receipt.transactionHash}`);
            updateBalanceView(walletAddress, contract);
            document.getElementById("transfer-status").innerText = "Status: Success";
        } else {
            alert("Please unlock a wallet or connect MetaMask.");
            document.getElementById("transfer-status").innerText = "Status: Failed";
        }
    } catch (error) {
        alert("Error using ticket: " + error.message);
        document.getElementById("transfer-status").innerText = "Status: Failed";
    }
}
async function returnToken() {
    // Return a ticket by transferring it back to the owner
    // This vendor does not support refunds, so no ether transfer is needed
    const ticketsUsed = 1;
    try {
        document.getElementById("transfer-status").innerText = "Status: In Progress";
        const owner = await contract.methods.owner().call();

        // Check if MetaMask is being used (walletAddress set by MetaMask, and window.ethereum exists)
        if (window.ethereum && walletAddress && !decryptedWallet) {
            const metaWeb3 = new Web3(window.ethereum);
            const metaContract = new metaWeb3.eth.Contract(abi, contract.options.address);
            // Transfer the ticket back to the owner
            const tx = await metaContract.methods.transfer(owner, ticketsUsed).send({
                from: walletAddress,
            });
            alert(`Ticket purchased successfully! Transaction Hash: ${tx.transactionHash}`);
            updateBalanceView(walletAddress, contract);
            document.getElementById("transfer-status").innerText = "Status: Success";

        } else if (decryptedWallet) {
            // Keystore flow: sign and send raw transaction
            const txData = contract.methods.transfer(owner, ticketsUsed.toString()).encodeABI();
            const txCount = await web3.eth.getTransactionCount(walletAddress);
            const txObject = {
                to: contract.options.address,
                gas: 200000,
                gasPrice: await web3.eth.getGasPrice(),
                nonce: txCount,
                data: txData
            };
            const signedTx = await web3.eth.accounts.signTransaction(txObject, decryptedWallet.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            alert(`Ticket used successfully! Transaction Hash: ${receipt.transactionHash}`);
            updateBalanceView(walletAddress, contract);
            document.getElementById("transfer-status").innerText = "Status: Success";

        } else {
            alert("Please unlock a wallet or connect MetaMask.");
            document.getElementById("transfer-status").innerText = "Status: Failed";
        }
    } catch (error) {
        alert("Error using ticket: " + error.message);
        document.getElementById("transfer-status").innerText = "Status: Failed";
    }
}

document.getElementById("wallet-form").addEventListener("submit", (event) =>
    loadWallet(event, web3, (addr) => { walletAddress = addr; }, (wallet) => { decryptedWallet = wallet; }, () => showWalletDetails(walletAddress, contract))
);
document.getElementById("meta-mask-form").addEventListener("submit", (event) =>
    connectWithMetaMask(event, (addr) => { walletAddress = addr; }, () => showWalletDetails(walletAddress, contract))
);
document.getElementById("transfer-button").addEventListener("click", useToken);
document.getElementById("return-button").addEventListener("click", returnToken);
