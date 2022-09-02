import React,{useEffect,useCallback} from "react";
import Navbar from '../Navbar/Navbar';
import Editor from '../Editor/Editor';
import Files from '../Explorer/Explorer';
import Chat from "../Chat/Chat";
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {enableChat} from '../../redux/actions';
import Messages from '../FileTree/images/messages.png';
import Axios  from "axios";
import "./MainPage.css"

function MainPage() {

  const ENDPOINT = 'https://oncodeeditor.com/api';

  const dispatch =useDispatch();
  const room =useSelector(state => state.room);
  const enable= useSelector(state => state.enableChat);
  const fcode= useSelector(state => state.fcode);
  const code= useSelector(state => state.code);
  const hostname= useSelector(state => state.hostname);

  const handleKeyPress = useCallback((event) => {
    // check if the CTRL + S key is pressed
    if (event.ctrlKey === true && event.key === 's' ) {
      event.preventDefault();
      if(fcode){			
        Axios.post(ENDPOINT+"/CreateFile",{
          username: hostname,
          path: fcode.path ,
          content: code,
        }).then((response) => {
          if(!response.data.mess){
            alert("Couldn't save the file");
           
          }
        });
      }
    }
  }, [fcode,code,hostname]);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    
      <div>
        <Navbar />
        <div className="container"
            style={{
                display: "flex",
            }}
        >

            <div className="files">
              <Files/>
  
 {room && ( < div className="messages" onClick={()=>{dispatch(enableChat(!enable));}}>
                 <p className="mes-title">Messages</p>
                 <img className="mes-icon" src={Messages}  alt="e"/>
              </div>)}
    
    
            </div>
           
            <div  className="right-container" 
                style={{
                  height: "90vh",
                  width: "85%",
                  position: "relative"
                }}
            >

                <div className="editor"
                    style={{
                      height: "90vh",
                      width: "100%",
                    }}
                >
                  
                  <Editor/>
                  
                </div>
            {enable && ( 
                <div className="mess-container">

                    <div className="chat-box"> <Chat/></div>
                </div>)}
            </div>
        </div>
        </div>
      
  );
}

export default MainPage;
