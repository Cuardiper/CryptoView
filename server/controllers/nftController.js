const { Web3 } = require("web3");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load ABI from file
const abiPath = path.join(__dirname, "..", "abis", "erc721.json");
const ERC721MetadataABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Create a MongoDB schema for NFT metadata
const NFTMetadataSchema = new mongoose.Schema({
  contractAddress: String,
  tokenId: String,
  name: String,
  description: String,
  imageUrl: String,
});

const NFTMetadata = mongoose.model("NFTMetadata", NFTMetadataSchema);

const fetchAndStoreNFTMetadata = async (req, res) => {
  const { contractAddress, tokenId } = req.params;

  try {
    // Create a Web3 instance
    const web3 = new Web3(process.env.ETHEREUM_NODE_URL);

    // Check if metadata already exists in the database
    //let metadata = await NFTMetadata.findOne({ contractAddress, tokenId });
    let metadata = false;

    if (!metadata) {
      // If not in database, fetch from blockchain
      const contract = new web3.eth.Contract(
        ERC721MetadataABI,
        contractAddress
      );
      const tokenURI = await contract.methods.tokenURI(tokenId).call();

      console.log("uri", tokenURI);

      // Fetch metadata from tokenURI
      const response = await fetch(tokenURI);
      const { name, description, image } = await response.json();

      // Store in database
      metadata = new NFTMetadata({
        contractAddress,
        tokenId,
        name,
        description,
        imageUrl: image,
      });
      await metadata.save();
    }

    res.json(metadata);
  } catch (error) {
    console.error("Error fetching and storing NFT metadata:", error);
    res.status(500).json({ error: "Failed to fetch and store NFT metadata" });
  }
};

module.exports = { fetchAndStoreNFTMetadata };
