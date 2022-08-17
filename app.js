// Test
const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');

const app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/model', (req, res) => {
    // es fehlt ID zum bearbeiten etc. Eigentlich /:id/edit
    res.render('module/model')
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