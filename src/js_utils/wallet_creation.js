let web3;

// connect to the Sepolia testnet
const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
web3 = new Web3(sepoliaProvider);

async function createWallet() {
    const password = document.getElementById("wallet-password").value;
    if (password.length < 0 || password == "") {
        alert("No password provided. Please enter a password.");
        return;
    }
    try {
        const wallet = web3.eth.accounts.create();
        const keystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
        
        document.getElementById("wallet-address").innerText = wallet.address;
        document.getElementById("private-key").innerText = wallet.privateKey;
        document.getElementById("key-store").innerText = JSON.stringify(keystore);
        alert("Wallet created successfully!");
    } catch (error) {
        alert("Error creating wallet: " + error.message);
    }
}

async function saveWallet() {
    const keystore = document.getElementById("key-store").innerText;
    const address = document.getElementById("wallet-address").innerText
    if (keystore == "") {
        alert("Please create a wallet first.");
        return;
    }

    // Keystore to JSON, JSON to Blob
    const blob = new Blob([keystore], { type: "application/json" });
    
    // Blob to URL
    const url = URL.createObjectURL(blob);

    // Create a fake link and auto-download
    const link_element = document.createElement("a");
    link_element.href = url;
    link_element.download = `keystore--${address}.json`;

    // Activate the link (download file)
    link_element.click();

    // Tidy up the stuff
    URL.revokeObjectURL(url);
    link_element.remove();
}

document.getElementById("create-wallet-button").addEventListener("click", createWallet);
document.getElementById("save-keystore-button").addEventListener("click", saveWallet);
