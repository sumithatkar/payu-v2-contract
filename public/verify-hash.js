const crypto = require("crypto");

// 👇 Replace this string with exactly what Postman console printed as "Hash String is ..."
const hashString = '{"currency":"INR","accountId":"ISgdHG","txnId":"Txn_1127878891115","order":{"productInfo":"string","userDefinedFields":{"udf1":"","udf2":"","udf3":"","udf4":"","udf5":""},"paymentChargeSpecification":{"price":1000}},"additionalInfo":{"txnFlow":"nonseamless"},"callBackActions":{"successAction":"https://test.payu.in/admin/test_response","failureAction":"https://test.payu.in/admin/test_response"},"billingDetails":{"firstName":"sartaj","lastName":"","address1":"Test Payu Gurgaon","address2":"","city":"Bharatpur","state":"Rajasthan","country":"India","zipCode":"321028","phone":"9876543210","email":"testv2@example.in"}}|Tue, 02 Sep 2025 17:12:45 GMT|grFCphIXnJGFJJySQhDBpHspDEYvre7f';

// Generate SHA-512 hash
const digest = crypto.createHash("sha512").update(hashString).digest("hex");

console.log("Hash String:");
console.log(hashString);
console.log("\nSHA-512 Digest (hex):");
console.log(digest);
