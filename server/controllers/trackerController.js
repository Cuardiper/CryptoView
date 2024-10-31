const axios = require("axios");
const Tracker = require("../models/trackerModel");

const ETHERSCAN_API_URL = "https://api-sepolia.basescan.org/api";

const fetchAndStoreTransactions = async (req, res) => {
  const { address } = req.params;

  try {
    // Fetch transactions from Etherscan
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 5,
        sort: "desc",
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status !== "1") {
      throw new Error("Failed to fetch transactions from Etherscan");
    }

    const transactions = response.data.result;

    // Store transactions in MongoDB
    for (let tx of transactions) {
      console.log("Storing transaction: ", tx);
      await Tracker.findOneAndUpdate(
        { hash: tx.hash },
        {
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          hash: tx.hash,
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      message: "Transactions fetched and stored successfully",
      count: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching and storing transactions:", error);
    res.status(500).json({ error: "Failed to fetch and store transactions" });
  }
};

const queryTransactions = async (req, res) => {
  const { address, startDate, endDate } = req.query;

  try {
    let query = { $or: [{ from: address }, { to: address }] };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Error querying transactions:", error);
    res.status(500).json({ error: "Failed to query transactions" });
  }
};

module.exports = { fetchAndStoreTransactions, queryTransactions };
