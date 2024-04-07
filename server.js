import express from 'express';
import "dotenv/config";

const app = express();

import fileUpload from 'express-fileupload';
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(fileUpload());

app.get("/", (req, res) => {
    return res.json({
        message: "Hello It's working..."
    });
});

// Import routes


app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
