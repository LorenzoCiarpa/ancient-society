const express = require('express');
const dotenv = require('dotenv');
const enforce = require('express-sslify');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

dotenv.config();

const metaRouter = require('./routes/metaRouter');
const metaOfficialRouter = require('./routes/metaOfficialRouter');



if(process.env.NODE_ENV.trim() == "production"){
    
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET'],
    credentials: true
}));
app.use(cookieParser());

// app.use("/prereveal/metadata", metaRouter);

app.use("/reveal/metadata", metaOfficialRouter);


app.listen(process.env.PORT || 38000);