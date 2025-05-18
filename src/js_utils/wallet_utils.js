// Utility functions for wallet operations

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
        const decrypted = web3.eth.accounts.decrypt(JSON.parse(keystore), password);
        setDecryptedWallet(decrypted);
        setWalletAddress(decrypted.address);
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
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const metaWeb3 = new Web3(window.ethereum);
        const accounts = await metaWeb3.eth.getAccounts();
        if (accounts.length === 0) {
            alert("No MetaMask accounts found.");
            return;
        }
        setWalletAddress(accounts[0]);
        showWalletDetails();
    } catch (error) {
        alert("MetaMask error: " + error.message);
    }
}

export async function showWalletDetails(walletAddress, contract) {
    document.getElementById("address-heading").innerText = "Wallet Address";
    document.getElementById("wallet-address").innerText = walletAddress;
    await updateBalanceView(walletAddress, contract);
}

export async function updateBalanceView(address, contract) {
    const balanceElement = document.getElementById("balance");
    if (balanceElement) {
        const newBalance = await contract.methods.balanceOf(address).call();
        balanceElement.innerText = `Balance: ${newBalance} ${await contract.methods.symbol().call()}`;
    }
}
