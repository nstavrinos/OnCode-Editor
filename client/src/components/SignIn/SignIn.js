import React, { useState,useEffect,useRef } from "react";
import Axios  from "axios";
import "./SignIn.css";
import {setUsername,setLoggedIn,setGitToken,setGitUsername} from '../../redux/actions';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import Close from '../FileTree/images/purple_close.png';
import LoginGithub from 'react-login-github';
import LoadingSpinner from "../Spinner/Spinner";

const USER_REGEX = /^.{4,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^(?=.*[A-z])(?=.*[@])(?=.*[.]).{7,40}$/;

function SignIn() {

    const ENDPOINT = 'https://oncodeeditor.com/api';

    const errRef = useRef();
    const [sign_modal, setSignModal] = useState(false);
    const [sign, setSign] = useState(true);

    const [username,setUserName]=useState("");
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [password,setPassword]=useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);   

    const [matchPwd, setMatchPwd] = useState("");
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [email,setEmail]=useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);
    
    const [errMsg, setErrMsg] = useState("");

    const dispatch =useDispatch();
    //// PUT IT IN PLACE 
    const loggedIn = useSelector(state => state.loggedIn);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      let user=sessionStorage.getItem("username");
      
      if(user){
        dispatch(setUsername(user));
        dispatch(setLoggedIn(true));
        let token =sessionStorage.getItem("token");
        if(token){
          dispatch(setGitToken(token));
          dispatch(setGitUsername( sessionStorage.getItem("git_username")));
        }
      }
  
    }, [])

  useEffect(() => {
      setValidName(USER_REGEX.test(username));
  }, [username])

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
}, [email])

  useEffect(() => {
      setValidPwd(PWD_REGEX.test(password));
      setValidMatch(password === matchPwd);
  }, [password, matchPwd])

  useEffect(() => {
    setErrMsg('');
}, [username, email,password, matchPwd])



    const toggleSignModal = () => {
      if(!loggedIn){
        setErrMsg("You have to be Sign In in order to use the app!!!");
      }else{
        setUserName("");
        setPassword("");
        setUserName("");
        setPassword("");
        setMatchPwd("");
        setEmail("");
        setSignModal(!sign_modal);
      }
    };

    const toggleSign = () => {
      setUserName("");
      setPassword("");
      setSign(!sign);
 
    };
  
    if(sign_modal) {
      document.body.classList.add('active-sign_modal')
    } else {
      document.body.classList.remove('active-sign_modal')
    }

   const onSuccess = (response) =>{
    setIsLoading(true);
    setErrMsg("");
   
    Axios.post(ENDPOINT+"/GitSignIn",{
      code: response.code,
    }).then((response) => {
      
      if(response.data.err){
        setErrMsg(response.data.err);
        setIsLoading(false);
      }
      else{
        dispatch(setUsername(response.data.username));
        dispatch(setGitToken(response.data.access_token));
        dispatch(setGitUsername(response.data.git_username));
        dispatch(setLoggedIn(true));
        setIsLoading(false);
        setSignModal(false);
      }   

  });
  };

    const onFailure = (response) => {
      console.error(response);
      setErrMsg("Error when signing in from Github side.Please try again.");
      
    }

    const SignInHandler = (event) =>{

        event.preventDefault();
       
        const v1 = USER_REGEX.test(username);
        const v2 = PWD_REGEX.test(password);
        if (!v1) {
            setErrMsg("Invalid Username");
        }
        else if(!v2){
          setErrMsg("Invalid Password");
        }
        else{
          
            Axios.post(ENDPOINT+"/SignIn",{
              username: username,
              password: password,
            }).then((response) => {
             
              if(response.data.message){          
                setErrMsg( response.data.message);
              }
              else if(response.data.mess==="ok"){
                dispatch(setUsername(username));
                dispatch(setLoggedIn(true));
                setUserName("");
                setPassword("");
                toggleSignModal();
              }
          });
        }
    }

 
    const SignUpHandler = (event) =>{
      event.preventDefault();
      // if button enabled with JS hack
      const v1 = USER_REGEX.test(username);
      const v2 = PWD_REGEX.test(password);
      if (!v1 || !v2) {
          setErrMsg("Invalid Entry");
      }

      Axios.post(ENDPOINT+"/SignUp",{
        username: username,
        password: password,
        email: email
      }).then((response) => {
   
        if(response.data.message){
          setErrMsg(response.data.message);
        }
        else if(response.data.success){ 
          setUserName("");
          setPassword("");
          setMatchPwd("");
          setEmail("");
          toggleSign();
          setErrMsg(response.data.success);
        }
      });
  }

  return(   
    
    <div>
    {(!loggedIn || sign_modal) && (
    <div className="sign_modal">
      <div onClick={toggleSignModal} className="sign_overlay"></div>
     
      {sign ? ( 
        <div className="contact-content">
           <img className="close-modal" src={Close}  alt="e" onClick={toggleSignModal}/>
         <form className="contact100-form validate-form" onSubmit={SignInHandler}>
              <span className="contact100-form-title">
                Sign In
              </span>
              {isLoading? <LoadingSpinner /> :(<>
              <div >
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
              </div> 
            
              <div className="wrap-input100 validate-input" data-validate = "Name is required">
                  <input className="input100" type="text" name="username" value={username} required  id="username" placeholder="Username" onChange={(e) =>{setUserName(e.target.value);}}/>
                  <span className="focus-input100"></span>
              </div>

              <div className="wrap-input100 validate-input" data-validate = "Name is required">
                  <input className="input100" type="password"  placeholder="Password" name="password" value={password} required id="password" onChange={(e) =>{setPassword(e.target.value);}}/>
                  <span className="focus-input100"></span>
              </div>
  
              <div className="container-contact100-form-btn">
                  <button className="contact100-form-btn" disabled={!username || !password ? true : false} >
                    Sign In
                  </button>
                </div>
                <p className="form_footer">Or</p>
                <div className="container-contact100-form-btn">
                <LoginGithub clientId="7d69389b686ae7fdc4d1"
                    className="contact100-form-btn"
                    scope="user,repo"
                    onSuccess={onSuccess}
                    onFailure={onFailure}
                 />
                 </div>
              <p className="form_footer">You don't have an account <span onClick={toggleSign}>Sign Up</span></p>
              </>)}
          </form>
          </div>
          
          )


          : (  
            <div className="contact-content">
             <img className="close-modal" src={Close}  alt="e" onClick={toggleSignModal}/>
          <form className="contact100-form validate-form"  onSubmit={SignUpHandler}>
              <span className="contact100-form-title">
                Sign Up
              </span>
              <div >
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
              </div> 

              <div className="wrap-input100 validate-input">
                  <input 
                    className="input100"
                    type="text"
                    name="username" 
                    id="username" 
                    value={username}
                    required 
                    autoComplete="off" 
                    placeholder="Username"
                    onChange={(e) =>{setUserName(e.target.value);}}
                    aria-invalid={validName ? "false" : "true"}
                    aria-describedby="usernote"
                    onFocus={() => setUserFocus(true)}
                    onBlur={() => setUserFocus(false)}
                    />
                  <span className="focus-input100"></span>
                  <p id="usernote" className={userFocus && username && !validName ? "instructions" : "offscreen"}>
                        4 to 24 characters.
                  </p>
              </div>

              <div className="wrap-input100 validate-input">
                <input 
                  className="input100"
                  type="email" 
                  name="email" 
                  id="email"
                  placeholder="Email"
                  value={email}
                  required 
                  autoComplete="off" 
                  onChange={(e) =>{setEmail(e.target.value);}}
                  aria-invalid={validName ? "false" : "true"}
                  aria-describedby="emailnote"
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                />
                  <span className="focus-input100"></span>
                  <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                        Must be a valid email.
                  </p>
              </div>

              <div className="wrap-input100 validate-input">
                  <input 
                   className="input100"
                   type="password" 
                   name="password"
                   id="password"
                   placeholder="Password"
                   value={password}
                   required
                   onChange={(e) =>{setPassword(e.target.value);}}
                   aria-describedby="pwdnote"
                   onFocus={() => setPwdFocus(true)}
                   onBlur={() => setPwdFocus(false)}
                   />
                  <span className="focus-input100"></span>
                  <p id="pwdnote" className={pwdFocus && password && !validPwd ? "instructions" : "offscreen"}>
                        8 to 24 characters.<br />
                        Must include uppercase and lowercase letters, a number and a special character.<br />
                        Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                  </p>
              </div>

               <div className="wrap-input100 validate-input">
                  <input 
                   className="input100"
                   type="password" 
                   name="password"
                   id="con_password"
                   placeholder="Confirm Password"
                   value={matchPwd} 
                   required
                   onChange={(e) => setMatchPwd(e.target.value)}
                   aria-invalid={validMatch ? "false" : "true"}
                   aria-describedby="confirmnote"
                   onFocus={() => setMatchFocus(true)}
                   onBlur={() => setMatchFocus(false)}
                   />
                  <span className="focus-input100"></span>
                  <p id="confirmnote" className={matchFocus && matchPwd && !validMatch ? "instructions" : "offscreen"}>
                        Must match the first password input field.
                  </p>
              </div>
              <div className="container-contact100-form-btn">
                  <button className="contact100-form-btn" disabled={!validName || !validPwd || !validMatch ? true : false} >
                      Sign Up
                  </button>
              </div>
              <p className="form_footer">Already have an account <span onClick={toggleSign}>Sign In</span></p>
          </form>
          </div>)}
          
      
    </div>
  )}
  </div>
);

}

export default SignIn;
