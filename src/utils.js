let web3;

// Auto-init if MetaMask is available
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    alert("MetaMask not detected");
}

function createWallet() {
    const wallet = web3.eth.accounts.create();
    const password = document.getElementById("wallet-password").value;
    const keystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
    
    document.getElementById("wallet-address").innerText = wallet.address;
    document.getElementById("private-key").innerText = wallet.privateKey;
    document.getElementById("key-store").innerText = JSON.stringify(keystore);
}

document.getElementById("create-wallet-button").addEventListener("click", createWallet);
