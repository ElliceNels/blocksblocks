let web3;

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);

async function unlockWallet(event) {
    event.preventDefault();
    const password = document.getElementById("wallet-password").value;
    const keystore = document.getElementById("key-store-input").value;
    if (keystore == "") {
        alert("Please create a wallet first.");
        return;
    }
    try {
        const decryptedWallet = web3.eth.accounts.decrypt(JSON.parse(keystore), password);
        const walletAddress = decryptedWallet.address; // Get wallet address
        const balance = await web3.eth.getBalance(walletAddress); // wallet wei balance

        // Display wallet address and balance in Sepolia ETH
        document.getElementById("wallet-details").innerText = `Address: ${walletAddress}\n\nBalance: ${web3.utils.fromWei(balance, 'ether')} SepETH`;
        document.getElementById("hamilton-details").innerText = `HamiltonToken Balance: ${10} HTK`;
    } catch (error) {
        alert("Error unlocking wallet: " + error.message);
    }
}

document.getElementById("wallet-form").addEventListener("submit", unlockWallet);
