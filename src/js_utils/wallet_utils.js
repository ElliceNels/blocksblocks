// Utility functions for wallet operations

// Load a wallet from a keystore file
export async function loadWallet(event, web3, setWalletAddress, setDecryptedWallet, showWalletDetails) {
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
        // Decrypt the keystore with the provided password
        const decrypted = web3.eth.accounts.decrypt(JSON.parse(keystore), password);
        // Set the wallet address and decrypted wallet
        setDecryptedWallet(decrypted);
        setWalletAddress(decrypted.address);
        // Show the wallet details
        showWalletDetails();
    } catch (error) {
        alert("Error unlocking wallet: " + error.message);
    }
}

export async function connectWithMetaMask(event, setWalletAddress, showWalletDetails) {
    event.preventDefault();
    if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
    }
    try {
        // Request account access from MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const metaWeb3 = new Web3(window.ethereum);
        const accounts = await metaWeb3.eth.getAccounts();
        if (accounts.length === 0) {
            alert("No MetaMask accounts found.");
            return;
        }
        // Get the current (first) account
        setWalletAddress(accounts[0]);
        showWalletDetails();
    } catch (error) {
        alert("MetaMask error: " + error.message);
    }
}

export async function showWalletDetails(walletAddress, contract) {
    // Update UI elements
    document.getElementById("address-heading").innerText = "Wallet Address";
    document.getElementById("wallet-address").innerText = walletAddress;
    await updateBalanceView(walletAddress, contract);
}

export async function updateBalanceView(address, contract) {
    // Update the balance view
    const balanceElement = document.getElementById("balance");
    if (balanceElement) {
        const newBalance = await contract.methods.balanceOf(address).call();
        balanceElement.innerText = `Balance: ${newBalance} ${await contract.methods.symbol().call()}`;
    }
}
