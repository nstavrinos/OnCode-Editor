import React, { useState,useEffect } from 'react';
import {setCode,setRoom, setSocket, setWritting,setFiles,setCurrent,setHost,setMessages, setHostname,setFcode,enableChat,setRenameFlag,setAllMessages} from '../../redux/actions';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import "./Collab.css"
import Switch from "react-switch";  
import io from "socket.io-client";
import FileItem from '../FileItems/FileItems';
import Close from '../FileTree/images/purple_close.png';
import Axios  from "axios";

const ENDPOINT = 'https://oncodeeditor.com/api';
var socketio = io(ENDPOINT,{path:'/api/socket.io',secure: true, transports: ['websocket']
});

function Collab() {

    const [collab_modal, setCollabModal] = useState(false);
    const [collab, setCollab] = useState(false);
    const [endCollab, setEndCollab] = useState(false);
    const [roomlink, setRoomLink] = useState("");
    const [room, setSRoom] = useState("");
    const code= useSelector(state => state.code);
    const fcode = useSelector(state => state.fcode);
    const socket_room =useSelector(state => state.room);
    const username= useSelector(state => state.username);
    const files= useSelector(state => state.files);
    const current= useSelector(state => state.current);
    const socket= useSelector(state => state.socket);
    const writting=useSelector(state => state.writting);
    const host=useSelector(state => state.host);
    const hostname=useSelector(state => state.hostname);
    const rename_flag=useSelector(state => state.rename_flag);
    const messages=useSelector(state => state.messages);
    const [previous, setPrevious] = useState("myProject");
    const [new_member, setNewMember] = useState(false);
    const [fail_join, setFailJoin] = useState(false);

    const dispatch =useDispatch();

    const toggleCollabModal = () => {
        setCollabModal(!collab_modal);
    };

    function makeFiles(newFiles,valFiles,path) {
        valFiles.children.forEach(child => {
            newFiles.addItem(child.name,child.isDirectory);
            if(path === child.path){
                dispatch( setCurrent(newFiles.children[newFiles.children.length-1]));
            }
            if(child.children){
                makeFiles(newFiles.children[newFiles.children.length-1],valFiles.children[newFiles.children.length-1],path);
            }

        });

}

    useEffect(() => {
      
        if(socket_room){
           
        socket.on("fail_join", (fail_msg) => {
            setFailJoin(true);
            alert(fail_msg);
            toggleEndCollab();
        });

        socket.on("fail", (fail_msg) => {
            alert(fail_msg);
            toggleEndCollab();
        });

           
        socket.on("host", () => {
            toggleEndCollab();
        });

        socket.on('message', (values) => {     
            if(username!==values.user){
                dispatch(setCode(values.code));
                dispatch(setFcode(values.fcode));
                dispatch(setWritting(false));
            }
        });

        socket.on('new', () => {
            if(host){
                setNewMember(true);
            }
        });

        socket.on('new_member_only', (values) => {

            if(!host && hostname!==values.hostname){
                dispatch(setHostname(values.hostname));
                dispatch(setWritting(false));
                dispatch(setCode(values.code));
                dispatch(setFcode(values.fcode));
                dispatch(setAllMessages(values.messages));
                setPrevious(values.current.path);

                const F =  [];
                F.push(new FileItem(values.files[0].name,values.files[0].isDirectory,values.files[0].path));
                if(values.files[0].children){
                    makeFiles(F[0],values.files[0],values.current.path);
                }

                dispatch(setFiles(F)); 
                
            }
        });

        socket.on('new_current', (values) => {
            if(username!==values.user){
                setPrevious(values.current.path);
                const F =  [];
                F.push(new FileItem(values.files[0].name,values.files[0].isDirectory,values.files[0].path));
                if(values.files[0].children){
                    makeFiles(F[0],values.files[0],values.current.path);
                }
                dispatch(setFiles(F)); 
            }   
        });
    }

    },[socket_room]);

    useEffect(() => {
        if(new_member && socket_room && host){
            socket.emit('new_member',{room: socket_room,current: current,files: files ,hostname: hostname,code: code ,fcode: fcode ,messages: messages});
            setNewMember(false);
        }

    },[new_member]);

    useEffect(() => {
        if(socket_room && writting){
            socket.emit('code',{room: socket_room, code: code,fcode: fcode , user: username});
        }

    },[writting,code]);

    useEffect(() => {
        
        if(socket_room){
            if((previous!==current.path)){
                setPrevious(current.path);
                socket.emit('current',{room: socket_room,current: current,files: files ,user: username });
                if(rename_flag){
                    dispatch(setRenameFlag(false));
                }
            }
        }

    },[current,rename_flag]);

    function makeLink(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return(result);
    }

    useEffect(() => {
       
        dispatch(setSocket(socketio));
        socketio.on('new_message', (message) => {
            dispatch(setMessages(message));});
    },[]);

    const toggleLink =  ()  => {
        if(collab === false){
            setCollab(!collab);
            setRenameFlag(false);
            socket.connect();
            var result =  makeLink(15);
            setRoomLink(result);
            socket.emit('join', {room: result, host: true});
            dispatch(setRoom(result));
            document.getElementsByClassName("filetree")[0].style.height = "75vh";
        }else{
            toggleEndCollab();
        }


        
    };
    const  join_room = ()=>{
        if(room.length!==15){
            alert("The room name that you inserted is wrong.Its has to be 15 characters");
            return;
        }

        setRenameFlag(false);
        socket.connect();
        if(files && host){
            Axios.post(ENDPOINT+"/SaveCurrentProject",{
                username: username,
                previous_project : files[0].children[0].name,
            }).then((response) => {
            if(response.data.err){
                alert("Error when saving the current satte of the project.");
                return;
            }  
            });
        }

        dispatch(setHost(false));
        socket.emit('join',  {room: room, host: false});
        dispatch(setRoom(room));
        document.getElementsByClassName("filetree")[0].style.height = "75vh";
        toggleCollabModal();
        
    };

    const toggleEndCollab = () => {
        if(host && !fail_join){
            socket.emit('disconnect_room', {room: socket_room});
        }
        socketio.disconnect();
        socket.disconnect();
        dispatch(setRoom(undefined));
        dispatch(enableChat(false));
        dispatch(setAllMessages([]));
        setCollab(false);
        setRoomLink("");
        setSRoom("");

        if(!host){
            dispatch(setHost(true));
            dispatch(setHostname(username));
            dispatch( setCode(""));
            dispatch( setFcode(undefined));
            dispatch( setFiles(undefined));
        }
        document.getElementsByClassName("filetree")[0].style.height = "85vh";
        setEndCollab(false);
        setFailJoin(false);
        if(collab_modal){
            toggleCollabModal();
        }

    };

    if(collab_modal){
        document.body.classList.add('active-collab')
    }else {
        document.body.classList.remove('active-collab')
    }
    return(
     <>
        <li className='nav-item' onClick={()=>{document.getElementById("menu-btn").checked = false;}}>
            <div className='nav-divs' onClick={toggleCollabModal}>
                Collab
            </div>
        </li>
        {collab_modal && (
              <div className="collab">
                  <div  onClick={toggleCollabModal} className="collab_overlay"></div>
                      <div className="collab-content">
                     
                        <div className="collab-header-title">
                            <p className="collab-title">Collaboration</p> 
                            <img className="close-collab-modal" src={Close}  alt="e" onClick={toggleCollabModal}/>
                        </div>
                        <div className="share-content">
                            <h2 className="collab-h2">Share your Project</h2>
                            <Switch
                                className='set-switch'
                                disabled={!collab && socket_room?true:false}
                                onChange={toggleLink} 
                                checked={collab}
                                height = {20}
                                width = {45}
                                id="switch-1"
                            />
                        </div>
                        {collab && ( 
                            <div className='share-link'>
                                    <div className='box'>
                                        <p>{roomlink}</p>
                                    </div>
                                    <button className="copy" 
                                    onClick={() => { navigator.clipboard.writeText(roomlink);toggleCollabModal();}}>
                                    Copy
                                    </button>
                            </div>)}
                        <div className="join-content">
                            <h2 className="join-h2">Join a Session</h2>
                        </div>
                        <div className='join-link'>
                            <div className='join_box'>
                                <input className="join_input"type="text" name="room" value={room} required  id="room" onChange={(e) =>{setSRoom(e.target.value);}}/>
                            </div>
                            <button className="join" disabled={collab? true : false}  onClick={join_room}>Join</button>
                        </div>
                        {socket_room && (
                        <div className="end-content">
                            <h2 className="end-h2">End Collaboration</h2>
                            <Switch
                                className='end-switch'
                                onChange={toggleEndCollab} 
                                checked={endCollab}
                                height = {20}
                                width = {45}
                                id="switch-1"
                            />
                        </div>)}
                        
                    </div> 
              </div>)}
                        
    </>

    );
}

export default Collab;
