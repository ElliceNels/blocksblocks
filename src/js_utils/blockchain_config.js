import { abi } from "./abi.js";

const sepoliaProvider = "https://sepolia.infura.io/v3/d78d2c3316144eb1aaf1f3fb0e6d4d3a";
const web3 = new Web3(sepoliaProvider);
const contractAddress = "0x7FdCd17404394CCaad8D89EC274fB8a445646cC8";
const contract = new web3.eth.Contract(abi, contractAddress);

export { web3, sepoliaProvider, contractAddress, contract };
