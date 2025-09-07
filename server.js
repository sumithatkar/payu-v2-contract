const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

// parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// PayU credentials
const MERCHANT_KEY = "ISgdHG";
const MERCHANT_SALT = "grFCphIXnJGFJJySQhDBpHspDEYvre7f";

// generate unique txnId
function generateTxnId() {
  return "Txn_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

// POST /pay endpoint
app.post("/pay", async (req, res) => {
  try {
    const {
      product,
      price,
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode,
      phone,
      email
    } = req.body;

    const txnId = generateTxnId();

    // build full payload
    const payload = {
      currency: "INR",
      accountId: MERCHANT_KEY,
      txnId,
      order: {
        productInfo: product || "string",
        userDefinedFields: { udf1: "", udf2: "", udf3: "", udf4: "", udf5: "" },
        paymentChargeSpecification: { price: Number(price || 1000) }
      },
      additionalInfo: { txnFlow: "nonseamless" },
      callBackActions: {
        successAction: "http://localhost:3000/payu-response",
        failureAction: "http://localhost:3000/payu-response"
      },
      billingDetails: {
        firstName,
        lastName: lastName || "",
        address1,
        address2: address2 || "",
        city,
        state,
        country: "India",
        zipCode,
        phone,
        email
      }
    };

    // HMAC-SHA512 signing using payload JSON
    const date = new Date().toUTCString();
    const hashString = JSON.stringify(payload) + "|" + date + "|" + MERCHANT_SALT;
    const signature = crypto.createHash("sha512").update(hashString).digest("hex");
    const authorization = `hmac username="${MERCHANT_KEY}", algorithm="sha512", headers="date", signature="${signature}"`;

    console.log("\n=== PAYU REQUEST ===");
    console.log("Headers:", { date, authorization });
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("===================");

    // send request to PayU
    const response = await fetch("https://apitest.payu.in/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        date,
        authorization
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("PayU Response:", data);

    if (data?.result?.checkoutUrl) {
      return res.redirect(data.result.checkoutUrl); // redirect user to checkout
    } else {
      return res.status(response.status).send(data);
    }

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).send({ error: err.message, stack: err.stack });
  }
});

// ✅ NEW ROUTE: handle PayU POST response and redirect to response.html
app.post("/payu-response", (req, res) => {
  console.log("=== PayU RESPONSE RECEIVED ===", req.body);

  // Convert POST body into query string for response.html
  const query = new URLSearchParams(req.body).toString();
  res.redirect("/response.html?" + query);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
