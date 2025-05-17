let web3;
import { abi } from "./abi.js";

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);
const contractAddress = "0x7FdCd17404394CCaad8D89EC274fB8a445646cC8";
const contract = new web3.eth.Contract(abi, contractAddress);

var walletAddress = "";
var decryptedWallet = null; // Store decrypted wallet for keystore usage

async function loadWallet(event) {
    event.preventDefault();
    const password = document.getElementById("wallet-password").value;
    const fileInput = document.getElementById("key-store-input");
    const file = fileInput.files[0];
    const keystore = file ? await file.text() : "";

    if (keystore === "") {
        alert("Please select a keystore file.");
        return;
    }
    try {
        decryptedWallet = web3.eth.accounts.decrypt(JSON.parse(keystore), password);
        walletAddress = decryptedWallet.address; // Get wallet address
        document.getElementById("address-heading").innerText = "Wallet Address";
        document.getElementById("wallet-address").innerText = walletAddress;
        document.getElementById("balance").innerText = `Balance: ${await contract.methods.balanceOf(walletAddress).call()}`;
    } catch (error) {
        alert("Error unlocking wallet: " + error.message);
    }
}

async function connectWithMetaMask(event) {
    event.preventDefault();
    if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
    }
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const metaWeb3 = new Web3(window.ethereum);
        const accounts = await metaWeb3.eth.getAccounts();
        if (accounts.length === 0) {
            alert("No MetaMask accounts found.");
            return;
        }
        walletAddress = accounts[0];
        document.getElementById("address-heading").innerText = "Wallet Address";
        document.getElementById("wallet-address").innerText = walletAddress;
        document.getElementById("balance").innerText = `Balance: ${await contract.methods.balanceOf(walletAddress).call()} ${await contract.methods.symbol().call()}`;
    } catch (error) {
        alert("MetaMask error: " + error.message);
    }
}

async function useToken() {
    const ticketsUsed = 1;
    try {
        document.getElementById("transfer-status").innerText = "Status: In Progress";
        // Check if MetaMask is being used (walletAddress set by MetaMask, and window.ethereum exists)
        if (window.ethereum && walletAddress && !decryptedWallet) {
            const metaWeb3 = new Web3(window.ethereum);
            const metaContract = new metaWeb3.eth.Contract(abi, contractAddress);
            const tx = await metaContract.methods.useTicket(ticketsUsed).send({
                from: walletAddress,
            });
            alert(`Ticket purchased successfully! Transaction Hash: ${tx.transactionHash}`);
            document.getElementById("balance").innerText = `Balance: ${await contract.methods.balanceOf(walletAddress).call()} ${await contract.methods.symbol().call()}`;
            document.getElementById("transfer-status").innerText = "Status: Success";
        } else if (decryptedWallet) {
            // Keystore flow: sign and send raw transaction
            const txData = contract.methods.useTicket(ticketsUsed.toString()).encodeABI();
            const txCount = await web3.eth.getTransactionCount(walletAddress);
            const txObject = {
                to: contractAddress,
                gas: 200000, // You may want to estimate gas
                gasPrice: await web3.eth.getGasPrice(),
                nonce: txCount,
                data: txData
            };
            const signedTx = await web3.eth.accounts.signTransaction(txObject, decryptedWallet.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            alert(`Ticket used successfully! Transaction Hash: ${receipt.transactionHash}`);
            document.getElementById("balance").innerText = `Balance: ${await contract.methods.balanceOf(walletAddress).call()} ${await contract.methods.symbol().call()}`;
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
    const ticketsUsed = 1;
    try {
        document.getElementById("transfer-status").innerText = "Status: In Progress";
        const owner = await contract.methods.owner().call();

        // Check if MetaMask is being used (walletAddress set by MetaMask, and window.ethereum exists)
        if (window.ethereum && walletAddress && !decryptedWallet) {
            const metaWeb3 = new Web3(window.ethereum);
            const metaContract = new metaWeb3.eth.Contract(abi, contractAddress);
            // Transfer the ticket back to the owner
            const tx = await metaContract.methods.transfer(owner, ticketsUsed).send({
                from: walletAddress,
            });
            alert(`Ticket purchased successfully! Transaction Hash: ${tx.transactionHash}\nNew HSP balance: ${await metaContract.methods.balanceOf(walletAddress).call()}`);
            document.getElementById("balance").innerText = `Balance: ${await contract.methods.balanceOf(walletAddress).call()}`;
            document.getElementById("transfer-status").innerText = "Status: Success";

        } else if (decryptedWallet) {
            // Keystore flow: sign and send raw transaction
            const txData = contract.methods.transfer(owner, ticketsUsed.toString()).encodeABI();
            const txCount = await web3.eth.getTransactionCount(walletAddress);
            const txObject = {
                to: contractAddress,
                gas: 200000, // You may want to estimate gas
                gasPrice: await web3.eth.getGasPrice(),
                nonce: txCount,
                data: txData
            };
            const signedTx = await web3.eth.accounts.signTransaction(txObject, decryptedWallet.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            alert(`Ticket used successfully! Transaction Hash: ${receipt.transactionHash}`);
            document.getElementById("balance").innerText = `Balance: ${await contract.methods.balanceOf(walletAddress).call()}`;
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

document.getElementById("wallet-form").addEventListener("submit", loadWallet);
document.getElementById("meta-mask-form").addEventListener("submit", connectWithMetaMask);
document.getElementById("transfer-button").addEventListener("click", useToken);
document.getElementById("return-button").addEventListener("click", returnToken);
