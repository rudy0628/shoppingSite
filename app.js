if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');

const helmet = require('helmet');
const {scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls} = require('./helmetUrls');

const { categories } = require('./seeds/seedHelpers');

const User = require('./models/user');

const itemRoutes = require('./routes/items');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//*********mongodb connect**********
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/shoppingSite';
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

//execute express
const app = express();

//*********enable ejs engine and set views directory**********
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//*********use express request body,extend method**********
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisisabigsecret';

const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
})

store.on('error', function() {
	console.log('Session store error', e);
})

const sessionConfig = {
	store,
	name:'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24,
		maxAge: 1000 * 60 * 60 * 24
	}
};

//use session before the passport.session
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
			fontSrc:["'self'", ...fontSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dz50afcaa/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//set password serializeUser and deserializeUser
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
	res.locals.categories = categories;
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//*********routes**********
app.use('/items', itemRoutes);
app.use('/items/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

//*********throw new Error 404 not found**********
app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found!!', 404));
});

//*********error handling**********
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh something went wrong!!';
	res.status(statusCode).render('error', { err });
});

//listen port
app.listen(3000, () => {
	console.log('listen to port 3000!');
});
