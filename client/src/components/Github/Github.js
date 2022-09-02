import React, { useState,useRef,useEffect } from 'react';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {setCurrent,setGitUsername,setGitToken,setCode,setWritting,setFcode} from '../../redux/actions'
import Close from '../FileTree/images/purple_close.png';
import Axios  from "axios";
import Switch from "react-switch"; 
import LoginGithub from 'react-login-github';
import LoadingSpinner from "../Spinner/Spinner";
import "./Github.css"



function  Github() {

    const ENDPOINT = 'https://oncodeeditor.com/api';

    const [github_modal, setCollabModal] = useState(false);
    const [clone_form, setCloneForm] = useState(true);
    const [push_form, setPushForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("");
    const [errorM, setErrorM]= useState("");
    const [push_repo, setPushRepo] = useState("");
    const [push_branch, setPushBranch] = useState("");
    const [commit_msg, setCommitMsg] = useState("");
    const current = useSelector(state => state.current);
    const hostname = useSelector(state => state.hostname);
    const username = useSelector(state => state.username);
    const host = useSelector(state => state.host);
    const token = useSelector(state => state.token);
    const git_username = useSelector(state => state.git_username);
    const dispatch =useDispatch();
    const errRef = useRef();

    useEffect(() => {
      setErrorM('');
  }, [repo, branch,current,clone_form,push_form,push_repo,push_branch,commit_msg])

    const toggleGithubModal = () => {
        setIsLoading(false);
        setCollabModal(!github_modal);
    };

    function addNewFiles(newfiles, pos, currentDir, originalDir){

        if(currentDir.name !== newfiles[pos].name.split("/")[newfiles[pos].name.split("/").length-2]){ 
          if(newfiles[pos].name.split("/").length === 2 ){
           currentDir=originalDir;
          }
          else{
            let tempDir = originalDir;
            for(let i=1; i < newfiles[pos].name.split("/").length ;i++){
              tempDir.children.every(child => {
                
                if(child.name === newfiles[pos].name.split("/")[i]){
                   tempDir =  child;
                   return false;
                }
  
                return true;
    
              });
            }
            currentDir=tempDir;
          }
        }
  
        currentDir.addItem(newfiles[pos].name.split("/")[newfiles[pos].name.split("/").length-1],newfiles[pos].isDirectory);
        
  
        if(pos+1 === newfiles.length){
          return ;
        }
        if(newfiles[pos].isDirectory && newfiles[pos+1].name.includes(newfiles[pos].name)){
          addNewFiles(newfiles,pos+1,currentDir.children[currentDir.children.length-1],originalDir);
        }
        else{
          addNewFiles(newfiles,pos+1,currentDir,originalDir);
        }
    }

    const cloneRepo = (event)=>{
    
      if(repo === "" || branch === ""){
        setErrorM("Both fields must be filled.");
        return;
      }
      else if(!current.isDirectory){
        setErrorM("Your current file isn't a folder.Press the folder that you want the repo to clone and try again.");
        return;
      }
      else{
        setIsLoading(true);
        Axios.post(ENDPOINT+"/CloneRepo",{
          username: hostname,
          git_username: git_username,
          path: current.path ,
          repolink: repo,
          branch : branch,
          token: token,
        }).then((response) => {
          if(response.data.mess){
              dispatch( setFcode(undefined)); 
              dispatch( setCode(""));
              dispatch(setWritting(true));
              current.children = current.children.filter(i => i.name !== response.data.repo_files[0].name);
              current.addItem(response.data.repo_files[0].name,response.data.repo_files[0].isDirectory);
              if(response.data.repo_files.length > 1){
                addNewFiles(response.data.repo_files,1,current.children[current.children.length - 1],current.children[current.children.length - 1]);
              }
              dispatch( setCurrent(current.children[current.children.length - 1]));
              toggleGithubModal();
          }
          else{
            setIsLoading(false);
            setErrorM(response.data.err);
            return;
          }
          
        });
      
      }
    };

    const pushRepo = (event)=>{

      if(!host){
        setErrorM("Only the host can push the Project");
        return;
      }

   
      if(push_repo === "" || push_branch === "" || commit_msg === ""){
        setErrorM("All fields must be filled.");
        return;
      }
      else if(!current.isDirectory){
        setErrorM("Your current file isn't a folder.Press the folder that you want push to your repo and try again.");
        return;
      }
      else{
        setIsLoading(true);
        let push_repo_link="https://"+token+"@github.com/"+git_username+"/"+ push_repo;
        console.log(push_repo_link);
        Axios.post(ENDPOINT+"/PushRepo",{
          username: hostname,
          git_username: git_username,
	  token: token,
          path: current.path ,
          repolink: push_repo_link,
          branch : push_branch,
          commit_msg: commit_msg
        }).then((response) => {
          if(response.data.mess){
            toggleGithubModal();
          }
          else{
            setIsLoading(false);
            setErrorM(response.data.err);
            return;
          }
          
        });
      
      }
    };

    const cloneOrPush = (event) => {
      event.preventDefault();
      if(clone_form){
        cloneRepo(event);
      }
      else if(push_form){
        pushRepo(event);
      }
    };

    const onSuccess = (response) =>{
      setIsLoading(true);
      setErrorM("");
      Axios.post(ENDPOINT+"/ConnectGit",{
        code: response.code,
        username: username
      }).then((response) => {
        
        if(response.data.err){
          setErrorM(response.data.err);
          setIsLoading(false);
        }
        else{
          dispatch(setGitToken(response.data.access_token));
          setIsLoading(false);
          dispatch(setGitUsername(response.data.git_username));
        }
  
    });
    };
  
    const onFailure = response => console.error(response);

    if(github_modal){
        document.body.classList.add('active-github')
    }else {
        document.body.classList.remove('active-github')
    }


    return(
     <>
        <li className='nav-item' onClick={()=>{document.getElementById("menu-btn").checked = false;}}>
            <div className='nav-divs' onClick={toggleGithubModal}>
                Github
            </div>
        </li>
        {github_modal && (
              <div className="github">
                  <div  onClick={toggleGithubModal} className="collab_overlay"></div>
                      <div className="github-content">
                        <div className="github-header-title">
                            <p className="github-title"> Github</p> 
                            <img className="close-github-modal" src={Close}  alt="e" onClick={toggleGithubModal}/>
                        </div>
                        {!token?(<>  {isLoading? <LoadingSpinner /> :
                          <>
                            <div className='err_clone_container'>
                                <p ref={errRef} className={ errorM ? "errormsg" : "offscreen"}>{errorM}</p>
                            </div> 
                            <p className="git_details">You have to connect your account with Github,<br></br>
                             If you want to use the Github features.</p>
                            <div className="container-contact100-form-btn">
                              <LoginGithub clientId="7d69389b686ae7fdc4d1"
                                  className="git-btn"
                                  scope="user,repo"
                                  onSuccess={onSuccess}
                                  onFailure={onFailure}
                                  buttonText="Connect your Github"
                              />
                            </div>
                         
                        </>}</>):( <>  {isLoading? <LoadingSpinner /> :(
                          <> 
                   <form  className="clone100-form validate-form" onSubmit={cloneOrPush}>
                   <div className="clone100-header" >
                     <span className="clone100-form-title">
                       Clone your Repository
                     </span>
                     <Switch
                         className='clone-switch'
                         onChange={()=>{setCloneForm(!clone_form);setPushForm(false);}} 
                         checked={clone_form}
                         height = {16}
                         width = {40}
                         id="switch-git-1"
                     />
                     </div>
                     {clone_form && ( <>
                     
                     <div className='err_clone_container'>
                           <p ref={errRef} className={ errorM ? "errormsg" : "offscreen"}>{errorM}</p>
                     </div> 
                     <div className="wrap-inputclone100 " >
                          <p className="clone_details">In order clone to work the link must be <strong>valid</strong>.
                          The repo will be cloned in the <strong>current</strong> directory.If the repo 
                          already exists in the <strong>current</strong> directory ,then it will <strong>pull</strong> the changes.</p>
                     </div>

                   <div className="wrap-inputclone100 validate-input" data-validate = "Repo is required">
                     <input className="inputclone100" type="text" name="repo" placeholder="Repository link" value={repo} onChange={(e) =>{setRepo(e.target.value);}} requierd="true"/>
                     <span className="focus-inputclone100"></span>
                   </div>

                   <div className="wrap-inputclone100 validate-input" data-validate = "Branch is required">
                     <input className="inputclone100" type="text" name="branch" placeholder="Branch Name" value={branch} onChange={(e) =>{setBranch(e.target.value);}} requierd="true"/>
                     <span className="focus-inputclone100"></span>
                   </div>  
                   <div className="container-clone100-form-btn">
                     <button className="clone100-form-btn"  >
                         Clone
                     </button>
                   </div></>)}

                   <div className="clone100-header" >
                     <span className="push100-form-title">
                       Push your Project
                     </span>
                     <Switch
                         className='clone-switch'
                         onChange={()=>{setPushForm(!push_form);setCloneForm(false);}} 
                         checked={push_form}
                         height = {16}
                         width = {40}
                         id="switch-git-1"
                     />
                     </div>
                     {push_form && ( <>
                     <div className='err_push_container'>
                           <p ref={errRef} className={ errorM ? "errormsg" : "offscreen"}>{errorM}</p>
                     </div> 
                     <div className="wrap-inputclone100 " >
                          <p className="clone_details">In order push to work the repo and branch must <strong>exist</strong>.
                          The app will push only the files that are under the <strong>current</strong> directory.
			  If your email on Github is<strong> private</strong> you need to uncheck the option block command line pushes under the email settings</p>
                     </div>

                   <div className="wrap-inputclone100 validate-input" data-validate = "Repo is required">
                     <input className="inputclone100" type="text" name="push_repo" placeholder="Repository name" value={push_repo} onChange={(e) =>{setPushRepo(e.target.value);}} requierd="true"/>
                     <span className="focus-inputclone100"></span>
                   </div>

                   <div className="wrap-inputclone100 validate-input" data-validate = "Branch is required">
                     <input className="inputclone100" type="text" name="push_branch" placeholder="Branch Name" value={push_branch} onChange={(e) =>{setPushBranch(e.target.value);}} requierd="true"/>
                     <span className="focus-inputclone100"></span>
                   </div>
                   <div className="wrap-inputclone100 validate-input" data-validate = "Branch is required">
                     <textarea className="inputclone100" type="text" name="commit_msg" placeholder="Commit Message" value={commit_msg} onChange={(e) =>{setCommitMsg(e.target.value);}} requierd="true"/>
                     <span className="focus-inputclone100"></span>
                   </div>   
                   <div className="container-clone100-form-btn">
                     <button className="clone100-form-btn"  >
                         Push
                     </button>
                   </div></>)}

                   </form> 
                   </>)}</> ) }
                       
                    </div> 
              </div>)}
                        
    </>

    );
}

export default  Github;
