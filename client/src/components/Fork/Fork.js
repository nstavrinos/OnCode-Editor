import React, { useState,useRef} from 'react';
import {useSelector} from 'react-redux';
import Axios  from "axios";
import Close from '../FileTree/images/purple_close.png';

const ENDPOINT = 'https://oncodeeditor.com/api';

function  Fork() {

    const [forkModal, setForkModal] = useState(false);
    const username= useSelector(state => state.username);
    const files= useSelector(state => state.files);
    const host=useSelector(state => state.host);
    const hostname=useSelector(state => state.hostname);
  
    const toggleForkModal = () => {
        setForkModal(!forkModal);
    };


    const forkProcess = () =>{
    
            Axios.post(ENDPOINT+"/Fork",{
                hostname: hostname,
                username: username,
                project_path : files[0].children[0].children[0].path

            }).then((response) => {
                if(response.data.err){
                    alert(response.data.err); 
                }
                else if(response.data.mess==="ok"){
                    toggleForkModal();
                }
            });
        
    };

    if(forkModal){
        document.body.classList.add('active-collab')
    }else {
        document.body.classList.remove('active-collab')
    }


return(<>
   {!host && (<li className='nav-item' onClick={()=>{document.getElementById("menu-btn").checked = false;}}>
        <div className='nav-divs' onClick={toggleForkModal}>
        Fork
        </div>
    </li>)}

    <> {forkModal  && (
				<div className="modal">
					<div  onClick={toggleForkModal} className="overlay"></div>
						<div className="modal-content">
						<img className="close-modal" src={Close}  alt="e" onClick={toggleForkModal}/>  
						<h2 className="modal-h2">Fork Project</h2>
							<p style={{textAlign:"left"}}>Are you sure you want to fork the project <br></br>
                            <strong>{files[0].children[0].children[0].name}</strong> of the host?</p>
								
						<div className="btn-layout"> 
						<button disabled={!files ? true : false} className="exp-btn1" onClick={forkProcess}>
						 Fork
						</button>
						<button  className="exp-btn2" onClick={toggleForkModal}>
						  Cancel
						</button>
						</div>
	  
				</div></div>)}</>	</>
);


}


export default Fork;
