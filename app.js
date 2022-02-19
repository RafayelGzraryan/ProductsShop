const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const morgan = require('morgan');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const https = require('https');

const errorController = require('./controllers/error');
const User = require("./models/user");

const app = express();

const MONGODB_URI = "mongodb://localhost:27017/shop";

const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: "sessions"
})
const csrfProtection = csrf({});

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
      cb(null,  new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRouter = require('./routes/auth');

const accessLoggStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLoggStream}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'My Secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
               return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next()
})

app.use(authRouter);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    res.redirect('/500');
})

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        // https.createServer({key: privateKey, cert: certificate}, app)
        //     .listen(3000, ()=> console.log("Connected"));
        app.listen(3000, ()=> console.log("Connected"));
    })
    .catch(err => console.log(err.message));