const express = require("express");
const https = require("https");
const cors = require("cors");
const bcrypt = require('bcrypt');
const fs = require("fs");
const fse = require('fs-extra');
const path = require("path");
const socketio = require('socket.io');
const mongoose = require('mongoose');
const jszip = require('jszip');
const simpleGit = require('simple-git');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const axios  = require("axios");

const saltRounds = 10;
const app = express();

const certDir = `/etc/letsencrypt/live`;
const domain = `oncodeeditor.com`;
const options = {
  key: fs.readFileSync(`${certDir}/${domain}/privkey.pem`),
  cert: fs.readFileSync(`${certDir}/${domain}/fullchain.pem`),
  requestCert: false,
  rejectUnauthorized: false,
};


const server = https.createServer(options,app);

const PORT = process.env.PORT || 5000;
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true }));
app.use(cors());

dotenv.config();
const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

const ENDPOINT = 'https://oncodeeditor.com/api';
const CLIENT_URL ="https://oncodeeditor.com/";

const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com', 
    pool:true,
    port: 465,
    secure: true,
    auth: {
      user: 'code.editor.uth@gmail.com',
      pass: 'iwlsinoffgetkoti',
    },
  });

mongoose.connect('mongodb://localhost:27017/code_editor',{
    useNewUrlParser:true,
    useUnifiedTopology:true             
},(err)=> {
    if(err){
        console.log('Mongodb error : ',err);
    }
    else{
        console.log('Mongodb connected successfully');

        fs.exists(path.join(__dirname, "Projects"), exists => {
            if(exists){
                console.log("The Projects directory already exists");
            }else{
                fs.mkdirSync(path.join(__dirname,"/Projects"),{recursive:true});
            }
          });
    }
});

const Schema= mongoose.Schema;

const userData = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String},
    email: {type: String, required: true},
    previous_project: {type: String},
    num: {type: Number},
    confirmed: {
        type: Boolean,
        default: false
    },
    git_user : {type: String},
    git_email: {type: String},
});

const User = mongoose.model('User' , userData);

const io = socketio(server, {
    cors: {
      origin: 'https://oncodeeditor.com/' ,
      methods: ["GET", "POST"],
    },
	path:"/api/socket.io",
     secure: true,
   transports: ['polling', 'websocket'],
   allowUpgrades: true

});

let socket_rooms=[];
io.of('/api').on('connection', (socket) => {

    socket.on('join', (values) => { 
       
        if(values.host){
            if(!socket_rooms.includes(values.room)){
                socket_rooms.push(values.room);
                socket.join(values.room);
                console.log('user connected in room ',values.room ,"is host? ", values.host);
            }
            else{
                socket.emit('fail_join', "The room already exists create a new one");
            }
        }else{
            if(socket_rooms.includes(values.room)){
                socket.join(values.room);
                socket.broadcast.to(values.room).emit('new');
                console.log('user connected in room ',values.room ,"is host? ", values.host);
            }else{
                socket.emit('fail', "The room doesn't exists.");
            }
        }
        
    });

    socket.on('code', (values) => { 
        socket.broadcast.to(values.room).emit('message',{code: values.code,fcode: values.fcode ,user: values.user});
    });

    socket.on('new_member', (values) => { 
        socket.broadcast.to(values.room).emit('new_member_only',{hostname: values.hostname,code: values.code,fcode: values.fcode,files: values.files,current:  values.current,messages: values.messages});
    });

    socket.on('current', (values) => { 
        socket.broadcast.to(values.room).emit('new_current',{current: values.current, user: values.user , files: values.files});
    });

    socket.on('chatMessage', msg => { 
       socket.broadcast.to(msg.room).emit('new_message',msg);
    });

    socket.on('disconnect_room', (values) => { 
        socket.broadcast.to(values.room).emit('host');
        socket_rooms = socket_rooms.filter(i => i !== values.room);

});



});


app.get('/api/confirmation/:id',async(req, res) => {
    try {

      User.findByIdAndUpdate( req.params.id, { confirmed: true },{new:true})
      .then((user) => console.log("User confirmed the email",user.confirmed))
      .catch(err => console.log(err))
    } catch (e) {
      res.send('error');
    }
  
   return res.redirect(CLIENT_URL);
  });

app.post('/api/SignIn', (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({username: username})
    .exec((error , user) => {

        if(error){
            res.send({err: error});
        }

        if(!user){
            res.send({message: "User doesn't exist"});
        }
        else if(!user.confirmed){
            res.send({message: "You haven't confirmed your email yet.Please check your email inbox for the confirmation email."});
        }
        else{
            if(user.password){
                bcrypt.compare(password,user.password,(err,response)=>{
                    
                    if(err){
                        res.send({message: "Error with the Database.Please try again in an minute."});
                    }
                    if(!response){
                        res.send({message: "Wrong username/password combination"});
                    }
                    else{
                        res.send({mess: "ok"});
                    }
                });
            }else{
                res.send({message: "Your account only works with Github Sign In."});
            }
        }

    });
});

app.post('/api/SignUp', (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const email=req.body.email;

    User.findOne({username: username})
    .exec((error , user) => {

        if(error){
            res.send({err: error});
            return;
        }

        if(user){
            res.send({message: "Username already exists. Choose another one."});
        }
        else{

            bcrypt.hash(password,saltRounds,(err,hash)=>{
                if(err){
                    console.log(err);
                    res.send({err: err});
                }
                else{
        
                    const signedUpUser = new User({
                        username: username,
                        password: hash,
                        email: email,
                        previous_project: "",
                        num: 0,
                        git_user: undefined,
                        git_email: undefined,
                    });
        
                    signedUpUser.save()
                    .then(newUser =>{
                        
                        const url = ENDPOINT+`/confirmation/${newUser._id}`;

                        transporter.sendMail({
                            to: email,
                            subject: 'OnCode Email Confirmation.',
                            html: `Hello ${username} ,<br></br> Please click <strong><a href="${url}">here</a> </strong> to confirm your email.`,
                        });

                        const folderpath= "/Projects/"+ username +"/myProject";
                        fs.mkdirSync(path.join(__dirname,folderpath),{recursive:true});
                        res.send({success: "An email has been sent to your email,so you can confirm your email.You have to confirm it in order to be able to sign in."});
                    })
                    .catch(error =>{
                        console.log(error);
                        res.send({err: error});
                    });
                }
            });
        }
    });
    
});

app.post('/api/SignOut', (req,res)=>{

    User.findOneAndUpdate({username: req.body.username},{previous_project: req.body.previous_project},(error, result)=> {  
          
        if(error){
            console.log(error);
            res.send({err: error});
        }
        else{
            res.send({mess: "ok"});
        }

    });

});


app.post('/api/CreateFolder', (req,res)=>{
   
    const folderpath= "/Projects/"+ req.body.username + "/" + req.body.path;

    fs.exists(path.join(__dirname,folderpath), exists => {
        if(exists){
            console.log("The "+ folderpath +"directory already exists");
        }else{
            try{
                fs.mkdirSync(path.join(__dirname,folderpath),{recursive:true});
               
            }catch{
                let err= "Error with creating folder"+ folderpath;
                console.log(err);
                res.send({err: err});
            }   
        }
      });

});


app.post('/api/CreateFile', (req,res)=>{
   
    const filepath= "/Projects/"+ req.body.username + "/" + req.body.path;
    fs.writeFileSync(path.join(__dirname,filepath),req.body.content);
    res.send({mess: true});

});

app.post('/api/Paste', (req,res)=>{
   
    const srcpath= "/Projects/"+ req.body.username + "/" + req.body.srcpath;
    const dstpath= "/Projects/"+ req.body.username + "/" + req.body.dstpath;



    fs.exists(path.join(__dirname,srcpath), exists => {
        if(exists){

            if(srcpath.includes('.')){
                fs.copyFile(path.join(__dirname,srcpath), path.join(__dirname,dstpath,"/",req.body.srcpath.split("/")[req.body.srcpath.split("/").length-1]), (err) => {
                    if (err) throw err;
                    
                    try{
                        console.log('file was copied to destination file');
                        var data = fs.readFileSync(path.join(__dirname,dstpath,"/",req.body.srcpath.split("/")[req.body.srcpath.split("/").length-1]),"utf-8");
                        res.send({mess: "ok",content: data});
                    }catch(err){
                        console.log("Error with creating pasted file",err);
                        res.send({err: "Error with creating pasted file"});
                    }  
                });
            }
            else{
                fse.copy(path.join(__dirname,srcpath), path.join(__dirname,dstpath,"/",req.body.srcpath.split("/")[req.body.srcpath.split("/").length-1]),function (err)  {
                    if (err) {
                        console.error(err);
                        res.send({err: "Error when pasting the folder.Please try again."});
                        return;
                    }
                    console.log('folder was copied to destination folder');

                    const currentpath="/Projects/"+ req.body.username + "/myProject/"+ req.body.project_name;
                    
                    repo_files= [];
                    try{
                        repo_files.push({name:req.body.project_name,isDirectory:true});
                        traverseDir(path.join(__dirname,currentpath),path.join(__dirname,currentpath,'/'));
                        res.send({mess: "ok", files : repo_files });
                        repo_files= [];
                    }catch(error){
                        console.error(err);
                        res.send({err: "Something went wrong with the paste.Please try to reload the Project from the Project session."});
                    }    
                });
            }
        }else{  
            res.send({err: "The source file that was to copy doesn't exist"});
        }
      });

});

app.post('/api/Fork', (req,res)=>{

    User.findOne({username: req.body.username})
    .exec((error , user) => {

        if(error){
            console.log("MongoDB Error ",error);
            res.send({err: "Error with the database.Please try again in a minute."});
        }

        if(user){

            try{

                let folderpath= "/Projects/"+ req.body.username + "/myProject/Project_" + (user.num + 1);
               
                fs.mkdirSync(path.join(__dirname,folderpath),{recursive:true});

                folderpath= folderpath+"/" +req.body.project_path.split('/')[req.body.project_path.split('/').length-1];
        
                User.findOneAndUpdate({username: req.body.username},{num:user.num + 1},(error)=> {  
                   
                    if(error){
                        console.log(error);
                        res.send({err: error});
                    }
                    else{
                        const srcpath= "/Projects/"+ req.body.hostname +"/" +req.body.project_path;

                        fse.copy(path.join(__dirname,srcpath), path.join(__dirname,folderpath),function (err)  {
                            if (err) {
                                console.error(err);
                                res.send({err: "Error when forking the Project.Please try again."});
                                return;
                            }else{
                                res.send({mess: "ok"});
                            }
                    
                        });
                    }
            
                });
        
            }catch{
                let err= "Error with creating the forked project";
                console.log(err);
                res.send({err: err});
            }   
             
        }
        else{
            console.log("Couldn't find user in database",error);
            res.send({err: "Couldn't find user in database.Please try again in a minute."});
        } 
    });
});

const addFilesFromDirectoryToZip = async(directoryPath,originalpath, zip) => {
 
    const directoryContents = fs.readdirSync(directoryPath, {withFileTypes: true,});
   
    directoryContents.forEach(({ name }) => {


      const path = `${directoryPath}/${name}`;
      let newfpath=`${directoryPath}/${name}`.replace(originalpath,'');

      if (fs.statSync(path).isFile()) {
        zip.file(newfpath, fs.readFileSync(path, "utf-8"));
      }
  
      if (fs.statSync(path).isDirectory()) {
        addFilesFromDirectoryToZip(path,originalpath,zip);
      }
    });
  };

  const generateZipForPath = async (directoryPath,originalpath) => {

    const jsZip = new jszip();
  
    addFilesFromDirectoryToZip(directoryPath,originalpath,jsZip);
  
    const zipAsBase64 = await jsZip.generateAsync({ type: "base64" });
  
    return zipAsBase64;
  };

  app.post('/api/ZipDownload', async(req,res)=>{

    const filepath= "/Projects/"+ req.body.username + "/" + req.body.path;

    const temp=req.body.path.split("/");

    let newpath=temp[0];
    for(var i=1;i<temp.length;i++){
        if(i===temp.length-1){
            newpath=newpath+"/";
        }else{
            newpath=newpath+"/"+temp[i];
        }
    }
    const originalpath= "/Projects/"+ req.body.username + "/" + newpath;

    const zip = await generateZipForPath(path.join(__dirname,filepath),path.join(__dirname,originalpath));
   
    res.send({mess: true,zip:zip});

});



const fct = async (zip_path, folder_path,res) =>{
    const data = fs.readFileSync(zip_path);

    const jsZip = new jszip();

    const result = await  jsZip.loadAsync(data);
    
    const keys=Object.keys(result.files);

    const newfiles =[];
    for(let key of keys){
        const item=result.files[key];
       
        //I remove the "/" if it appears at the end of the item.name for the addNewFiles in Explore.js
        if(item.name.split("/")[item.name.split("/").length-1] === ""){
            newfiles.push({name: item.name.slice(0,-1),isDirectory: item.dir});
        }
        else{
            newfiles.push({name: item.name,isDirectory: item.dir});
        }
        
        if(item.dir){
            fs.mkdirSync(path.join(__dirname,folder_path+"/"+item.name));
        }else{
            fs.writeFileSync(path.join(__dirname,folder_path+"/"+item.name),Buffer.from(await item.async('arraybuffer')))
        }
    }
    res.send({newfiles: newfiles});
}

app.post('/api/ZipUpload', (req,res)=>{
   
    const filepath= "/Projects/"+ req.body.username + "/" + req.body.path;

    fs.writeFileSync(path.join(__dirname,filepath),req.body.content,"base64");

    fct(path.join(__dirname,filepath),"/Projects/"+ req.body.username + "/" + req.body.folder_path,res);
    
    fs.unlinkSync(path.join(__dirname,filepath));

    console.log('File deleted!');

});

app.post('/api/GetContent', (req,res)=>{
   
    const filepath= "/Projects/"+ req.body.username + "/" + req.body.path;
    var data = fs.readFileSync(path.join(__dirname,filepath),"utf-8");
    res.send({content: data});

});

app.post('/api/Rename', (req,res)=>{
   
    const oldfilepath= "/Projects/"+ req.body.username + "/" + req.body.oldpath;
    const newfilepath= "/Projects/"+ req.body.username + "/" + req.body.newpath;

    try {

        fs.exists(path.join(__dirname,newfilepath), exists => {
            if(exists){
                console.log("This name already exists");
                res.send({rename: false,error: "This name already exists in the same folder."});
            }else{
                fs.renameSync(path.join(__dirname,oldfilepath), path.join(__dirname,newfilepath));
                console.log("Successfully renamed the directory.");
                res.send({rename: true});
            }
          });

      } catch(err) {
        console.log(err);
        res.send({rename: false,error: err});
      }

});

let repo_files= [];
function traverseDir(dir,rename_dir) {
    
    fs.readdirSync(dir).forEach(file => {
      let fullPath = path.join(dir, file);
      if(!fullPath.includes(".git")){
       
        if (fs.lstatSync(fullPath).isDirectory()) {
            fname = fullPath.replaceAll(rename_dir,'');
            fname=fname.replaceAll('\\', '/');
            repo_files.push({name:fname,isDirectory:true});
            traverseDir(fullPath,rename_dir);
        } else {
            fname = fullPath.replaceAll(rename_dir,'');
            fname=fname.replaceAll('\\', '/');
            repo_files.push({name:fname,isDirectory:false});
        }
     }
    });
  }

async function repo (req,res){

    let repo_fname=req.body.repolink.split('/')[req.body.repolink.split('/').length-1];
    repo_fname= repo_fname.replaceAll('.git', '');
    const currentpath= "/Projects/"+ req.body.username + "/" + req.body.path;
    const repolink = req.body.repolink.replace("//","//"+req.body.token+"@");

    fs.exists(path.join(__dirname,currentpath,repo_fname),async exists => {
        if(exists){
            //git pull here
            const git = simpleGit({ baseDir: path.join(__dirname,currentpath,repo_fname) });

            git.listRemote(['--get-url'], (err, data) => {
                if (err) {
                   console.log(err);
                }
                else{
                    if(data.includes(repolink) || data.includes(repolink.slice(0,-4))){                           
                            git.pull(req.body.token, req.body.branch,['--verbose','--rebase','--autostash'])
                            .then(()=>{
                                console.log('Pulling Repo finished\n');

                                repo_files.push({name:repo_fname,isDirectory:true});
                                traverseDir(path.join(__dirname,currentpath,repo_fname),path.join(__dirname,currentpath,'/'));
                                res.send({mess: "ok",repo_files : repo_files });
                                repo_files= [];
                            })
                            .catch((err) => {
                                console.error('failed: ', err);
                                res.send({err : "The pulling of the repo failed.Please try again."});
                            });  
                    }else{
                            git.init()
			    .addRemote("origin", repolink)
                            .pull("origin", req.body.branch)
			    .addRemote(req.body.token, repolink)
                            .then(()=>{
                                console.log('Pulling Repo finished\n');

                                repo_files.push({name:repo_fname,isDirectory:true});
                                traverseDir(path.join(__dirname,currentpath,repo_fname),path.join(__dirname,currentpath,'/'));
                                res.send({mess: "ok",repo_files : repo_files });
                                repo_files= [];
                            })
                            .catch((err) => {
                                console.error('failed: ', err);
                                res.send({err : "The pulling of the repo failed.Please try again."});
                            });  
                    }
                }
             });
        }else{
            try{
                fs.mkdirSync(path.join(__dirname,currentpath,repo_fname),{recursive:true});

                const git = simpleGit({ baseDir: path.join(__dirname,currentpath,repo_fname) });
                const  options = ["--single-branch", "--branch" , req.body.branch,'--depth', '1'];

                git.clone(repolink, path.join(__dirname,currentpath,repo_fname),options)
                .addRemote(req.body.token, repolink)
                .then(() => {
                    console.log('Cloning Repo finished\n');
                    repo_files.push({name:repo_fname,isDirectory:true});
                    traverseDir(path.join(__dirname,currentpath,repo_fname),path.join(__dirname,currentpath,'/'));
                    res.send({mess: "ok",repo_files : repo_files });
                    repo_files= [];
                })
                .catch((err) => {
                    console.error('failed: ', err);
                    res.send({err : "The cloning of the repo failed.Please try again."});
                });
               
            }catch{
                let err= "Error with creating folder"+ folderpath;
                console.log(err);
                res.send({err: err});
            }   
        }
      });


}

app.post('/api/CloneRepo', (req,res)=>{  
    repo(req,res) ;
});


app.post('/api/PushRepo',async (req,res)=>{  
    const currentpath= "/Projects/"+ req.body.username + "/" + req.body.path;
     
    const git = simpleGit({ baseDir: path.join(__dirname,currentpath) });

    git.listRemote(['--get-url'], (err, data) => {
        if (err) {
           console.log(err);
        }
        else{
            if(data.includes( req.body.repolink) || data.includes( req.body.repolink.slice(0,-4))){
                User.findOne({git_user: req.body.git_username})
                .exec((error,user) => {
                    git.addConfig('user.email',user.git_email)
                    .addConfig('user.name',user.git_user)
                    .add('./*')
                    .commit(req.body.commit_msg)
                    .push(req.body.token, req.body.branch,["--set-upstream","--force"])
                    .then(()=>{
                        console.log('Pushing to Repo finished\n');
                        res.send({mess: "ok"});
                        
                    })
                    .catch((err) => {
                        console.error('failed: ', err);
                        res.send({err : "The push to the repo failed.Please try again."});
                    });
                })

            }else{
                User.findOne({git_user: req.body.git_username})
                .exec((error , user) => {
                    git.init()
		    .addRemote(req.body.token, req.body.repolink)
                    .addConfig('user.email',user.git_email)
                    .addConfig('user.name',user.git_user)
                    .add('./*')
                    .commit(req.body.commit_msg)
                    .push(req.body.token, req.body.branch,["--set-upstream","--force"])
                    .then(()=>{
                        console.log('Pushing to Repo finished\n');
                        res.send({mess: "ok"});
                        
                    })
                    .catch((err) => {
                        console.error('failed: ', err);
                        res.send({err : "The push to the repo failed.Please try again."});
                    });
                })

            }
        }
     });

});

app.post('/api/DeleteFile', (req,res)=>{
   
    const filepath= "/Projects/"+ req.body.username + "/" + req.body.path;

    try {
        fs.unlinkSync(path.join(__dirname,filepath));
        res.send({mess: "ok"});
        console.log("File is deleted.");
    } catch (error) {
        console.log(error);
        res.send({err: "Error with deleting the file.Please try again."});
    }
    
});

app.post('/api/DeleteFolder', (req,res)=>{
   
    const filepath= "/Projects/"+ req.body.username + "/" + req.body.path;

    fs.rm(path.join(__dirname,filepath), { recursive: true },(err) =>{
        if(err){
            console.log(error);
            res.send({err: "Error with deleting the folder.Please try again."});
            return;
        }
        res.send({mess: "ok"});
        console.log('Folder is deleted.');
    });

});

async function getAccessToken({ code, client_id, client_secret }) {
    const request = await axios.post("https://github.com/login/oauth/access_token", 
    JSON.stringify({
        client_id,
        client_secret,
        code
      }),{
      headers: {
        "Content-Type": "application/json"
    }}).catch(err => console.log(err));

    const params = new URLSearchParams(request.data);
    return params.get("access_token");
  }
  
  async function fetchGitHubUser(token) {
    const request = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: "token " + token
      }
    });
    return await request.data;
  }

  async function fetchGitHubUserEmail(token) {
    const request = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: "token " + token
      }
    });
    return await request.data;
  }

app.post("/api/GitSignIn", async (req, res) => {
    
    const code = req.body.code;
    const access_token = await getAccessToken({ code, client_id, client_secret });
    let git_user = await fetchGitHubUser(access_token);


    if (git_user) {
	
	if(git_user.email===null){
		let git_user_email = await fetchGitHubUserEmail(access_token);
    	        git_user_email = git_user_email.filter(i => i.primary !== false);
		git_user.email = git_user_email[0].email;
	           
	}


        
        User.findOne({git_user: git_user.login})
        .exec((error , user) => {

            if(error){
                console.log("Github Error ",error);
                res.send({err: "Error with sign in with Github.Please try again."});
            }

            if(user){
                if(!user.confirmed && (user.email === git_user.email)){
                    User.findByIdAndUpdate( user._id, { confirmed: true },{new:true})
                    .catch(err => {
			console.log(err);
			 res.send({err: "Error with updating the user email info of the user.Please try again."});
		    });
                }
                res.send({ username : user.username,access_token : access_token ,git_username: git_user.login});
            }
            else{
                User.findOne({username: git_user.login})
                .exec((error , user) => {

                    if(error){
                        console.log("Github Error ",error);
                        res.send({err: "Error with sign in with Github.Please try again."});
                    }

                    if(!user){
                        User.findOne({email: git_user.email})
                        .exec((error , user) => {
                            if(error){
                                console.log("Github Error ",error);
                                res.send({err: "Error with sign in with Github.Please try again."});
                            }

                            if(!user){
                                const signedUpUser = new User({
                                    username: git_user.login,
                                    password: "",
                                    previous_project: "",
                                    num: 0,
                                    email: git_user.email,
                                    confirmed: true,
                                    git_user: git_user.login,
                                    git_email: git_user.email,
                                });
                    
                                signedUpUser.save()
                                .then((newUser) => {
                                    const folderpath= "/Projects/"+ git_user.login +"/myProject";
                                    fs.mkdirSync(path.join(__dirname,folderpath),{recursive:true});
                                    res.send({ username : newUser.username,access_token : access_token ,git_username: git_user.login});
                                    return;
                                })
                                .catch(error =>{
                                    console.log(error);
				    res.send({err: "Error with creating new user with Github.Please try again."});
                                });
                            }
                            else{
                                
                                User.findByIdAndUpdate( user._id, { confirmed: true,git_user: git_user.login, git_email: git_user.email, },{new:true})
                                .catch(err =>{ 
				console.log(err);
				res.send({err: "Error with updating the Github info of the user.Please try again."});
				});
        
                                res.send({ username : user.username,access_token : access_token ,git_username: git_user.login});
                                

                            }
                        });
        
                       
                    }
                    else{
                        if(user.email === git_user.email){
                            User.findByIdAndUpdate( user._id, { confirmed: true,git_user: git_user.login, git_email: git_user.email, },{new:true})
                            .catch(err => {
				console.log(err);
				res.send({err: "Error with updating the Github info of the user.Please try again."});
			   });

                            res.send({ username : user.username,access_token : access_token, git_username: git_user.login});
                        }
                        else{
                            //same username diff emails
                            res.send({err: "The username of your Github profile is already registered in this app.Please try to Sign Up first."});
                        }
                    }
                });
            }
        });
    } else {
      
      console.log("Login did not succeed!");
      res.send({err:"Login did not succeed.Try again!"});
    }
  });

  app.post("/api/ConnectGit", async (req, res) => {
    
    const code = req.body.code;
    const access_token = await getAccessToken({ code, client_id, client_secret });
    const git_user = await fetchGitHubUser(access_token);

    if (git_user) {

        if(git_user.email===null){
                let git_user_email = await fetchGitHubUserEmail(access_token);
                git_user_email = git_user_email.filter(i => i.primary !== false);
                git_user.email = git_user_email[0].email;

        }
        
        User.findOne({username: req.body.username})
        .exec((error , user) => {

            if(error){
                console.log("Github Error ",error);
                res.send({err: "Error with connecting with Github.Please try again."});
            }

            if(user){
                if(!user.git_user){
                    User.findByIdAndUpdate( user._id, {git_user:git_user.login, git_email:git_user.email},{new:true})
                    .catch(err => {
			console.log(err);
		 	res.send({err: "Error with updating Github info.Please try again."});
		    });
                }

                if(!user.confirmed && (user.email === git_user.email)){
                    User.findByIdAndUpdate( user._id, { confirmed: true },{new:true})
                    .catch(err =>{
			 console.log(err);
			res.send({err: "Error with updating Github info.Please try again."});
	            });
                }
                res.send({access_token : access_token ,git_username: git_user.login});
            }else{
		res.send({err: "Error with the Database.Please try again."});
           }
            
        });
    } else {
      
      console.log("Connect did not succeed!");
      res.send({err:"Connect did not succeed.Try again!"});
    }
  });

  app.post("/api/GetPreviousProject", (req, res) => {
        
        User.findOne({username: req.body.username})
        .exec((error , user) => {

            if(error){
                console.log("MongoDB Error ",error);
                res.send({err: "Error with the database.Please try again in a minute."});
            }

            if(user){
                if(!user.previous_project){
                    res.send({files :[]});
                }
                else{
                    const currentpath="/Projects/"+ user.username + "/myProject/"+ user.previous_project;
                    repo_files= [];
                    try{
                        repo_files.push({name:user.previous_project,isDirectory:true});
                        traverseDir(path.join(__dirname,currentpath),path.join(__dirname,currentpath,'/'));
                        res.send({files : repo_files });
                        repo_files= [];
                    }catch(error){
                        res.send({err: "Error loading the previous Projects"});
                    }  
                }

            }
            else{
                console.log("Couldn't find user in database",error);
                res.send({err: "Couldn't find user in database.Please try again in a minute."});
            } 
        });
    
  });

  app.post("/api/NewEmptyProject", (req, res) => {
    console.log(req.body.username,req.body.project_name);
    User.findOne({username: req.body.username})
    .exec((error , user) => {

        if(error){
            console.log("MongoDB Error ",error);
            res.send({err: "Error with the database.Please try again in a minute."});
        }

        if(user){

            let folderpath= "/Projects/"+ req.body.username + "/myProject/Project_" + (user.num + 1);
            if(req.body.project_name){
                folderpath= folderpath+"/"+ req.body.project_name;
            }

            try{
                fs.mkdirSync(path.join(__dirname,folderpath),{recursive:true});
        
                User.findOneAndUpdate({username: req.body.username},{num:user.num + 1},(error, result)=> {  
                   
                    if(error){
                        console.log(error);
                        res.send({err: error});
                    }
                    else{
                        res.send({mes: "ok",number:user.num + 1});
                    }
            
                });
        
            }catch{
                let err= "Error with creating folder"+ folderpath;
                console.log(err);
                res.send({err: err});
            }   
             
        }
        else{
            console.log("Couldn't find user in database",error);
            res.send({err: "Couldn't find user in database.Please try again in a minute."});
        } 
    });

    

});

app.post("/api/AllProject", (req, res) => {

    const folderpath=path.join(__dirname, "/Projects/"+ req.body.username + "/myProject/");
    let projects=[];
    try{
        fs.readdirSync(folderpath).forEach(file => {
            let fullPath = path.join(folderpath, file);   
            if (fs.lstatSync(fullPath).isDirectory()) {
                fs.readdirSync(fullPath).forEach(child => {
                        let childrenPath = path.join(fullPath, child);   
                        if (fs.lstatSync(childrenPath).isDirectory()) {      
                            projects.push({name:child,parent:file,last_modified:fs.lstatSync(childrenPath).mtime});
                        }  
                    });
            }
        });
        res.send({mess: "ok",projects: projects});

    }catch(error){
        res.send({err: "Error finding the Projects"});
    }   
     
});

app.post("/api/OneProject", (req, res) => {

    const currentpath="/Projects/"+ req.body.username + "/myProject/"+ req.body.project;
    repo_files= [];
    try{
        repo_files.push({name:req.body.project,isDirectory:true});
        traverseDir(path.join(__dirname,currentpath),path.join(__dirname,currentpath,'/'));
        res.send({mess: "ok",files : repo_files });
        repo_files= [];
    }catch(error){
        res.send({err: "Error finding the Projects"});
    }   
     

});

app.post('/api/SaveCurrentProject', (req,res)=>{

    User.findOneAndUpdate({username: req.body.username},{previous_project: req.body.previous_project},(error, result)=> {  
          
        if(error){
            console.log(error);
            res.send({err: error});
        }
        else{
            res.send({mess: "ok"});
        }

    });

});


app.post("/api/DeleteProject", (req, res) => {

    const currentpath="/Projects/"+ req.body.username + "/myProject/"+ req.body.project;

    fs.rm(path.join(__dirname,currentpath), { recursive: true },(err) =>{
        if(err){
            console.log(err);
            res.send({err: "Error with deleting the Project.Please try again."});
            return;
        }

        User.findOne({username: req.body.username})
        .exec((error , user) => {

            if(error){
                console.log("MongoDB Error ",error);
                res.send({err: "Error with the database.Please try again in a minute."});
            }

            if(user){
                if((user.previous_project) && (user.previous_project===req.body.project)){
                   
                    User.findOneAndUpdate({username: req.body.username},{previous_project: null},(error)=> {  
                       
                        if(error){
                            console.log("MongoDB Error update files" ,error);
                            res.send({err: error});
                            return;
                        }
   
                    });
                }

                res.send({mess: "ok"});
                console.log('Folder/Project is deleted.');
            
            }
            else{
                console.log("The database has  crushed",error);
                res.send({err: "The database has crushed.Please try again in a minute."});
            } 
        });

    });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
