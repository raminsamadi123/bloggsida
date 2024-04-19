// Importera fs-modulen för att arbeta med filsystemet
import fs from 'fs';

// Array för att lagra bloggar och en variabel för att hålla reda på det senaste id:t
let blogs = [];
let currentId = 1;

// Sökväg till JSON-filen som lagrar bloggar
const FILE_PATH = 'blogs.json';

// Funktion för att uppdatera en befintlig blogg med givna fält
export function updateBlog(id, updatedFields) {
    // Hitta index för den blogg med det angivna id:t
    const blogIndex = blogs.findIndex(blog => blog.id === id);
    // Om bloggen finns, uppdatera den med de nya fälten och spara ändringar
    if (blogIndex !== -1) {
        blogs[blogIndex] = {
            ...blogs[blogIndex],
            ...updatedFields
        };
        saveBlogs(); // Spara ändringar till blogs.json
        return true; // Returnera true för att indikera framgångsrik uppdatering
    }
    return false; // Om bloggen inte hittas, returnera false
}

// Försök att läsa in data från JSON-filen vid start
try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    // Parsa JSON-data till bloggar och uppdatera currentId
    blogs = JSON.parse(data);
    currentId = Math.max(...blogs.map(blog => blog.id), 0) + 1;
} catch (err) {
    // Om filen inte finns, skapa en tom JSON-fil för bloggar
    if (err.code === 'ENOENT') {
        fs.writeFileSync(FILE_PATH, '[]');
    } else {
        console.error('Fel vid laddning av bloggar:', err);
    }
}

// Sökväg till JSON-filen som lagrar användarstatus
const usersFilePath = 'users.json';

// Funktion för att hämta användarstatus från JSON-fil
export function getUserStatus() {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data); // Returnera användarstatus
    } catch (err) {
        console.error('Fel vid läsning av users file:', err);
        return {}; // Om filen inte kan läsas, returnera tom objekt
    }
}

// Funktion för att uppdatera användarstatus i JSON-fil
export function updateUserStatus(status) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(status, null, 4));
    } catch (err) {
        console.error('Fel vid skrivning i users file', err);
    }
}

// Funktion för att spara bloggar till JSON-fil
function saveBlogs() {
    fs.writeFile(FILE_PATH, JSON.stringify(blogs), 'utf8', err => {
        if (err) {
            console.error('Fel vid sparande:', err);
        } else {
            console.log('Bloggar har sparats.');
        }
    });
}

// Funktion för att hämta alla bloggar eller filtrera efter sökterm
export function getBlogs(searchTerm) {
    if (!searchTerm) {
        return blogs; // Returnera alla bloggar om ingen sökterm finns
    }
    // Filtrera bloggar baserat på söktermen
    return blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
        blog.contents.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
    );    
};

// Funktion för att hämta en specifik blogg baserat på id
export function getBlog(id) {
    return blogs.find(blog => blog.id === id); // Returnera blogg med matchande id
};

// Funktion för att lägga till en ny blogg
export function addBlog(blog) {
    // Lägg till den nya bloggen i arrayen med tillhörande information
    blogs.push({
        ...blogs,
        title: blog.title,
        id: currentId,
        contents: blog.contents,
        author: blog.author,
        timestamp: Date.now(),
        category: blog.category
    });
    currentId++; // Öka currentId för nästa blogg
    saveBlogs(); // Spara ändringar till blogs.json
};

// Funktion för att ta bort en blogg med angivet id
export function deleteBlog(id) {
    // Filtrera bort bloggen med det angivna id:t
    blogs = blogs.filter((blog) => blog.id !== id);
    saveBlogs(); // Spara ändringar till blogs.json
};