import React, { useState,useRef,useEffect} from 'react';
import "./Contact.css"
import Emailjs from 'emailjs-com';
import Close from '../FileTree/images/purple_close.png';
import LoadingSpinner from "../Spinner/Spinner";


function  Contact() {

    const errRef = useRef();
    const [contact_modal, setContactModal] = useState(false);
    const [name, setName]= useState("");
    const [email, setEmail]= useState("");
    const [subject, setSubject]= useState("");
    const [msg, setMsg]= useState("");
    const [resultmessage, setResultMessage]= useState("");
    const [numOfEmails, setNumOfEmails]= useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setResultMessage('');
    }, [name, email,subject, msg])

    const toggleContactModal = () => {
        setName("");
        setEmail("");
        setMsg("");
        setSubject("");
        setIsLoading(false);
        setContactModal(!contact_modal);
    };

    if(contact_modal){
        document.body.classList.add('active-contact')
    }else {
        document.body.classList.remove('active-contact')
    }


    const ContactHandler = (event) => {
        event.preventDefault();
        if(!name || !email || !subject || !msg ){
            setResultMessage("All the fields must be filled!");
            return;
        }
        if(numOfEmails === 2 ){
            setResultMessage("You have reached the daily limit of emails.Please try again tomorrow.");
            return;
        }
        setIsLoading(true);
        Emailjs
        .sendForm(
          "service_288vgwo",
          "template_ftxiqz1",
          event.target,
          "yAV2vc40tuqeKmfYP"
        )
        .then((result) => {
            setIsLoading(false);
            alert("Your message has been succefully sent,i will contact you soon.");
            setNumOfEmails(numOfEmails + 1);
            toggleContactModal();
            return;
          },
          (error) => {
            setIsLoading(false);
            setResultMessage("Your message has failed, try again later.");
          }
        );
        event.target.reset();
        setName("");
        setEmail("");
        setMsg("");
        setSubject("");
        
    } 

return(
    <>
    <li className='nav-item' onClick={()=>{document.getElementById("menu-btn").checked = false;}}>
        <div className='nav-divs' onClick={toggleContactModal}>
        Contact
        </div>
    </li>
    {contact_modal && (
        <div className="contact">
            <div  onClick={toggleContactModal} className="contact_overlay"></div>
            <div className="contact-content">
            <img className="close-modal" src={Close}  alt="e" onClick={toggleContactModal}/>
            <form  className="contact100-form validate-form" onSubmit={ContactHandler}>
                    <span className="contact100-form-title">
                       Contact Me
					</span>
                    <>{isLoading? <LoadingSpinner /> :( <> 
                    <div >
                   
                    <p ref={errRef} className={resultmessage ? "errmsg" : "offscreen"} aria-live="assertive">{resultmessage}</p>
                    </div> 
					<div className="wrap-input100 validate-input" data-validate = "Name is required">
						<input className="input100" type="text" name="name" placeholder="Full Name" value={name} onChange={(e) =>{setName(e.target.value);}} requierd="true"/>
						<span className="focus-input100"></span>
					</div>

					<div className="wrap-input100 validate-input" data-validate = "Valid email is required: ex@abc.xyz">
						<input className="input100" type="text" name="email" placeholder="Email" value={email} onChange={(e) =>{setEmail(e.target.value);}} requierd="true"/>
						<span className="focus-input100"></span>
					</div>

                    <div className="wrap-input100 validate-input" data-validate = "Subject is required">
						<input className="input100" type="text" name="subject" placeholder="Subject" value={subject} onChange={(e) =>{setSubject(e.target.value);}} requierd="true"/>
						<span className="focus-input100"></span>
					</div>

					<div className="wrap-input100 validate-input" data-validate = "Message is required">
						<textarea className="input100" name="msg" placeholder="Message" value={msg} onChange={(e) =>{setMsg(e.target.value);}} requierd="true"></textarea>
						<span className="focus-input100"></span>
					</div>

					<div className="container-contact100-form-btn">
						<button className="contact100-form-btn"  >
							Send
						</button>
					</div>
                    </> )}</>
				</form>
            </div>

        </div>)}
    </>
);


}


export default Contact;