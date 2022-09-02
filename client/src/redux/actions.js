export const setLanguage = (language) => {
    return {
        type: "SET_LANGUAGE",
        payload: language,
    };
};

export const setCode = (code) => {
    return {
        type: "SET_CODE",
        payload: code,
    };
};

export const setTheme = (theme) => ({
    type: "SET_THEME",
    payload: theme,
});

export const setMinimap = (value) => ({
    type: "SET_MINIMAP",
    payload: value,
});

export const setQuickSuggestion = (value) => ({
    type: "SET_QUICK_SUGGESTION",
    payload: value,
});

export const setAutoClosingBrackets = (value) => ({
    type: "SET_AUTO_CLOSING_BRACKETS",
    payload: value,
});

export const setFiles = (files) => {
    return {
        type: "SET_FILES",
        payload: files,
    };
};

export const setCurrent = (current) => {
    return {
        type: "SET_CURRENT",
        payload: current,
    };
};
export const setUsername = (username) => {
    return {
        type: "SET_USERNAME",
        payload: username,
    };
};
export const setRoom = (room) => {
    return {
        type: "SET_ROOM",
        payload:  room,
    };
};

export const setSocket = (socket) => {
    return {
        type: "SET_SOCKET",
        payload:  socket,
    };
};

export const setWritting = (writting) => {
    return {
        type: "SET_WRITTING",
        payload:  writting,
    };
};

export const setHost = (host) => {
    return {
        type: "SET_HOST",
        payload:  host,
    };
};

export const setLoggedIn = (loggedIn) => {
    return {
        type: "SET_LOGGEDIN",
        payload:  loggedIn,
    };
};

export const setMessages = (messages) => {
    return {
        type: "SET_MESSAGES",
        payload:  messages,
    };
};

export const setAllMessages = (msg) => {
    return {
        type: "SET_ALLMESSAGES",
        payload: msg,
    };
};

export const enableChat = (chat) => {
    return {
        type: "SET_ENABLE_CHAT",
        payload:  chat,
    };
};

export const setHostname = (hostname) => {
    return {
        type: "SET_HOSTNAME",
        payload:  hostname,
    };
};

//Name of the file that its code is been displayed in the editor.
export const setFcode = (fcode) => {
    return {
        type: "SET_FCODE",
        payload:  fcode,
    };
};

export const setGitToken = (token) => {
    return {
        type: "SET_GITTOKEN",
        payload:  token,
    };
};

export const setGitUsername = (git_username) => {
    return {
        type: "SET_GITUSERNAME",
        payload:  git_username,
    };
};

export const setRenameFlag = (rename_flag) => {
    return {
        type: "SET_RENAMEFLAG",
        payload: rename_flag,
    };
};

export const setCopyFilepath = (copy_filepath) => {
    return {
        type: "SET_COPYFILEPATH",
        payload: copy_filepath,
    };
};

export default {
    setLanguage,
    setCode,
    setTheme,
    setMinimap,
    setQuickSuggestion,
    setAutoClosingBrackets,
    setFiles,
    setCurrent,
    setUsername,
    setRoom,
    setSocket,
    setWritting,
    setHost,
    setLoggedIn,
    setMessages,
    setAllMessages,
    enableChat,
    setHostname,
    setFcode,
    setGitToken,
    setGitUsername,
    setRenameFlag,
    setCopyFilepath,
};
