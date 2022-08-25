const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const userRoutes = require('./routes/user');
const ifcModelRoutes = require('./routes/ifcModel');
const app = express();
const session = require("express-session")
const User =require("./dbModels/user")
const flash = require('connect-flash');

const passport = require("passport")
const LocalStrategy = require("passport-local")
// const ExpressError = require('./utils/ExpressError');
// const MongoDBStore = require("connect-mongo")(session);



const dbUrl = 'mongodb://localhost:27017/ifc';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});
app.use(express.urlencoded({ extended: true }));

const secret = 'Fische';

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// const store = new MongoDBStore({
//     url: dbUrl,
//     secret,
//     touchAfter: 24 * 60 * 60
// });

const sessionConfig = {
    // store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));

app.use(flash());

app.use(passport.initialize())
app.use(passport.session())


passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser()) // start Session
passport.deserializeUser(User.deserializeUser()) // end Session

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/ifcModel', ifcModelRoutes)
app.use('/ifcModel/:id', ifcModelRoutes)


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/editTimetable', (req, res) => {
    // es fehlt ID zum bearbeiten etc. Eigentlich /:id/edit
    res.render('module/editTimetable')
});

// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page Not Found', 404))
// })

const port = 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})