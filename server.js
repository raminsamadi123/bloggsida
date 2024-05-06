// Importera nödvändiga moduler och funktioner från olika filer och bibliotek
import express from "express";
import session from 'express-session';
import { getBlogs, getBlog, addBlog, deleteBlog, getUserStatus, updateUserStatus, updateBlog } from "./database.js";
import { check, validationResult } from 'express-validator';
import bodyParser from 'body-parser';

// Skapa en Express-app och ange porten att lyssna på
const app = express();
const port = 8080;

// Ange att vi använder "ejs" som vy-motor och aktivera användningen av urlencoded för att tolka inkommande data från formulär
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Konfigurera session
app.use(session({
    secret: 'nyckel',
    resave: false,
    saveUninitialized: true
}));

// Middleware för att kontrollera användarstatus och sätta isAdmin-flaggan i sessionen
app.use((req, res, next) => {
    const userStatus = getUserStatus();
    req.session.isAdmin = userStatus.admin || false;
    next();
});

// Hantera GET-förfrågningar för rotvägen ("/") och rendera indexsidan med tillhörande bloggar och isAdmin-flagga
app.get('/', (req, res) => {
    const blogs = getBlogs();
    res.render("index.ejs", {
        blogs: blogs,
        isAdmin: req.session.isAdmin
    });
});

// Hantera GET-förfrågningar för "/bloggar" och rendera indexsidan med filtrerade bloggar baserat på söktermen och isAdmin-flaggan
app.get("/bloggar", (req, res) => {
    const searchTerm = req.query.searchTerm;
    const blogs = getBlogs(searchTerm);
    res.render("index.ejs", {
        blogs: blogs,
        isAdmin: req.session.isAdmin
    });
});

// Hantera GET-förfrågningar för att redigera en specifik blogg baserat på ID
app.get("/blogg/:id/redigera", (req, res) => {
    const id = +req.params.id;
    const blog = getBlog(id);
    if (!blog) {
        return res.status(404).render("blog404.ejs");
    };

    res.render("editBlog.ejs", {
        errors: '',
        blog
    });
});

// Hantera GET-förfrågningar för att visa en specifik blogg baserat på ID
app.get("/blogg/:id", (req, res) => {
    const id = +req.params.id;
    const blog = getBlog(id);
    if (!blog) {
        res.status(404).render("blog404.ejs");
        return;
    };

    res.render("singleBlog.ejs", { 
        errors : '',
        blog,
        isAdmin: req.session.isAdmin,
    });
});

// Hantera GET-förfrågningar för att skapa en ny blogg
app.get("/skapa", (req, res) => {
    res.render("createBlog.ejs", { errors : '' });
});

// Hantera POST-förfrågningar för att lägga till en ny blogg
app.post("/bloggar", 
    [
        check('title').notEmpty().withMessage('Titel krävs'),
        check('author').notEmpty().withMessage('Författare krävs'),
        check('category').notEmpty().withMessage('Kategori krävs'),
        check('contents').notEmpty().withMessage('Innehåll krävs'),
    ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('createBlog.ejs', { errors: errors.mapped() });
    }
    const data = req.body;
    addBlog(data);
    res.redirect("/bloggar");
});

// Hantera GET-förfrågningar för inloggningssidan
app.get('/inlogg', (req, res) => {
    res.render("login.ejs");
});

// Hantera POST-förfrågningar för att logga in användare
app.post('/logga-in', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'admin' && password === 'root') {
        const userStatus = getUserStatus();
        userStatus.admin = true;
        updateUserStatus(userStatus);
        req.session.isAdmin = true;
        res.redirect('/bloggar');
    } else {
        res.render('login.ejs', { error: 'Felaktig användarnamn eller lösenord' });
    }
});

// Hantera GET-förfrågningar för att logga ut användare
app.get("/logga-ut", (req, res) => {
    req.session.isAdmin = false;
    const userStatus = getUserStatus();
    userStatus.admin = false;
    updateUserStatus(userStatus);
    res.redirect("/bloggar");
});

// Hantera POST-förfrågningar för att radera en specifik blogg baserat på ID
app.post("/blogg/:id/radera", (req, res) => {
    const id = +req.params.id;
    deleteBlog(id);
    res.redirect("/bloggar");
});

// Hantera POST-förfrågningar för att uppdatera en specifik blogg baserat på ID
app.post("/blogg/:id/redigera", 
    [
        check('title').notEmpty().withMessage('Titel krävs'),
        check('author').notEmpty().withMessage('Författare krävs'),
        check('category').notEmpty().withMessage('Kategori krävs'),
        check('contents').notEmpty().withMessage('Innehåll krävs'),
    ], 
    (req, res) => {
        const errors = validationResult(req);
        const id = +req.params.id;
        const blog = getBlog(id);

        if (!errors.isEmpty()) {
            return res.render('editBlog.ejs', { 
                errors: errors.mapped(),
                blog: blog
            });
        }
        
        const updatedFields = req.body;
        const success = updateBlog(id, updatedFields);
        if (success) {
            res.redirect(`/blogg/${id}`);
        } else {
            res.status(404).send("Blogg hittades ej");
        }
    }
);

// Ange att statiska filer kan serveras från mappen 'public'
app.use(express.static("public"));

// Lyssna på den angivna porten och skriv ut ett meddelande när servern är igång
app.listen(port, () => {
    console.log(`Exempelappen lyssnar på http://localhost:${port}`);
});