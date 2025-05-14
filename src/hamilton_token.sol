// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20{

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner) external view returns (uint256);
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    function approve(address _spender, uint256 _value) external returns (bool);
    function allowance(address _owner, address _spender) external view returns (uint256);
    function buyTicket(uint256 _tokens_requested) external payable returns (bool);
    function useTicket(uint256 _tokens_requested) external returns (bool);

    // For logging Transfer and Approval events (Traceability)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract HamiltonToken is IERC20 {
    address public owner; // Address of the contract owner
    uint256 public ticketPrice = 0.005 ether; // Price of a ticket in ether
    uint256 public totalSupply; // Total number of tickets available for my event
    string public name = "Hamilton Screening Party";
    string public symbol = "HSP";
    bool private locked = false;


    // Dictionary of all wallets and their balances
    mapping(address => uint256) public balanceOf;
    // Dictionary of how many of a user's tokens a another user can spend
    mapping(address => mapping(address => uint256)) public allowance;

    function decimals() public pure returns (uint8) {
        // whole numbers only
        return 0;
    }

    modifier noReentrancy() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }


    // Runs once deployed
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        owner = msg.sender;
        balanceOf[owner] = totalSupply; // Give the owner all the tokens
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function buyTicket(uint256 _tokens_requested) public payable noReentrancy returns (bool) {
        // Convert amount of tokens to seth it costs
        uint256 ethCost = _tokens_requested * ticketPrice;
        // Check if they have enough ether to buy the ticket
        require(msg.value >=  ethCost , "Not enough ether to buy the ticket");
        require(balanceOf[owner] >= _tokens_requested, "Not enough tokens available");
        // add tokens to user's balanceOf
        balanceOf[msg.sender] += _tokens_requested;
        // Remove the tokens from the owner's balance
        balanceOf[owner] -= _tokens_requested;
        // Get the excess ether
        uint256 excessETH = msg.value - ethCost;
        // Check if the excess ether is greater than 0
        if (excessETH > 0) {
            // Refund the excess ether
            (bool success, ) = msg.sender.call{value: excessETH}("");
            require(success, "Refund failed");

        }
        // Emit the Transfer event
        emit Transfer(owner, msg.sender, _tokens_requested);
        return true;
    }

    function transfer(address _receiver, uint256 _tok_amount) public returns (bool) {
        require(_receiver != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _tok_amount, "Not enough tokens");
        // Remove the tokens from the sender's account
        balanceOf[msg.sender] -= _tok_amount;
        // Add the tokens to the receiver's account
        balanceOf[_receiver] += _tok_amount;
        emit Transfer(msg.sender, _receiver, _tok_amount);
        return true;
    }

    function transferFrom(address _sender, address _receiver, uint256 _tok_amount) public returns (bool) {
        require(_receiver != address(0), "Invalid address");
        require(balanceOf[_sender] >= _tok_amount, "Not enough tokens");
        require(allowance[_sender][msg.sender] >= _tok_amount, "Not enough allowance");
        // Take the tokens from the sender's account
        balanceOf[_sender] -= _tok_amount;
        allowance[_sender][msg.sender] -= _tok_amount;
        // Add the tokens to the receiver's account
        balanceOf[_receiver] += _tok_amount;
        emit Transfer(_sender, _receiver, _tok_amount);
        return true;
    }

    // Letting another user spend a certain amount of tokens from another user's account
    function approve(address _acc, uint256 _tok_amount) public returns (bool) {
        require(_acc != address(0), "Invalid address");
        allowance[msg.sender][_acc] = _tok_amount;
        emit Approval(msg.sender, _acc, _tok_amount);
        return true;
    }

    function useTicket(uint256 _tokens_requested) public returns (bool) {
        require(balanceOf[msg.sender] >= _tokens_requested, "Not enough tokens to use");
        // Remove the tokens from the user's account
        balanceOf[msg.sender] -= _tokens_requested;
        emit Transfer(msg.sender, address(0), _tokens_requested);
        return true;
    }
}

// msg.sender - whoever is calling the function 
// msg.value - the amount of ether sent with the transaction
// msg.data - the data sent with the transaction (if any)

// https://www.lcx.com/erc-20-token-standard-explained/

// Methods:
// TotalSupply: The total number of tokens that will ever be issued @
// BalanceOf: The account balance of a token owner's account @
// Transfer: Automatically executes transfers of a specified number of tokens to a specified address for transactions using the token
// TransferFrom: Automatically executes transfers of a specified number of tokens from a specified address using the token
// Approve: Allows a spender to withdraw a set number of tokens from a specified account, up to a specific amount
// Allowance: Returns a set number of tokens from a spender to the owner

// Events:
// Transfer: An event triggered when a transfer is successful @
// Approval: A log of an approved event (an event) @

// Optional functions:
// Token's name (optional)
// Its symbol (optional)
// Decimal points to use (optional)