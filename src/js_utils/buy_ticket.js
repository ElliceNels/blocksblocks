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
        showWalletDetails();
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
        showWalletDetails();
    } catch (error) {
        alert("MetaMask error: " + error.message);
    }
}

async function buyTicket() {
    const ticketsRequested = document.getElementById("quantity").value;
    document.getElementById("transfer-status").innerText = "Status: In Progress";

    try {
        const price = await contract.methods.ticketPrice().call();
        const totalPrice = web3.utils.toBN(price).mul(web3.utils.toBN(ticketsRequested));

        // Check if MetaMask is being used (walletAddress set by MetaMask, and window.ethereum exists)
        if (window.ethereum && walletAddress && !decryptedWallet) {
            const metaWeb3 = new Web3(window.ethereum);
            const metaContract = new metaWeb3.eth.Contract(abi, contractAddress);
            const tx = await metaContract.methods.buyTicket(ticketsRequested.toString()).send({
                from: walletAddress,
                value: totalPrice.toString()
            });
            updateBalanceView();
            document.getElementById("transfer-status").innerText = "Status: Success";
            alert(`Ticket purchased successfully! Transaction Hash: ${tx.transactionHash}`);
        } else if (decryptedWallet) {
            // Keystore flow: sign and send raw transaction
            const txData = contract.methods.buyTicket(ticketsRequested.toString()).encodeABI();
            const txCount = await web3.eth.getTransactionCount(walletAddress);
            const txObject = {
                to: contractAddress,
                value: totalPrice.toString(),
                gas: 200000,
                gasPrice: await web3.eth.getGasPrice(),
                nonce: txCount,
                data: txData
            };
            const signedTx = await web3.eth.accounts.signTransaction(txObject, decryptedWallet.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            updateBalanceView();
            document.getElementById("transfer-status").innerText = "Status: Success";
            alert(`Ticket purchased successfully! Transaction Hash: ${receipt.transactionHash}`);
        } else {
            alert("Please unlock a wallet or connect MetaMask.");
        }
    } catch (error) {
        document.getElementById("transfer-status").innerText = "Status: Failed";
        alert("Error purchasing ticket: " + error.message);
    }
}

async function showWalletDetails() {
    document.getElementById("address-heading").innerText = "Wallet Address";
    document.getElementById("wallet-address").innerText = walletAddress;
    updateBalanceView(walletAddress);
}

async function updateBalanceView() {
    const balanceElement = document.getElementById("balance");
    if (balanceElement && walletAddress) {
        const newBalance = await contract.methods.balanceOf(walletAddress).call()
        balanceElement.innerText = `Balance: ${newBalance} ${await contract.methods.symbol().call()}`;
    }
    
}

document.getElementById("wallet-form").addEventListener("submit", loadWallet);
document.getElementById("meta-mask-form").addEventListener("submit", connectWithMetaMask);
document.getElementById("buy-ticket-button").addEventListener("click", buyTicket);