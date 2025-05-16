let web3;

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);

async function getBalance(event) {
    event.preventDefault();
    const walletAddress = document.getElementById("wallet-address").value;

    if (walletAddress === "") {
        alert("Please enter a wallet address.");
        return;
    }
    try {
        const balance = await web3.eth.getBalance(walletAddress); // wallet wei balance
        let currencyLabel = "SepETH";

        document.getElementById("detail-heading").innerText = "Wallet Details";
        document.getElementById("wallet-details").innerText = `Balance: ${web3.utils.fromWei(balance, 'ether')} ${currencyLabel}`;
        document.getElementById("hamilton-details").innerText = `HamiltonToken Balance: ${10} HSP`;
    } catch (error) {
        alert("Error unlocking wallet: " + error.message);
    }
}

async function showWalletDetails(balance, walletAddress, web3) {
    
}

document.getElementById("wallet-form").addEventListener("submit", getBalance);
