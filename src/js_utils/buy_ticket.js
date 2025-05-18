import { web3, contract } from "./blockchain_config.js";
import { abi } from "./abi.js";
import { loadWallet, connectWithMetaMask, showWalletDetails, updateBalanceView } from "./wallet_utils.js";

var walletAddress = "";
var decryptedWallet = null; // Store decrypted wallet for keystore usage

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
            updateBalanceView(walletAddress, contract);
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
            updateBalanceView(walletAddress, contract);
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

document.getElementById("wallet-form").addEventListener("submit", (event) =>
    loadWallet(event, web3, (addr) => { walletAddress = addr; }, (wallet) => { decryptedWallet = wallet; }, () => showWalletDetails(walletAddress, contract))
);
document.getElementById("meta-mask-form").addEventListener("submit", (event) =>
    connectWithMetaMask(event, (addr) => { walletAddress = addr; }, () => showWalletDetails(walletAddress, contract))
);
document.getElementById("buy-ticket-button").addEventListener("click", buyTicket);