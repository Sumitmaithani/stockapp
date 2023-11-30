const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");

// connect to express app
const app = express();

dotenv.config();

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.listen(3001, () => {
  console.log("Server connected to port 3001");
});

// middleware
app.use(bodyParser.json());
app.use(cors());

const fs = require("fs");
const path = require("path");

// Function to fetch previous close of a stock
const fetchPreviousClose = async (ticker) => {
  try {
    const apiKey = process.env.POLY_API_KEY;
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`
    );
    return response.data?.results[0]?.c; // Assuming 'c' represents the close price
  } catch (error) {
    console.error(`Error fetching previous close for ${ticker}:`, error);
    return null;
  }
};

app.get("/stocks", async (req, res) => {
  try {
    const apiKey = process.env.POLY_API_KEY;
    const n = req.query.n; // Get the value of 'n' from the query parameters
    const response = await axios.get(
      `https://api.polygon.io/v3/reference/tickers?active=true&limit=${n}&sort=ticker&apiKey=${apiKey}`
    );

    // Extract only the necessary data to avoid circular references
    const responseData = response.data.results.map(async (result) => {
      const ticker = result.ticker;
      const name = result.name;
      const currency = result.currency_name;

      // Fetch previous close for each stock
      const previousClose = await fetchPreviousClose(ticker);

      // Fetch company details for each stock
      const companyDetailsResponse = await axios.get(
        `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`
      );
      const companyDetails = companyDetailsResponse.data;
      const logoUrl =
        companyDetails.results?.branding?.icon_url ||
        companyDetails.results?.branding?.logo_url;

      return {
        ticker,
        name,
        currency,
        previousClose,
        logoUrl,
        refreshInterval: Math.floor(Math.random() * 5) + 1, // Generate random refresh interval between 1 and 5 seconds
      };
    });

    // Wait for all promises to resolve
    const stocksData = await Promise.all(responseData);

    // Clear and update prices in the file (assuming JSON format)
    const filePath = path.join(__dirname, "stock_prices.json");
    fs.writeFileSync(filePath, JSON.stringify(stocksData, null, 2));

    // Send the updated data in the response
    res.status(200).json(stocksData);

    // Call the function to start updating prices
    updatePrices();
  } catch (error) {
    console.error("Error fetching stocks data:", error);
    res.status(500).json({ error: "Error fetching stocks data" });
  }
});

// Function to update prices at intervals
const updatePrices = () => {
  setInterval(() => {
    // Read data from file
    const filePath = path.join(__dirname, "stock_prices.json");
    let stocksData = [];

    try {
      stocksData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.error("Error reading stock_prices.json:", error);
    }

    // Update prices with random values
    stocksData.forEach((stock) => {
      stock.previousClose = Math.random() * 100; // Replace with your logic for updating prices
    });

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(stocksData, null, 2));
  }, 1000); // Update every second, you can adjust this interval
};

// Call the function to start updating prices
//updatePrices();

// // API call to get all stocks data
// app.get("/stocks", async (req, res) => {
//   try {
//     const apiKey = process.env.POLY_API_KEY;
//     const n = req.query.n; // Get the value of 'n' from the query parameters
//     const response = await axios.get(
//       `https://api.polygon.io/v3/reference/tickers?active=true&limit=${n}&sort=ticker&apiKey=${apiKey}`
//     );

//     // Extract only the necessary data to avoid circular references
//     const responseData = response.data.results.map(async (result) => {
//       const ticker = result.ticker;
//       const name = result.name;
//       const currency = result.currency_name;

//       // Fetch previous close for each stock
//       const previousClose = await fetchPreviousClose(ticker);

//       return {
//         ticker,
//         name,
//         currency,
//         previousClose,
//         refreshInterval: Math.floor(Math.random() * 5) + 1, // Generate random refresh interval between 1 and 5 seconds
//       };
//     });

//     // Wait for all promises to resolve
//     const stocksData = await Promise.all(responseData);

//     // Store prices in a file (assuming JSON format)
//     const filePath = path.join(__dirname, "stock_prices.json");
//     fs.writeFileSync(filePath, JSON.stringify(stocksData, null, 2));

//     res.status(200).json(stocksData);
//   } catch (error) {
//     console.error("Error fetching stocks data:", error);
//     res.status(500).json({ error: "Error fetching stocks data" });
//   }
// });

// // Function to update prices at intervals
// const updatePrices = () => {
//   setInterval(() => {
//     // Read data from file
//     const filePath = path.join(__dirname, "stock_prices.json");
//     const stocksData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

//     // Update prices with random values
//     stocksData.forEach((stock) => {
//       stock.previousClose = Math.random() * 100; // Replace with your logic for updating prices
//     });

//     // Write updated data back to file
//     fs.writeFileSync(filePath, JSON.stringify(stocksData, null, 2));
//   }, 1000); // Update every second, you can adjust this interval
// };

// // Call the function to start updating prices
// updatePrices();

// app.get("/stocks", async (req, res) => {
//   try {
//     const apiKey = process.env.POLY_API_KEY; // Replace with your actual API key
//     const n = req.query.n; // Get the value of 'n' from the query parameters
//     const response = await axios.get(
//       `https://api.polygon.io/v3/reference/tickers?active=true&limit=${n}&sort=ticker&apiKey=${apiKey}`
//     );
//     const data = response.data;

//     // Extracting additional details for each stock
//     const stocksWithDetails = await Promise.all(
//       data.results.map(async (stock) => {
//         const symbol = stock.ticker;
//         const detailsResponse = await axios.get(
//           `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${apiKey}`
//         );
//         const detailsData = detailsResponse.data;
//         // const prevCloseResponse = await axios.get(
//         //   `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?unadjusted=true&apiKey=${apiKey}`
//         // );
//         // const prevCloseData = prevCloseResponse.data;
//         // const currentPriceResponse = await axios.get(
//         //   `https://api.polygon.io/v1/last/stocks/${symbol}?apiKey=${apiKey}`
//         // );
//         // const currentPriceData = currentPriceResponse.data;

//         return {
//           symbol: symbol,
//           name: detailsData,
//           // logo: detailsData.results.branding?.logo_url,
//           // prevClose: prevCloseData.close,
//           // currentPrice: currentPriceData.last.price,
//         };
//       })
//     );

//     res.json(stocksWithDetails);
//   } catch (error) {
//     console.error("Error fetching stocks details:", error);
//     res.status(500).json({ error: "Error fetching stocks details" });
//   }
// });

// API call to get all stocks data
// app.get("/stocks", async (req, res) => {
//   try {
//     const apiKey = process.env.POLY_API_KEY;
//     const n = req.query.n; // Get the value of 'n' from the query parameters
//     const response = await axios.get(
//       `https://api.polygon.io/v3/reference/tickers?active=true&limit=${n}&sort=ticker&apiKey=${apiKey}`
//     );

//     // Extract only the necessary data to avoid circular references
//     const responseData = response.data.results.map((result) => ({
//       ticker: result.ticker,
//       name: result.name,
//       currency: result.currency_name,
//       // Add other properties you need from the response
//     }));

//     res.status(200).json(responseData);
//   } catch (error) {
//     console.error("Error fetching stocks data:", error);
//     res.status(500).json({ error: "Error fetching stocks data" });
//   }
// });
