import React from 'react';
import PropTypes from 'prop-types';
import CloseFolder from './images/close-folder.png';
import OpenFolder from './images/open-folder.png';
import Close from './images/purple_close.png';
import Axios  from "axios";
import FileItem from '../FileItems/FileItems';
import {setCode,setFcode ,setCurrent,setWritting,setRenameFlag,setCopyFilepath,setFiles} from '../../redux/actions'
import { connect } from 'react-redux';

function deleteF(valFiles,path) {
	valFiles.children.forEach(child => {
		
		if(path  === child.path){
			valFiles.children = valFiles.children.filter(i => i.path !== path);
			return;
		}
		if(child.children){
			deleteF(child,path);
		}
	});
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

const ENDPOINT = 'https://oncodeeditor.com/api';

class Folder extends React.Component {


	constructor(props) {
        super(props);
        this.state = {
			show:false,
			renameModal: false,
			deleteModal: false,
			createFileModal: false,
			createFolderModal: false,
			anchorPoint: {x: 0, y: 0 },
			fname: "",
			errMsg:""
        };
    }

	rightMenu(event){
		event.preventDefault();
		this.setState({show: true, anchorPoint: {x: event.pageX ,y: event.pageY -50}});
	}

	renameMenu(){
		this.setState({show: false,renameModal: true, fname: this.props.info.name,errMsg:""}); 
		document.body.classList.add('active-modal');
	}

	deleteMenu(){
		this.setState({show: false,deleteModal: true}); 
		document.body.classList.add('active-modal');
	}
	createFolderMenu(){
		this.setState({show: false,createFolderModal: true,errMsg:""}); 
		document.body.classList.add('active-modal');
	}
	createFileMenu(){
		this.setState({show: false,createFileModal: true,errMsg:""}); 
		document.body.classList.add('active-modal');
	}
 	
	pasteMenu(copy_filepath,hostname,setFiles,setFcode,setCurrent,setCode,setWritting,project_name){
		this.setState({show: false}); 
		document.body.classList.add('active-modal');
		this.pasteProcess(copy_filepath,hostname,setFiles,setFcode,setCurrent,setCode,setWritting,project_name);
	}
 
	toggleModal(){
		this.setState({renameModal: false,deleteModal: false ,createFileModal: false ,createFolderModal: false,fname: "",errMsg:""});
		document.body.classList.remove('active-modal');

	};

	pasteProcess = (copy_filepath,hostname,setFiles,setFcode,setCurrent,setCode,setWritting,project_name)=> {

		let error=false;
		this.props.info.children.forEach(child => {
		  if(child.name === copy_filepath.split('/')[copy_filepath.split('/').length-1]){
			alert("The name of the file that you are trying to paste already exists in the current folder."); 
			error =true;
			return ;
		  } 
		});
		if(error){
			this.toggleModal();
		    return;
		}

		Axios.post(ENDPOINT+"/Paste",{
			username: hostname,
			srcpath: copy_filepath ,
			dstpath: this.props.info.path,
			project_name : project_name
		}).then((response) => {
			if(response.data.err){
				alert(response.data.err); 
			}
			else if(response.data.mess==="ok"){
				if(!response.data.files){
					this.props.info.addItem(copy_filepath.split('/')[copy_filepath.split('/').length-1],false); 
					setCode(response.data.content);
					setFcode(this.props.info.children[this.props.info.children.length - 1]); 
					setWritting(true);

				}
				else{
					const F =  [];
					F.push(new FileItem("myProject",true,"myProject"));
				   
					F[0].addItem(response.data.files[0].name,response.data.files[0].isDirectory);
					F[0].children[0].addItem(response.data.files[1].name,response.data.files[1].isDirectory);
					if(response.data.files.length > 2){
					  addNewFiles(response.data.files,2,F[0].children[0].children[F[0].children[0].children.length - 1],F[0].children[0].children[F[0].children[0].children.length - 1]);
					}
	
					setFiles(F);
				}
				setCurrent(this.props.info.children[this.props.info.children.length - 1]);
				this.toggleModal();
			}
		});
	}


	renameProcess = (fname,hostname,setCurrent,setRenameFlag)=> {
		const oldpath= this.props.info.path;
		const oldname=this.props.info.name;
		this.props.info.rename(fname,-1);

		Axios.post(ENDPOINT+"/Rename",{
			username: hostname,
			oldpath: oldpath ,
			newpath: this.props.info.path,
		}).then((response) => {
			if(response.data.rename){
				setCurrent(this.props.info);
				setRenameFlag(true);
				this.toggleModal();
			}
			else{
				this.props.info.rename(oldname,-1);
				this.setState({errMsg:response.data.error}); 
			}

		});
	}

	deleteProcess(setCurrent,setCode,setFcode,setWritting,fcode,hostname,files){
		
		Axios.post(ENDPOINT+"/DeleteFolder",{
			username: hostname,
			path: this.props.info.path 
		}).then((response) => {
			if(response.data.mess){
				deleteF(files[0],this.props.info.path);
				setCurrent(files[0].children[0].children[0]);
				if(fcode && fcode.path.includes(this.props.info.path)){
					setCode("");
					setFcode(undefined);
					setWritting(true);
				}
			}
			else{
				alert(response.data.err);
			}
			this.toggleModal();
		});
	}

	createFile(fname,hostname,setCurrent,setCode,setFcode,setWritting,createfolder){

		let error=false;
		this.props.info.children.forEach(child => {
		  if(child.name === fname){
			this.setState({errMsg:"This names already exists in the current folder."}); 
			error =true;
			return ;
		  } 
		});
		if(error){
		  return;
		}

		let path = this.props.info.path +"/"+fname;
		if(createfolder){
		
			if(fname.includes(".")){
				this.setState({errMsg:"The name of the folder can't contain '.'"}); 
				return;
			}
			Axios.post(ENDPOINT+"/CreateFolder",{
				username: hostname,
				path: path ,
			});
			
		}
		else{
		  Axios.post(ENDPOINT+"/CreateFile",{
			username: hostname,
			path: path ,
			content: ""
		  });
		  setCode("");
		}
  
		this.props.info.addItem(fname,createfolder); 
		if(!createfolder){
		  setFcode(this.props.info.children[this.props.info.children.length - 1]);
		  setWritting(true);
		}  
		setCurrent(this.props.info.children[this.props.info.children.length - 1]);     
		this.toggleModal();
  
	}


	render() {
		const icon = this.props.open ? this.props.icons.open : this.props.icons.close;
		const {show,anchorPoint,renameModal,deleteModal,createFileModal,createFolderModal,fname,errMsg} = this.state;
		const {
			current,
			setCurrent,
			setCode,
			setFcode,
			setWritting,
			setRenameFlag,
			setCopyFilepath,
			setFiles,
			code,
			fcode,
			hostname,
			files,
			copy_filepath
       		 } = this.props;

		return (
			<>
			<div 

			onContextMenu={this.rightMenu.bind(this)}
			onClick= {()=>{

				
					if(!current.isDirectory){			
						Axios.post(ENDPOINT+"/CreateFile",{
							username: hostname,
							path: current.path ,
							content: code,
						}).then((response) => {
							if(response.data.mess){
								setCurrent(this.props.info);
							}
	
						});
					}
					else{
						setCurrent(this.props.info);
					}


				
			}}>
			{show ? (   <>
					<div onClick={(e)=>{if(e.type==='click'){this.setState({show: false}); }}} className="right_click_overlay"></div>
					<ul className="menu" style={{ top: anchorPoint.y  , left: anchorPoint.x}}>
       						<li onClick={this.createFileMenu.bind(this)}>New File</li>
						<li onClick={this.createFolderMenu.bind(this)}>New Folder</li>
						<li onClick={()=>{setCopyFilepath(this.props.info.path);this.setState({show: false}); }}>Copy</li>
						{(copy_filepath && <li onClick={this.pasteMenu.bind(this,copy_filepath,hostname,setFiles,setFcode,setCurrent,setCode,setWritting,files[0].children[0].name)}>Paste</li>)}	
						<li onClick={()=>{navigator.clipboard.writeText(this.props.info.path.split(files[0].children[0].path+"/")[1]);this.setState({show: false});}}>Copy Path</li>
       						<li onClick={this.renameMenu.bind(this)}>Rename</li>
        					{(this.props.info.path !== files[0].children[0].children[0].path) && <li onClick={this.deleteMenu.bind(this)}>Delete</li>}
      				</ul></>):( <></>)}

			<div className={(current && current.path===this.props.info.path) ?"active" :""} style={{ cursor: 'pointer', width: "100%", whiteSpace: "nowrap" }} onClick={this.props.toggleFolder}>
				<img src={icon} alt='icon' style={{ height: '16px' }} />
				<span style={{ padding: '0 0 0 8px' }} >{this.props.info.name}</span>
			</div></div>
	<div>	{(renameModal || deleteModal) && (
				<div className="modal">
					<div  onClick={this.toggleModal.bind(this)} className="overlay"></div>
						<div className="modal-content">
						<img className="close-modal" src={Close}  alt="e" onClick={this.toggleModal.bind(this)}/>  	
						<h2 className="modal-h2">{deleteModal ? "Delete   Folder" : "Rename   Folder" } </h2>
						{deleteModal ?(
							<p>Are you sure you want to delete "{this.props.info.name}"<br></br> and its contents </p>)
							: (	<>
								<div className='err_clone_container'>
                                	<p className={ errMsg ? "errormsg" : "offscreen"}>{errMsg}</p>
                    			</div> 
								<input 
								className="modal-input"
								type="text"
								name="foldername" 
								placeholder={this.props.info.name}
								id="foldername" 
								value={fname}
								required 
								autoComplete="off" 
								onChange={(e) =>{this.setState({fname: e.target.value});this.setState({errMsg:""});}}
								/> </>)}
						<div className="btn-layout"> 
						{deleteModal ?(	
						<button className="exp-btn1" onClick={this.deleteProcess.bind(this,setCurrent,setCode,setFcode,setWritting,fcode,hostname,files)}>
						 Delete
						</button>):(
						<button disabled={!fname ? true : false} className="exp-btn1" onClick={this.renameProcess.bind(this,fname,hostname,setCurrent,setRenameFlag)}>
						 Rename
						</button>)}
						<button  className="exp-btn2" onClick={this.toggleModal.bind(this)}>
						  Cancel
						</button>
						</div>
	  
				</div></div>)}</div>
				<>
				{(createFileModal||createFolderModal) && (
            <div className="modal">
                <div  onClick={this.toggleModal.bind(this)} className="overlay"></div>
                    <div className="modal-content">
                    <img className="close-modal" src={Close}  alt="e" onClick={this.toggleModal.bind(this)}/>   
                    <h2 className="modal-h2">Create {createFolderModal ? "Folder" : "File" }</h2>
                    <div className='err_clone_container'>
                                <p className={ errMsg ? "errormsg" : "offscreen"}>{errMsg}</p>
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
                      onChange={(e) =>{this.setState({fname: e.target.value});this.setState({errMsg:""});}}
                      />
                    <div className="btn-layout"> 
                    <button disabled={!fname ? true : false} className="exp-btn1" onClick={this.createFile.bind(this,fname,hostname,setCurrent,setCode,setFcode,setWritting,createFolderModal)} >
                     Create
                    </button>
                    <button  className="exp-btn2" onClick={this.toggleModal.bind(this)}>
                      Cancel
                    </button>
                    </div>

            </div> </div>)}
				</>
					</>
   
			
		);
	}
}

Folder.propTypes = {
	name: PropTypes.string.isRequired,
	open: PropTypes.bool,
	icons: PropTypes.shape({
		open: PropTypes.string,
		close: PropTypes.string,
	}),
	toggleFolder: PropTypes.func.isRequired,
	info: PropTypes.object,
	path: PropTypes.string
};

Folder.defaultProps = {
	icons: {
		open: OpenFolder,
		close: CloseFolder,
	},
	open: false,
};

const mapStateToProps = state => ({
    current: state.current,
	code: state.code,
	hostname: state.hostname,
	fcode: state.fcode,
	files: state.files,
	copy_filepath:  state.copy_filepath
});

const mapDispatchToProps = dispatch => ({
    setCurrent: current => dispatch(setCurrent(current)),
	setCode: code => dispatch(setCode(code)),
	setFcode: fcode => dispatch(setFcode(fcode)),
	setWritting: writting => dispatch(setWritting(writting)),
	setRenameFlag: rename_flag => dispatch(setRenameFlag(rename_flag)),
	setCopyFilepath: copy_filepath => dispatch(setCopyFilepath(copy_filepath)),
	setFiles: files => dispatch(setFiles(files)),
})


export default connect(mapStateToProps, mapDispatchToProps)(Folder);
