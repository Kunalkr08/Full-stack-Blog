const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;
const corsConfig = {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT"],
};

app.use(cors(corsConfig));

app.use(express.json());
app.use(cookieParser());


async function main() {
  
  await mongoose.connect( process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });
  console.log("Connected to MONGODB!!");
};

 

main().catch((err) => { console.log(err); })


app.get("/", (req, res)=>{
  res.json("server");
})

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc?.password);
  if (passOk && userDoc) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
        sameSite : 'None'
      });
    });
  } 
  else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req?.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', {sameSite : 'None'}, '').json('ok');
});

app.post('/post', async (req,res) => {

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content,Image} = req?.body;
    console.log("Data", title, summary, content, Image);
    const postDoc = await Post.create({
      title,
      summary,
      content,
      // cover:newPath,
      cover: Image,
      author: info.id,
    });
    res.json(postDoc);
  });

});


app.put('/post', async (req, res) => {
  const { token } = req.cookies;

  console.log("Hey My name is cokkies Your name is ?", token)
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  jwt.verify(token, secret, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, title, summary, content, Image } = req.body;
  
    try {
      const postDoc = await Post.findById(id);
      if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(403).json({ error: 'You are not the author' });
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { title, summary, content, cover : Image },
        { new: true } // Return the updated document
      );

      res.json(updatedPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
   });
});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});


app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})



app.listen(4000, ()=>{  console.log("server running 4000")});

module.exports = app;