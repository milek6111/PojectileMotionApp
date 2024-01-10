const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'TIappSecret', 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        maxAge: 1800000
    }
}));

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);