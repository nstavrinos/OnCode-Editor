import React, { useState,useRef} from 'react';
import {setFiles,setCurrent,setCode,setFcode,setWritting} from '../../redux/actions';
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import Axios  from "axios";
import FileItem from '../FileItems/FileItems';
import Close from '../FileTree/images/purple_close.png';
import TrashCan from '../FileTree/images/red-trash-can.png';
import "./ChooseProject.css"

function  ChooseProject() {
    const ENDPOINT = 'https://oncodeeditor.com/api';

    const [project_modal, setProjectModal] = useState(false);
    const [proj_dropdown,setProjDropdown]=useState(false);
    const [projects,setProjects]=useState([]);
    const [zip_upload, setZipUpload] = useState(false);
    const zipFile = useRef(null);

    const username = useSelector(state => state.username);
    const files = useSelector(state => state.files);
    const loggedIn = useSelector(state => state.loggedIn);
    const host = useSelector(state => state.host);
    const room = useSelector(state => state.room);

    const dispatch =useDispatch();

    const toggleProjectModal = () => {
        
        if(files){
            setProjectModal(!project_modal);
            setProjDropdown(false);
            setProjects([]);
            setZipUpload(false);
        }
    };

    if((!files && loggedIn )||project_modal){
        document.body.classList.add('active-project')
    }else {
        document.body.classList.remove('active-project')
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

    const saveCurrentProject = () => {
        
        Axios.post(ENDPOINT+"/SaveCurrentProject",{
          username: username,
          previous_project : files[0].children[0].name,
        }).then((response) => {
        if(response.data.err){
            alert("Error when saving the current satte of the project.");
        }
          if(response.data.mess==="ok"){
            dispatch( setCode(""));
            dispatch( setFcode(undefined));
            dispatch(setWritting(true));
          }
    
        });
      };

    const previousProject = () => {
      
        Axios.post(ENDPOINT+"/GetPreviousProject",{
            username: username,
          }).then((response) => {     
            if(response.data.err){          
                alert(response.data.err);
            }
            else{
             
              if (response.data.files.length){
                if(files){
                    saveCurrentProject();
                }

                const F =  [];
                F.push(new FileItem("myProject",true,"myProject"));
               
                F[0].addItem(response.data.files[0].name,response.data.files[0].isDirectory);
                F[0].children[0].addItem(response.data.files[1].name,response.data.files[1].isDirectory);
                if(response.data.files.length > 2){
                  addNewFiles(response.data.files,2,F[0].children[0].children[F[0].children[0].children.length - 1],F[0].children[0].children[F[0].children[0].children.length - 1]);
                }
                
                dispatch(setFiles(F));
                dispatch( setCode(""));
                dispatch( setFcode(undefined)); 
                dispatch(setWritting(true));
 		dispatch( setCurrent(F[0].children[0].children[0]));
              }
              else{
                emptyProject("emptyProject");
                alert("You didn't have a previous Project so we created a new empty one for you.");
              }
              if(project_modal){
                toggleProjectModal();
              }
              else{
                if(files){
                    setProjDropdown(false);
                    setProjects([]);
                }
              }
             
            }
        });
      
    };

    const emptyProject = (project_name) => {
        return new Promise((resolve)=>{
         Axios.post(ENDPOINT+"/NewEmptyProject",{
            username: username,
            project_name: project_name
          }).then((response) => {     
            if(response.data.err){    
                setZipUpload(false);      
                alert(response.data.err);
            }
            else if (response.data.mes === "ok"){ 
                if(files){
                    saveCurrentProject();  
                }
                
                if(!zip_upload){

                    const F =  [];
                    F.push(new FileItem("myProject",true,"myProject"));
                    F[0].addItem("Project_" + response.data.number ,true);
                    F[0].children[0].addItem(project_name,true);
                
		    dispatch( setFiles(F));
                    dispatch( setCode(""));
                    dispatch( setFcode(undefined));
                    dispatch(setWritting(true));
                    dispatch( setCurrent(F[0].children[0].children[0]));

                    if(project_modal){
                        toggleProjectModal();
                    }
                    else{
                        if(files){
                            setProjDropdown(false);
                            setProjects([]);
                        }
                    }
                }
                else{

                    resolve(response.data.number);
                }
            }         
            
        });
    });


    };

    const AllProject = () => {
      
        if(!proj_dropdown && projects.length===0){
            Axios.post(ENDPOINT+"/AllProject",{
                username: username,
            }).then((response) => {     
                if(response.data.err){          
                    alert(response.data.err);
                }
                else if (response.data.mess === "ok"){          
                    projects.push(...response.data.projects);
                    setProjDropdown(true);
                }
                
                
            });
        }else{
            setProjDropdown(!proj_dropdown);
        }
    };

    const OneProject = (event) => {
        event.preventDefault();
    
        Axios.post(ENDPOINT+"/OneProject",{
            username: username,
            project: event.target.id
        }).then((response) => {     
            if(response.data.mess==="ok"){
                if(files){
                    saveCurrentProject();
                }
                
                const F =  [];
                F.push(new FileItem("myProject",true,"myProject"));
               
                F[0].addItem(response.data.files[0].name,response.data.files[0].isDirectory);
                F[0].children[0].addItem(response.data.files[1].name,response.data.files[1].isDirectory);
                if(response.data.files.length > 2){
                  addNewFiles(response.data.files,2,F[0].children[0].children[F[0].children[0].children.length - 1],F[0].children[0].children[F[0].children[0].children.length - 1]);
                }

                dispatch( setFiles(F));
                dispatch( setCode(""));
                dispatch( setFcode(undefined));
                dispatch(setWritting(true));
                dispatch( setCurrent(F[0].children[0].children[0]));

                if(project_modal){
                   toggleProjectModal();
                }
                else{
                    if(files){
                        setProjDropdown(false);
                        setProjects([]);
                    }
                }
            }
            else{
                alert(response.data.err);
                return;
            }
            
            
        });
 
    };
 
    const deleteProject = (event) => {
        event.preventDefault();
    
        if((room && host && (event.target.id===files[0].children[0].name))){
          alert("You can't delete this Project because its been shared.Try again when you end the collaboration.");
          return;
        }

        Axios.post(ENDPOINT+"/DeleteProject",{
            username: username,
            project: event.target.id
        }).then((response) => {     
            if(response.data.mess==="ok"){
                if((files && (event.target.id===files[0].children[0].name))){
                    dispatch( setFiles(undefined));
                    dispatch( setCode(""));
                    dispatch( setFcode(undefined));    
                    dispatch(setWritting(true));              
                    
                }
                setProjects(projects.filter(i => i.parent !== event.target.id));
            }
            else{
                alert(response.data.err);
                return;
            }
            
            
        });
 
    };

    const zipProject = async(e) => {
        e.preventDefault();
        setZipUpload(!zip_upload);
        if(!e.target.files[0]){
          return;
        }

        const file = e.target.files[0];  
        e.target.value = "";
        
        if(file.name.includes(".zip")){     
    
        let proj_num= await  emptyProject("");
 
          if(!zip_upload){
            return;
          }
         
          const F =  [];
          F.push(new FileItem("myProject",true,"myProject"));
          F[0].addItem("Project_" + proj_num ,true);

          let file_path = F[0].children[0].path+"/"+ file.name;
          const reader = new FileReader();

          reader.readAsDataURL(file);
          reader.onload = (e) => {
            const data=reader.result.split(',').pop();

            Axios.post(ENDPOINT+"/ZipUpload",{
              username: username,
              path: file_path ,
              content: data,
              folder_path: F[0].children[0].path+"/",
            }).then((response) => {
                F[0].children[0].addItem(response.data.newfiles[0].name,response.data.newfiles[0].isDirectory);
                addNewFiles(response.data.newfiles,1,F[0].children[0].children[F[0].children[0].children.length - 1],F[0].children[0].children[F[0].children[0].children.length - 1]);
               
		dispatch( setFiles(F));
                dispatch( setCode(""));
                dispatch( setFcode(undefined));
                dispatch(setWritting(true));
                dispatch(setCurrent(F[0].children[0].children[0]));

                toggleProjectModal();

            });
          }
          reader.onerror =() => {
            console.log("file error", reader.error);
          }
        }

 
    };

return(<>
   {host && (<li className='nav-item' onClick={()=>{document.getElementById("menu-btn").checked = false;}}>
        <div className='nav-divs' onClick={toggleProjectModal}>
        Project
        </div>
    </li>)}
    { ((!files && loggedIn) || project_modal) && (
        <div className="project">
            <div  onClick={toggleProjectModal} className="project_overlay"></div>
            <div className="project-content">
                        <div className="project-header-title">
                            <p className="project-title"> Your Projects</p> 
                            <img className="close-modal" src={Close}  alt="e" onClick={toggleProjectModal}/>
                        </div>
                        <div className="vertical-menu">
                            <div className="choice" onClick={previousProject}>Load your previous Project as you left it</div>
                            <div className="choice" onClick={()=>{setZipUpload(true);zipFile.current.click();}}>Upload a compressed(.zip) Project</div>
                            <div className="choice" onClick={()=>{emptyProject("emptyProject")}}>Create a new empty one </div>
                            <div className="choice" onClick={AllProject}>Choose one of your Projects</div>
                            {proj_dropdown && 
                                <div className="vertical-sub-menu">
                               
                               { projects.map( (pr) => {
                                return <div className='proj-lab' key={pr.parent}>
                                    <span className='proj_name' id={pr.parent}  onClick={(event)=>{OneProject(event);}}>{pr.name}</span>
  				    <span  className='proj_mod'>{pr.last_modified.substring(0, 10)}</span>
                                    <img className='del-project' id={pr.parent} src={TrashCan}  alt="e" onClick={(event)=>{deleteProject(event);}}/>
                                    </div> })}

                                </div>
                            }
                        </div>
            </div>
        </div>

    )}
                <input
                style={{ display: "none" }}
                ref={zipFile}
                type="file"
                accept='.zip'
                onChange={zipProject}/>
                </>
);


}


export default ChooseProject;
