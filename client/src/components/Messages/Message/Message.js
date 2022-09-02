import React from 'react';
import ReactEmoji from 'react-emoji';

const Message = ({username,message,time}) => {

  return (
    <div className="msg-left-msg">
    <div className="msg-img"></div>

    <div className="msg-bubble">
      <div className="msg-info">
        <div className="msg-info-name">{username}</div>
        <div className="msg-info-time">{time}</div>
      </div>

      <div className="msg-text">{ReactEmoji.emojify(message)} </div>
    </div>
  </div>
  );
}

export default Message;