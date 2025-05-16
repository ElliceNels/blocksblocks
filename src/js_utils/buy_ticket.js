let web3;

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);
var walletAddress = "";

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
        const decryptedWallet = web3.eth.accounts.decrypt(JSON.parse(keystore), password);
        walletAddress = decryptedWallet.address; // Get wallet address
        document.getElementById("address-heading").innerText = "Wallet Address";
        document.getElementById("wallet-address").innerText = walletAddress;
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
    } catch (error) {
        alert("MetaMask error: " + error.message);
    }
}


async function buyTicket() {
    const ticketsRequested = document.getElementById("quantity").value
}

document.getElementById("wallet-form").addEventListener("submit", loadWallet);
document.getElementById("meta-mask-form").addEventListener("submit", connectWithMetaMask);
document.getElementById("buy-ticket-button").addEventListener("click", buyTicket);