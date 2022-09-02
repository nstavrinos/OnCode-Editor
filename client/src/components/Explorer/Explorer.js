import React,{ useRef ,useState,useEffect} from "react";
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import {setCode,setFcode,setCurrent,setWritting} from '../../redux/actions';
import Upload from '../FileTree/images/upload.png';
import Download from '../FileTree/images/download.png';
import Create from '../FileTree/images/cff.png';
import CreateFol from '../FileTree/images/cf.png';
import Close from '../FileTree/images/purple_close.png';
import Axios  from "axios";
import b64ToBlob from "b64-to-blob";
import fileSaver from "file-saver";
import FileTree from "../FileTree/FileTree";
import './Explorer.css';


export default function Files() {

  const ENDPOINT = 'https://oncodeeditor.com/api';

  const dispatch =useDispatch();
  const inputFile = useRef(null);
  const files= useSelector(state => state.files);
  const code= useSelector(state => state.code);
  const current = useSelector(state => state.current);
  const hostname = useSelector(state => state.hostname);
  const [modal, setModal] = useState(false);
  const [createfolder, setCreatefolder] = useState(false);
  const [fname, setFname]= useState("");
  const [errMsg, setErrMsg] = useState("");
  const errRef = useRef();

  useEffect(() => {
    setErrMsg('');
}, [fname, modal])

  const toggleModal = () => {
    if(current.isDirectory){
      setModal(!modal);
    }
    setFname("");
  };

  if(modal) {
    document.body.classList.add('active-modal')
  } else {
    document.body.classList.remove('active-modal')
  }

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


  const showFile = (e) => {

        e.preventDefault();
        
        if(!e.target.files[0]){
          return;
        }

        const file = e.target.files[0];  
        e.target.value = "";

        let error=false;
        current.children.forEach(child => {
          if(child.name === file.name || (child.isDirectory && (child.name + '.zip' )=== file.name )){
            error =true;
            return ;
          } 
        });
        if(error){
          alert("This file already exists in the current folder. Rename the file inside the current folder or choose another file to upload.");
          return;
        }

        let file_path = current.path+"/"+ file.name;
        const reader = new FileReader();

        if(file.name.includes(".zip")){     
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            const data=reader.result.split(',').pop();
            Axios.post(ENDPOINT+"/ZipUpload",{
              username: hostname,
              path: file_path ,
              content: data,
              folder_path: current.path+"/",
            }).then((response) => {
              current.addItem(response.data.newfiles[0].name,response.data.newfiles[0].isDirectory);
              addNewFiles(response.data.newfiles,1,current.children[current.children.length - 1],current.children[current.children.length - 1]);
              dispatch( setCurrent(current.children[current.children.length - 1]));
            });
          }
        }
        else{

          if(file.name.includes(".7zip") || file.name.includes(".rar")){
            alert("The app doesn't support this file type.");
            return;
          }

          reader.readAsText(file);
          reader.onload = () => {
            Axios.post(ENDPOINT+"/CreateFile",{
              username: hostname,
              path: file_path ,
              content: String(reader.result)
            }).then((response) => {
              if(response.data.mess){
                dispatch(setCode(reader.result));
                current.addItem(file.name,false);
                dispatch(setFcode(current.children[current.children.length - 1]));
                dispatch( setCurrent(current.children[current.children.length - 1]));
                dispatch(setWritting(true));
              }
              else{
                alert("Error when uploading the file.Please try again");
              }
              
            });
            
          };
          reader.onerror =() => {
            console.log("file error", reader.error);
          }
        
        }
  };

  const onButtonClick = () => {
    if(current.isDirectory){
      inputFile.current.click();
    }
    
  };

  const createFile = () =>{

      let error=false;
      current.children.forEach(child => {
        if(child.name === fname){
          setErrMsg("This names already exists in the current folder.");
          error =true;
          return ;
        } 
      });
      if(error){
        return;
      }

      if(createfolder){

        if(fname.includes(".")){
          setErrMsg("The name of the folder can't contain '.'");
          return;
        }

        let folder_path = current.path+"/"+fname;
        Axios.post(ENDPOINT+"/CreateFolder",{
          username: hostname,
          path: folder_path ,
        });
          
      }
      else{

        let file_path = current.path+"/"+fname;
        Axios.post(ENDPOINT+"/CreateFile",{
          username: hostname,
          path: file_path ,
          content: ""
        });
        dispatch(setCode(""));
      }

      current.addItem(fname,createfolder); 
      if(!createfolder){
        dispatch(setFcode(current.children[current.children.length - 1]));
        dispatch(setWritting(true));
      }  
      dispatch( setCurrent(current.children[current.children.length - 1]));     
      setFname("");
      setCreatefolder(false);
      toggleModal();

  }


  const downloadFile = () => {

    if(!current.isDirectory){
        const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
        fileSaver.saveAs(blob, current.name);  
    }else{
        Axios.post(ENDPOINT+"/ZipDownload",{
          username: hostname,
          path: current.path
        }).then((response) => {
          if(response.data.mess){
            const blob = b64ToBlob(response.data.zip, "application/zip");
            fileSaver.saveAs(blob, current.name+'.zip');
          }
          else{
            alert("Error when dowloadind the folder.Please try again");
          }
          
        });

    }

}



   return (
     <>
     < div className="file-exp">
       <p className="title">Files Explorer</p>
      <input
        style={{ display: "none" }}
        ref={inputFile}
        type="file"
        onChange={showFile}
      />
      <img className="icons" src={Upload}  alt="a" onClick={onButtonClick} title="Upload" />
      <img className="icons" src={Download}  alt="b" onClick={downloadFile} title="Download" />
      <img className="icons" src={CreateFol} alt="c" onClick={()=>{setCreatefolder(true);toggleModal();}} title="Create Folder"/>
      <img className="icons" src={Create} alt="d" onClick={()=>{setCreatefolder(false);toggleModal();}}  title="Create File"/>
      
      
    </div>
    <div className="filetree" id="filetree">
    {files&& <FileTree/>}
    </div>
    
    <div>
        
        {modal && (
              <div className="modal">
                  <div  onClick={()=>{setCreatefolder(false);toggleModal();}} className="overlay"></div>
                      <div className="modal-content">
                      <img className="close-modal" src={Close}  alt="e" onClick={toggleModal}/>   
                      <h2 className="modal-h2">Create {createfolder ? "Folder" : "File" }</h2>
                      <div className='err_clone_container'>
                                <p ref={errRef} className={ errMsg ? "errormsg" : "offscreen"}>{errMsg}</p>
                      </div> 
                      <input 
                        className="modal-input"
                        type="text"
                        name="foldername" 
                        placeholder="Untitled"
                        id="foldername" 
                        value={fname}
                        required 
                        autoComplete="off" 
                        onChange={(e) =>{setFname(e.target.value);}}
                        />
                      <div className="btn-layout"> 
                      <button disabled={!fname ? true : false} className="exp-btn1" onClick={createFile} >
                       Create
                      </button>
                      <button  className="exp-btn2" onClick={toggleModal}>
                        Cancel
                      </button>
                      </div>

              </div> </div>)}</div>
    
    
    
    </>
  );
  
}
