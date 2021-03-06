const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const restricted = require('./auth/restricted-middleware')

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let {username, password} = req.body;
  const hash = bcrypt.hashSync(password, 12); // the number is 2 ^12th power. Makes it harder for a hacker to get in. Slows them down

  Users.add({username, password: hash})
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      //check/validate password against the hash
      //The argument asks for two things: password guess in the body and the password hash from the database 
      //hashes the password guess and compares. return true or false
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'You Shall Not Pass!!!' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/hash', (req, res) => {
  const name = req.query.name;

  const hash = bcrypt.hashSync(name, 12);//hash the name using bcrypt

  res.send(`the hash for ${name} is ${hash}`)
})



const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
