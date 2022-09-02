import React, { useState} from "react";
import Messages from '../Messages/Messages';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import {enableChat,setMessages} from '../../redux/actions';
import Close from '../FileTree/images/white_close.png';
import './Chat.css';

const Chat = () => {

  const dispatch =useDispatch();
  const [msg, setMessage] = useState('');
  const username= useSelector(state => state.username);
  const socket= useSelector(state => state.socket);
  const room= useSelector(state => state.room);

  const sendMessage = (event) => {
    event.preventDefault();

    if(msg) {
      let time= moment().format('h:mm a');
      socket.emit('chatMessage', {room: room,username:username,message:msg,time:time});
      dispatch(setMessages({username:username,message:msg,time:time}));
    }
    setMessage('');
    
  }

  return (
    <div className="msger">
    <header className="msger-header">
      <div className="msger-header-title">
        <p className="mes-title">Chat Room</p> 
        <img className="close-icon" src={Close}  alt="e" onClick={()=>{dispatch(enableChat(false));}}/>
      </div>
    </header>
    <Messages/>
    <form id="msger-inputarea">
    <input
      id="msgerinput"
      type="text"
      placeholder="Enter your message..."
      value={msg}
      onChange={({ target: { value } }) =>  setMessage(value)}
    />
    <button className="msger-send-btn" onClick={e =>sendMessage(e) }>Send</button>
  </form>
  </div>
  );
}

export default Chat;