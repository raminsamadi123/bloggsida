import express from "express";
const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect('/bloggar');
});

app.get('/bloggar', (req, res) => {
    // Insert code here for viewing all of the blogs (homepage)
    res.render("partials/footer.ejs");
});

app.get('/blogg/:id', (req, res) => {
    // Insert code here for the single blogs
});

app.get('/bloggar/inlogg', (req, res) => {
    // Insert code here for the blog login page
});

app.get('/bloggar/kategori/:category', (req, res) => {
    // Insert code here for filtering blog post by category
});

app.get('/blogg/:id/redigera', (req, res) => {
    // Insert code here for editing an existing blog
});

app.get('/bloggar/skapa', (req, res) => {
    // Insert code here for creating new blog
});

app.post('/bloggar', (req, res) => {
    // Insert code here for creating new blog
});

app.post('/notes/:id/delete', (req, res) => {
    // Insert code here for deleting an existing blog
});

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Blogg HTTP-Server Lyssnar vid http://localhost:${port}`);
});