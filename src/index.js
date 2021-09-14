const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistUserAccount(req, res, next) {
    const { username } = req.headers;

    const user = users.find(user => user.username === username);

    if(!user)
        return res.status(400).json({ error: "User not-found"});

    req.user = user;

    next();
};

app.post('/users', (req, res) => {
    const { name, username } = req.body;

    const userExist = users.find(user => user.username === username);

    if(userExist)
        return res.status(400).json({ error: "Username already exist"});
    
    const user = {
        id: uuidv4(),
        name,
        username,
        todos: []
    };

    users.push(user);

    return res.status(201).json(user);
});

app.get('/todos', checksExistUserAccount, (req, res) => {
    const { user } = req;

    return res.json(user.todos);
});

app.post('/todos', checksExistUserAccount, (req, res) => {
    const { user } = req;
    const { title, deadline } = req.body;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    };

    user.todos.push(todo);

    return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistUserAccount, (req, res) => {
    const { user } = req;
    const { id } = req.params;
    const { title, deadline } = req.body;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo)
        return res.status(404).json({error: 'todo not found'});
    
    todo.title = title;
    todo.deadline = new Date(deadline);

    return res.json(todo);
});

app.patch('/todos/:id/done', checksExistUserAccount, (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const todo = user.todos.find(todo => todo.id === id);

    if (!todo)
        return res.status(404).json({error: 'todo not found'});
    
    todo.done = true;

    return res.json(todo);
});

app.delete('/todos/:id', checksExistUserAccount, (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const todo = user.todos.findIndex(todo => todo.id === id);

    if (todo === -1)
        return res.status(404).json({ error: 'todo not found'});
    
    user.todos.splice(todo, 1);

    return res.status(204).json();
});

module.exports = app;
