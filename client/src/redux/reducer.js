const INITIAL_STATE = {
    language: "java",
    code: "",
    theme: "light",
    minimap: true,
    quickSuggestion: true,
    autoClosingBrackets: "always",
    files: undefined,
    current: undefined,
    username: undefined,
    room: undefined,
    socket: undefined,
    writting: false,
    host: true,
    loggedIn: false,
    messages: [],
    enableChat: false,
    hostname: undefined,
    fcode: undefined,
    token: undefined,
    git_username: undefined,
    rename_flag: false,
    copy_filepath: ''
};

const allReducers = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "SET_CODE":
            return {
                ...state,
                code: action.payload
            }
        case "SET_LANGUAGE":
            return {
                ...state,
                language: action.payload
            }
        case "SET_THEME":
            return {
                ...state,
                theme: action.payload
            }
        case "SET_MINIMAP":
            return {
                ...state,
                minimap: action.payload
            }
        case "SET_QUICK_SUGGESTION":
            return {
                ...state,
                quickSuggestion: action.payload
            }
        case "SET_AUTO_CLOSING_BRACKETS":
            return {
                ...state,
                autoClosingBrackets: action.payload
            }
        case "SET_FILES":
            return {
                ...state,
                files: action.payload
            }
        case "SET_CURRENT":
            if(!action.payload.isDirectory){
                let lang;
                switch (action.payload.name.split(".")[1]) {
                    case "py":
                        lang = "python";
                        break;
                    case "java":
                        lang = "java";
                        break;
                    case "js":
                        lang = "javascript";
                        break;
                    case "cpp":
                        lang = "cpp";
                        break;
                    case "c":
                        lang = "c";
                        break;
                    case "xml":
                        lang = "xml";
                        break;
                    case "css":
                        lang = "css";
                        break;
                    case "html":
                        lang = "html";
                        break; 
                    case "json":
                        lang = "json";
                        break;  
                    case "php":
                        lang = "php";
                        break;  
                    case "cs":
                        lang = "csharp";
                        break;             
                    default:
                        lang = "java";
                        break;
                }
                return {
                    ...state,
                    language: lang,
                    current: action.payload
                }
            }

            return {
                ...state,
                current: action.payload
            }
        case "SET_USERNAME":
            sessionStorage.setItem("username",action.payload);
            return {
                ...state,
                username: action.payload,
                hostname: action.payload
            }
        case "SET_ROOM":
            return {
                ...state,
                room: action.payload
            }
        case "SET_SOCKET":
            if(!action.payload){
                return {
                    ...state,
                    messages: [],
                    socket: action.payload
                }

            }
            else{
                return {
                    ...state,
                    socket: action.payload
                }
            }
        case "SET_WRITTING":
            return {
                ...state,
                writting: action.payload
            }
        case "SET_HOST":
            return {
                ...state,
                host: action.payload
            }
        case "SET_LOGGEDIN":
            return {
                ...state,
                loggedIn: action.payload
            }
        case "SET_MESSAGES":
            return {
                ...state,
                messages: [...state.messages, action.payload]
            }
        case "SET_ALLMESSAGES":
            return {
                ...state,
                messages: action.payload
            }
        case "SET_ENABLE_CHAT":
            return {
                ...state,
                enableChat: action.payload
            }
        case "SET_HOSTNAME":
            return {
                ...state,
                hostname: action.payload
            }
        case "SET_FCODE":
            return {
                ...state,
                fcode: action.payload
            }
        case "SET_GITTOKEN":
            sessionStorage.setItem("token",action.payload);
            return {
                ...state,
                token: action.payload
            }
        case "SET_GITUSERNAME":
            sessionStorage.setItem("git_username",action.payload);
            return {
                ...state,
                git_username: action.payload
            }
        case "SET_RENAMEFLAG":
        return {
            ...state,
            rename_flag: action.payload
        }                       
        case "SET_COPYFILEPATH":
        return {
            ...state,
            copy_filepath: action.payload
        }     
	 default:
            return state;
    }
};

export default allReducers;
