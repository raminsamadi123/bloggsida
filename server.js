import express, { response } from "express";
import session from 'express-session';
import { getBlogs, getBlog, addBlog, deleteBlog, getUserStatus, updateUserStatus, updateBlog } from "./database.js";
import { check, validationResult } from 'express-validator';
const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    const userStatus = getUserStatus();
    req.session.isAdmin = userStatus.admin || false;
    next();
});

app.get('/', (req, res) => {
    const blogs = getBlogs();
    res.render("index.ejs", {
        blogs: blogs,
        isAdmin: req.session.isAdmin
    });
});

app.get("/bloggar", (req, res) => {
    const searchTerm = req.query.searchTerm;
    const blogs = getBlogs(searchTerm);
    res.render("index.ejs", {
        blogs: blogs,
        isAdmin: req.session.isAdmin
    });
});

app.get("/blogg/:id/redigera", (req, res) => {
    const id = +req.params.id;
    const blog = getBlog(id);
    if (!blog) {
        return res.status(404).render("blog404.ejs");
    };

    res.render("editBlog.ejs", {
        errors: '',
        blog,
        isAdmin: req.session.isAdmin
    });
});

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

app.get("/skapa", (req, res) => {
    res.render("createBlog.ejs", { errors : '' });
});

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


app.get('/inlogg', (req, res) => {
    res.render("login.ejs");
});

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

app.get("/logga-ut", (req, res) => {
    req.session.isAdmin = false;
    const userStatus = getUserStatus();
    userStatus.admin = false;
    updateUserStatus(userStatus);
    res.redirect("/bloggar");
});

app.post("/blogg/:id/radera", (req, res) => {
    const id = +req.params.id;
    deleteBlog(id);
    res.redirect("/bloggar");
});

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

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Example app is listening at http://localhost:${port}`);
});