import React, { useState } from 'react';
import {setLoggedIn, setUsername,setFiles,setCode, setRoom,setFcode,enableChat,setHost,setAllMessages} from '../../redux/actions';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import Switch from "react-switch";
import Axios  from "axios";

function SignOut() {

    const ENDPOINT = 'https://oncodeeditor.com/api';

    const dispatch = useDispatch();
    const loggedIn = useSelector(state => state.loggedIn);
    const username = useSelector(state => state.username);
    const files = useSelector(state => state.files);
    const room = useSelector(state => state.room);
    const socket = useSelector(state => state.socket);
    const host = useSelector(state => state.host);
    const [dis, setDis] = useState(false);

    const toggleDisconnectSwitch = () => {
        document.getElementById("menu-btn").checked = false;
        Axios.post(ENDPOINT+"/SignOut",{
          username: username,
          previous_project : files[0].children[0].name,
        }).then((response) => {
          if(response.data.mess){
            sessionStorage.clear();
            dispatch(setLoggedIn(false));
            dispatch(setUsername(""));
            if(room){

              if(host){
                socket.emit('disconnect_room', {room: room});
              }
              socket.disconnect();
              dispatch(setRoom(undefined));
              dispatch(enableChat(false));
              dispatch(setAllMessages([]));
    
              if(!host){
                dispatch(setHost(true));
              }
              document.getElementsByClassName("filetree")[0].style.height = "85vh";
            }
           
            setDis(false);
            dispatch( setFiles(undefined));
            dispatch( setCode(""));
            dispatch( setFcode(undefined));
          }
    
        });
      };

    return (
        <>
        {loggedIn && (
              <div className="dropdown">
            <div className='nav-item'>
                <button className="dropbtn">{username}</button>
            </div>
                <div className="dropdown-content">
                  <div className='set-lab' onClick={toggleDisconnectSwitch}>
                      <span className='set-span'>Sign Out</span>
                      <Switch
                          className='set-switch'
                          onChange={()=>{return}} 
                          checked={dis}
                          height = {20}
                          width = {45}
                          id="normal-switch-1"
                      />
                  </div>
              </div>
              </div>
        )}</>

    );
}

export default SignOut;
