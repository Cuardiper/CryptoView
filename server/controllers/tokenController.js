const { Web3 } = require("web3");
const BigNumber = require("bignumber.js");
const fs = require("fs");
const path = require("path");

// Load ABI from file
const abiPath = path.join(__dirname, "..", "abis", "tokenABI.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const getTokenBalance = async (req, res) => {
  const { tokenAddress, walletAddress } = req.params;

  try {
    // Initialize Web3
    const web3 = new Web3(process.env.ETHEREUM_NODE_URL);

    // Create contract instance
    const contract = new web3.eth.Contract(ABI, tokenAddress);

    // Call balanceOf function
    const balance = await contract.methods.balanceOf(walletAddress).call();

    // Get token decimals
    const decimals = await contract.methods.decimals().call();

    // Convert balance to a more readable format
    const adjustedBalance = new BigNumber(balance).dividedBy(
      new BigNumber(10).pow(decimals)
    );

    res.json({
      tokenAddress,
      walletAddress,
      balance: adjustedBalance.toString(),
    });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    res.status(500).json({ error: "Failed to fetch token balance" });
  }
};

module.exports = { getTokenBalance };
