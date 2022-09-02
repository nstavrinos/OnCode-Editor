import React from 'react';
import PropTypes from 'prop-types';
import {setCurrent,setCode,setWritting,setFcode,setRenameFlag,setCopyFilepath} from '../../redux/actions'
import { connect } from 'react-redux';
import Axios  from "axios";
import DefaultFileIcon from './images/file.png';
import CFileIcon from './images/FileExtensions/c.png';
import CPPFileIcon from './images/FileExtensions/cpp.png';
import CSFileIcon from './images/FileExtensions/cs.png';
import CSSFileIcon from './images/FileExtensions/css.png';
import JAVAFileIcon from './images/FileExtensions/java1.png';
import CLASSFileIcon from './images/FileExtensions/java.png';
import JSFileIcon from './images/FileExtensions/js.png';
import HTMLFileIcon from './images/FileExtensions/html.png';
import JSONFileIcon from './images/FileExtensions/json.png';
import PHPFileIcon from './images/FileExtensions/php.png';
import PYFileIcon from './images/FileExtensions/py.png';
import XMLFileIcon from './images/FileExtensions/xml.png';
import Close from './images/purple_close.png';

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

const ENDPOINT = 'https://oncodeeditor.com/api';

class File extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
			show:false,
			renameModal: false,
			deleteModal: false,
			anchorPoint: {x: 0, y: 0 },
			fname: "",
			errMsg:""
        };
		
    }

	rightMenu(event){
		event.preventDefault();
		this.setState({show: true, anchorPoint: {x: event.pageX,y: event.pageY -50}});
		
	}

	renameMenu(){
		this.setState({show: false,renameModal: true, fname: this.props.info.name,errMsg:""}); 
		document.body.classList.add('active-modal');
	}

	deleteMenu(){
		this.setState({show: false,deleteModal: true}); 
		document.body.classList.add('active-modal');
	}
  
	toggleModal(){
		this.setState({renameModal: false,deleteModal: false ,fname: "",errMsg:""});
		document.body.classList.remove('active-modal');

	};

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



	deleteProcess(setCurrent,setCode,setWritting,setFcode,hostname,files){

		Axios.post(ENDPOINT+"/DeleteFile",{
			username: hostname,
			path: this.props.info.path 
		}).then((response) => {
			if(response.data.mess){
				
				deleteF(files[0],this.props.info.path);
				setCode("");
				setFcode(undefined);
				setWritting(true);
				setCurrent(files[0].children[0].children[0]);
			}
			else{
				alert(response.data.err);
			}
			this.toggleModal();
		});
	}

	render() {
		const {show,anchorPoint,renameModal,deleteModal,fname,errMsg} = this.state;
		const {
			current,
			code,
			setCode,
			setCurrent,
			hostname,
			setWritting,
			setFcode,
			setRenameFlag,
			setCopyFilepath,
			files
        } = this.props;

		let icons =undefined;
		switch (this.props.info.name.split(".")[this.props.info.name.split(".").length - 1]) {
			case "py":
				icons = PYFileIcon;
				break;
			case "java":
				icons = JAVAFileIcon;
				break;
			case "js":
				icons = JSFileIcon;
				break;
			case "cpp":
				icons = CPPFileIcon;
				break;
			case "c":
				icons = CFileIcon;
				break;
			case "xml":
				icons = XMLFileIcon;
				break;
			case "css":
				icons = CSSFileIcon;
				break;
			case "html":
				icons = HTMLFileIcon;
				break; 
			case "json":
				icons = JSONFileIcon;
				break;  
			case "php":
				 icons = PHPFileIcon;
				break;  
			case "cs":
				icons = CSFileIcon;
				break;
			case "class":
				icons = CLASSFileIcon;
				break;              
			default:
				icons = DefaultFileIcon;
				break;
		}
		return (
			<>
			<div className={(current && current.path===this.props.info.path) ?"active" :""}style={{ cursor: 'pointer', width: "100%", whiteSpace: "nowrap"}}

			onContextMenu={this.rightMenu.bind(this)}

			onClick= {()=>{
					setWritting(true);
					if(!current.isDirectory){
						Axios.post(ENDPOINT+"/CreateFile",{
							username: hostname,
							path: current.path ,
							content: code,
						}).then((response) => {
							if(response.data.mess){
								setCurrent(this.props.info);
								Axios.post(ENDPOINT+"/GetContent",{
								username: hostname,
								path: this.props.info.path,
								}).then((response) => {
									setCode(response.data.content);
									setFcode(this.props.info);
								});
							}
	
						});
					}else{
						setCurrent(this.props.info);
						Axios.post(ENDPOINT+"/GetContent",{
						username: hostname,
						path: this.props.info.path,
						}).then((response) => {
							setCode(response.data.content);
							setFcode(this.props.info);
						});
					}

				}}>
				{show ? (   <>
					<div onClick={(e)=>{if(e.type==='click'){this.setState({show: false}); }}} className="right_click_overlay"></div>
					<ul className="menu" style={{ top: anchorPoint.y, left: anchorPoint.x }}>
       						<li onClick={()=>{setCopyFilepath(this.props.info.path);this.setState({show: false}); }}>Copy</li>
						<li onClick={()=>{navigator.clipboard.writeText(this.props.info.path.split(files[0].children[0].path+"/")[1]);this.setState({show: false});}}>Copy Path</li>
       						<li onClick={this.renameMenu.bind(this)}>Rename</li>
        					<li onClick={this.deleteMenu.bind(this)}>Delete</li>
      				</ul></>):( <></>)}
				<img src={icons} alt='icon' style={{ height: '16px'}} />
				<span style={{ padding: '0 0 0 8px'}}>{this.props.info.name}</span>
			</div>
			<div>	{(renameModal || deleteModal) && (
				<div className="modal">
					<div  onClick={this.toggleModal.bind(this)} className="overlay"></div>
						<div className="modal-content">
						<img className="close-modal" src={Close}  alt="e" onClick={this.toggleModal.bind(this)}/>  
						<h2 className="modal-h2">{deleteModal ? "Delete   File" : "Rename   File" } </h2>
						{deleteModal ?(
							<p>Are you sure you want to delete "{this.props.info.name}"</p>)
							: (	
								<>
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
								/></>)}
						<div className="btn-layout"> 
						{deleteModal ?(	
						<button className="exp-btn1" onClick={this.deleteProcess.bind(this,setCurrent,setCode,setWritting,setFcode,hostname,files)}>
						 Delete
						</button>):(
						<button disabled={!fname ? true : false} className="exp-btn1" onClick={this.renameProcess.bind(this,fname,hostname,setCurrent,setRenameFlag)}>
						 Rename
						</button>)}
						<button  className="exp-btn2" onClick={this.toggleModal.bind(this)}>
						  Cancel
						</button>
						</div>
	  
				</div></div>)}</div>	</>
		);
	}
}

File.propTypes = {
	name: PropTypes.string.isRequired,
	icon: PropTypes.string,
	path: PropTypes.string, 
	info: PropTypes.object
};

File.defaultProps = {
	icon: DefaultFileIcon,
}

const mapStateToProps = state => ({
    current: state.current,
	code: state.code,
	hostname: state.hostname,
	files: state.files
});

const mapDispatchToProps = dispatch => ({
    setCurrent: current => dispatch(setCurrent(current)),
	setCode: code => dispatch(setCode(code)),
	setWritting: writting => dispatch(setWritting(writting)),
	setFcode: fcode => dispatch(setFcode(fcode)),
	setRenameFlag: rename_flag => dispatch(setRenameFlag(rename_flag)),
	setCopyFilepath: copy_filepath => dispatch(setCopyFilepath(copy_filepath)),
})


export default connect(mapStateToProps, mapDispatchToProps)(File);
