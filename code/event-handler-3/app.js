const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const enforce = require('express-sslify');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();



const eventRouter = require('./routes/eventRouter');



// if(process.env.NODE_ENV.trim() == "production"){
    
//     app.use(enforce.HTTPS({ trustProtoHeader: true }));
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    credentials: true
}));
app.use(cookieParser());

app.use("/test", eventRouter);

app.listen(process.env.PORT || 4300, () => {
    console.log("server started on port: ", process.env.PORT)
});

process.on("unhandledRejection", (reason) => {
    console.log('unhandledRejection', reason);
    
});

process.on("uncaughtException", error => {
    console.log('uncaughtException', error);

});