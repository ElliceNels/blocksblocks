let web3;

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);

async function unlockWithKeystore(event) {
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
        const walletAddress = decryptedWallet.address; // Get wallet address
        const balance = await web3.eth.getBalance(walletAddress); // wallet wei balance

        // Display wallet address and balance in Sepolia ETH
        await showWalletDetails(balance, walletAddress, web3);
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
        const walletAddress = accounts[0];
        const balance = await metaWeb3.eth.getBalance(walletAddress);
        
        await showWalletDetails(balance, walletAddress, metaWeb3);
    } catch (error) {
        alert("MetaMask error: " + error.message);
    }
}

async function showWalletDetails(balance, walletAddress, web3) {
    let currencyLabel = "SepETH";

    document.getElementById("detail-heading").innerText = "Wallet Details";
    document.getElementById("wallet-details").innerText = `Address: ${walletAddress}\n\nBalance: ${web3.utils.fromWei(balance, 'ether')} ${currencyLabel}`;
    document.getElementById("hamilton-details").innerText = `HamiltonToken Balance: ${10} HSP`;
}

document.getElementById("wallet-form").addEventListener("submit", unlockWithKeystore);
document.getElementById("meta-mask-form").addEventListener("submit", connectWithMetaMask);
