const express = require("express");
const app = express();
app.use(express.json());

const urlStore = {};

app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});


app.post("/shorten-url", (req, res) => {
    const { url, validity = 30, shortcode, expiry } = req.body;
    if (!url || !shortcode) {
        return res.status(400).json({ error: "URL and shortcode are required" });
    }
    const expiryDate = expiry || new Date(Date.now() + validity * 24 * 60 * 60 * 1000).toISOString();
    urlStore[shortcode] = { url, validity, shortcode, expiryDate };
    const shortenedUrl = `http://localhost:3000/${shortcode}`;
    const response = {
        shortenedUrl,
        expiryDate
    };
    res.status(201).json(response);
});

app.get("/:shortcode", (req, res) => {
    const { shortcode } = req.params;
    const data = urlStore[shortcode];
    if (!data) {
        return res.status(404).json({ error: "Shortcode not found" });
    }
    if (new Date() > new Date(data.expiryDate)) {
        return res.status(410).json({ error: "Shortened URL has expired" });
    }
    res.json({
        url: data.url,
        validity: data.validity,
        shortcode: data.shortcode
    });
});

app.listen(3000,()=>{console.log("Server is running on port 3000");});