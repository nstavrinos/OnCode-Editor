import React, { useState } from 'react';
import {setMinimap, setTheme,setQuickSuggestion,setAutoClosingBrackets} from '../../redux/actions';
import {useDispatch} from 'react-redux';
import Switch from "react-switch";
import './Settings.css';

function Settings() {

    const [map_checked, setMapChecked] = useState(true);
    const [theme_checked, setThemeChecked] = useState(false);
    const [sug_checked, setSugChecked] = useState(true);
    const [brackets_checked, setBracketsChecked] = useState(true);
    const dispatch =useDispatch();
  
    const toggleThemeSwitch = () => {
      setThemeChecked(!theme_checked);
      if(theme_checked){
        dispatch(setTheme("light"));
      }
      else{
        dispatch(setTheme("dark"));
      }
      
    };
  
    const toggleMapSwitch = () => {
      dispatch(setMinimap(!map_checked));
      setMapChecked(!map_checked);
    };
  
    const toggleSugSwitch = () => {
      dispatch(setQuickSuggestion(!sug_checked));
      setSugChecked(!sug_checked);
    };

    const toggleBracketsSwitch = () => {
      
      if(brackets_checked){
        dispatch(setAutoClosingBrackets("never"));
      }
      else{
        dispatch(setAutoClosingBrackets("always"));
      }
      setBracketsChecked(!brackets_checked);
      
    };

    return (

        <div className="dropdown">
            <div className='nav-item'>
                <button className="dropbtn"> Settings</button>
            </div>
            <div className="dropdown-content">
                <div className='set-lab' onClick={toggleThemeSwitch}  >
                    <span className='set-span'>Theme</span>
                    <Switch
                        className='set-switch'
                        onChange={()=>{return}} 
                        checked={theme_checked}
                        height = {20}
                        width = {45}
                        id="normal-switch-1"
                    />
                </div>
                <div className='set-lab' onClick={toggleMapSwitch}>
                    <span className='set-span'>Minimap</span>
                    <Switch
                        className='set-switch'
                        onChange={()=>{return}}
                        checked={map_checked}
                        height = {20}
                        width = {45}
                        id="normal-switch-2"
                    />
                </div>
                <div className='set-lab' onClick={toggleSugSwitch}>
                    <span className='set-span' >Suggestions</span>
                    <Switch
                        className='set-switch'
                        onChange={()=>{return}} 
                        checked={sug_checked}
                        height = {20}
                        width = {45}
                        id="normal-switch-3"
                    />
                </div>
                <div className='set-lab' onClick={toggleBracketsSwitch}  >
                    <span className='set-span'>Auto Brackets</span>
                    <Switch
                        className='set-switch'
                        onChange={()=>{return}} 
                        checked={brackets_checked}
                        height = {20}
                        width = {45}
                        id="normal-switch-4"
                    />
                </div>
        </div>
      </div>
      
    );

}


export default Settings;