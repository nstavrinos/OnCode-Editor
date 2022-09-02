import React, { Component } from "react";
import MonacoEditor from "@monaco-editor/react";

import PropTypes from 'prop-types'

import { connect } from 'react-redux';
import {setCode, setWritting} from '../../redux/actions';

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width:"100%",
            height:"90vh",
        };
    }

    render() {
        const { width, height } = this.state;
        const {
            language,
            code,
            setCode,
            theme,
            minimap,
            quickSuggestion,
            autoClosingBrackets,
            room,
            setWritting
        } = this.props;

        return (
            <div style={{
                height: "100%",
                width: "100%"
            }}>
            <MonacoEditor
                height={height}
                width={width}
                language={language}
                theme={"vs-"+ theme}
                value={code}
                options={{
                    minimap: {
                        enabled: minimap
                    },
                    showFoldingControls: "true",
                    selectOnLineNumbers:"true",
                    scrollbar: "true",
                    quickSuggestions: quickSuggestion,
                    showUnused: "true",
                    autoClosingBrackets : autoClosingBrackets,

                }}
                onChange={(newCode) => {
                    if(room){
                        if(!(newCode===code)){
                            setWritting(true);
                        }
                   }
                    setCode(newCode);

                }}
            /> 
 
                
            </div>
        );
    }
}


Editor.propTypes = {
    language: PropTypes.string,
}

const mapStateToProps = state => ({
    code: state.code,
    language: state.language,
    theme: state.theme,
    minimap: state.minimap,
    quickSuggestion: state.quickSuggestion,
    autoClosingBrackets: state.autoClosingBrackets,
    room: state.room,
});

const mapDispatchToProps = dispatch => ({
    setCode: code => dispatch(setCode(code)),
    setWritting: writting => dispatch(setWritting(writting))
})

export default connect(mapStateToProps, mapDispatchToProps)(Editor);