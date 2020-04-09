const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const helmet = require('helmet');
const dataStore = require('nedb'), db = new dataStore({filename: './database/users.db'}), posts = new dataStore({filename: './database/posts.db'}),friends = new dataStore({filename: './database/friends.db'});
const app = express();

app.set('trust proxy', 1);

app.use('/frontend',express.static(path.resolve(__dirname,'frontend')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(session({
  secret: "awfwigherou2938ru4398tyu349th34thy34ry23rjnwiuefhe",
  cookie: { maxAge: 86400000 }
}))

app.use('/auth/signup',(req,res,next)=>{
	let username = req.body.username;
	let password = req.body.password;
	if(username.length < 10 || password.length < 15){
		res.redirect('/signup');
	} else {
		next();
	}
})

app.use('/auth/login',(req,res,next)=>{
	let username = req.body.username;
	let password = req.body.password;
	if(username.length < 10 || password.length < 15){
		res.redirect('/login');
	} else {
		next();
	}
})

app.get('/view-profile',(req,res)=>{
	if(req.session.name && req.session.id){
		res.sendFile(path.resolve(__dirname,'frontend/authed/landing/view/view.html'));
	} else {
		res.redirect('/home');
	}
})

app.get('/',(req,res)=>{
	res.redirect('/home');
})

app.get('/friends',(req,res)=>{
	if(req.session.name && req.session.id){
		res.sendFile(path.resolve(__dirname,'frontend/friends/friends.html'));
	} else {
		res.redirect('/home');
	}
})

app.get('/search/:query',(req,res)=>{
	if(req.session.name && req.session.id){
		res.sendFile(path.resolve(__dirname,'frontend/authed/landing/search/search.html'));
	} else {
		res.redirect('/home');
	}
})

app.get('/home',(req,res)=>{
  console.log(req.session);
	res.sendFile(path.resolve(__dirname,'frontend/home/home.html'));
});

app.get('/login',(req,res)=>{
	res.sendFile(path.resolve(__dirname,'frontend/home/login/login.html'));
});

app.get('/signup',(req,res)=>{
	res.sendFile(path.resolve(__dirname,'frontend/home/signup/signup.html'));
});

app.get('/landing',(req,res)=>{
	if(req.session.name && req.session.id){
		res.sendFile(path.resolve(__dirname,'frontend/authed/landing/landing.html'));
	} else {
		res.redirect('/home');
	}
})

app.get('/profile',(req,res)=>{
	if(req.session.name && req.session.id){
		res.sendFile(path.resolve(__dirname,'frontend/authed/landing/profile/profile.html'));
	} else {
		res.redirect('/home');
	}
})

app.get('/API/session/name',(req,res)=>{
	res.send(req.cookies.name);
})

app.post('/auth/login',(req,res)=>{
	db.loadDatabase((err)=>{
		if(err){
			console.error(err);
		} else {
			db.find({username: req.body.username, password: req.body.password},(err,docs)=>{
				if(docs.length > 0){
					console.log('User exists');
					let username = req.body.username;
					let id = crypto.randomBytes(8*3).toString('base64');
					req.session.name = username;
					req.session.uid = id;
					console.log(req.session);
					res.redirect('/landing');
				} else {
					console.log("User doesn't exist");
					res.redirect('/login');
				}
			})
		}
	})
})

app.post('/auth/signup',(req,res)=>{
	db.loadDatabase((err)=>{
		if(err){
			console.error(err);
		} else {
			db.find({username: req.body.username},(err,docs)=>{
				if(docs.length <= 0){
					// User is unique
					let doc = {username: req.body.username,password: req.body.password, pending: [], friends: []};
					db.insert(doc,(err,newDoc)=>{
						if(err){
							console.error(err);
						} else {
							res.redirect('/home');
						}
					})
				} else {
					res.redirect('/home');
				}
			})
		}
	});
});

app.get('/API/friends/add/:user',(req,res)=>{
  friends.loadDatabase((err)=>{
    if(err){
      console.error(err);
      res.send(err);
    } else {
      friends.find({username: req.session.name, friends: [{name: req.params.user}]},(err,docs)=>{
        if(err){
          console.error(err);
          res.send(err);
        } else {
          if(docs.length <= 0){
            friends.insert({username: req.session.name, friends: [{name: req.params.user}]},(err,newDoc)=>{
              if(err){
                console.error(err);
              } else {
                res.redirect('/profile');
              }
            })
          } else {
            res.send(docs);
          }
        }
      })
    }
  })
})

app.get('/API/fetchname',(req,res)=>{
  res.send(req.session.name);
})

app.get('/API/posts/fetch', (req,res)=>{
	posts.loadDatabase((err)=>{
		if(err){
			console.error(err);
		} else {
			posts.find({author: req.session.name},(err,docs)=>{
				if(err){
					console.error(err);
				} else {
          res.send(docs);
				}
			})
		}
	})
})

app.post('/API/posts/store',(req,res)=>{
	posts.loadDatabase((err)=>{
		if(err){
			console.error(err);
		} else {
			let date = new Date();
			let month = date.getUTCMonth()+1;
			let day = date.getUTCDate();
			let year = date.getUTCFullYear();
			let n = month+'/'+day+'/'+year;
			let doc = {author: req.session.name, title: req.body.header, body: req.body.content, creation: n};
			posts.insert(doc,(err,newDoc)=>{
				if(err){
					console.error(err);
				} else {
					console.log(newDoc);
					res.redirect('/profile')
				}
			})
		}
	})
})

app.get('/API/search/:user',(req,res)=>{
	console.log(req.params.user)
  function checkName(itm){
    if(itm){
      try{
        console.log(itm.username);
        return true
      } catch {
        return false
      }
    }
  }
	db.loadDatabase((err)=>{
		if(err){
			console.error(err);
		} else {
			db.find({ },(err,doc)=>{
        let docs = []
        let docStr;
        console.log(doc);
        for(let i = 0; i <= doc.length-1; i++){
          if(checkName(doc[i]) === true){
            docStr = doc[i].username;
            if(docStr.includes(req.params.user)){
              docs.push({"name": docStr});
              console.log(docs);
            }
          } else {
            console.log('Invalid name at ' + String(i))
          }
        }
				if(docs.length <= 0){
					console.log("User doesn't exist");
				} else {
					res.send(docs);
				}
			})
		}
	})
});

app.get('/API/fetchlist',(req,res)=>{
  friends.loadDatabase((err)=>{
    if(err){
      console.error(err);
    } else {
      friends.find({username:req.session.name},(err,docs)=>{
        if(err){
          console.error(err);
        } else {
          res.send(docs);
        }
      });
    };
  });
});

app.get('/logout',(req,res)=>{
	req.session.destroy((err)=>{
		if(err) console.error(err);
	})
	res.redirect('/home')
})

app.get('/API/posts/:user',(req,res)=>{
	posts.loadDatabase((err)=>{
		if(err){
			console.error(err);
		} else {
			posts.find({author: req.params.user},(err,docs)=>{
				if(docs.length && docs.length > 0){
					res.send(docs);
				} else {
          res.send('false');
        }
			})
		}
	})
})

app.listen(process.env.PORT || 3000, ()=> console.log('Listening on port 3000'));
