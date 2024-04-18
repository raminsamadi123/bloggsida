import fs from 'fs';
let blogs = [];
let currentId = 1;
const FILE_PATH = 'blogs.json';

export function updateBlog(id, updatedFields) {
    const blogIndex = blogs.findIndex(blog => blog.id === id);
    if (blogIndex !== -1) {
        blogs[blogIndex] = {
            ...blogs[blogIndex],
            ...updatedFields
        };
        saveBlogs();
        return true;
    }
    return false;
}

try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    blogs = JSON.parse(data);
    currentId = Math.max(...blogs.map(blog => blog.id), 0) + 1;
} catch (err) {
    if (err.code === 'ENOENT') {
        fs.writeFileSync(FILE_PATH, '[]');
    } else {
        console.error('Fel vid laddning av bloggar:', err);
    }
}

const usersFilePath = 'users.json';

export function getUserStatus() {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Fel vid läsning av users file:', err);
        return {};
    }
}

export function updateUserStatus(status) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(status, null, 4));
    } catch (err) {
        console.error('Fel vid skrivning i users file', err);
    }
}

function saveBlogs() {
    fs.writeFile(FILE_PATH, JSON.stringify(blogs), 'utf8', err => {
        if (err) {
            console.error('Fel vid sparande:', err);
        } else {
            console.log('Bloggar har sparats.');
        }
    });
}

export function getBlogs(searchTerm) {
    if (!searchTerm) {
        return blogs;
    }
    return blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
        blog.contents.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
    );    
};

export function getBlog(id) {
    return blogs.find(blog => blog.id === id);
};

export function addBlog(blog) {
    blogs.push({
        ...blogs,
        title: blog.title,
        id: currentId,
        contents: blog.contents,
        author: blog.author,
        timestamp: Date.now(),
        category: blog.category
    });
    currentId++;
    saveBlogs();
};

export function deleteBlog(id) {
    blogs = blogs.filter((blog) => blog.id !== id);
    saveBlogs();
};