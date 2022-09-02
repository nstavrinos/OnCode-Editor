import React, { useState} from 'react';
import "./Info.css"
import Close from '../FileTree/images/purple_close.png';

function Info() {

    const [info_modal, setInfoModal] = useState(false);

    const toggleInfoModal = () => {
        setInfoModal(!info_modal);
    };

    if(info_modal){
        document.body.classList.add('active-info')
    }else {
        document.body.classList.remove('active-info')
    }

return(
    <>
    <li className='nav-item' onClick={()=>{document.getElementById("menu-btn").checked = false;}}>
        <div className='nav-divs' onClick={toggleInfoModal}>
            Info
        </div>
    </li>
    {info_modal && (
        <div className="info">
            <div  onClick={toggleInfoModal} className="info_overlay"></div>
            <div className="info-content">
            <img className="close-modal" src={Close}  alt="e" onClick={toggleInfoModal}/>   
            <h2 className="modal-h2">Information </h2>
            <p className="para1">

                <strong>General:</strong><br></br>
                This online code editor is developed for my thesis at the University of Thessaly. 
                I hope you try my app and find it useful. 
                The main idea behind this project is for anyone to be able to code from everywhere, 
                without being concerned about anything besides his code. 
                <br></br><br></br>

                
                <strong>Features and Technical things:</strong><br></br>
                First of all, to use the app, you have to be signed in. Then all the features of the app 
                are available to use, except  the Github functionalities that require to have signed in with
                Github or just connect your Github account to your OnCode account.
                In short, these features are creating your own project(you can create files or folders inside the app
                or upload your local files including .zip files and the app will create the file structure for you),also there is  
                collaboration with other users, live chat, and free storage for your projects, which are kept safe for
                your next time that you decide to use the app and GitHub functionalities, such as clone, pull, push. 
                Also, more features will come soon. If you find a bug or you have a problem or you need to ask something, 
                please contact me through the contact form of the app.<br></br><br></br>

                <strong>Supported Code Languages:</strong><br></br>
                C,C++,C#,Javascript,Java,Json,Python,Php,Html,
                Css,Xml

            </p>
            </div>

        </div>)}
    </>
);


}


export default Info;