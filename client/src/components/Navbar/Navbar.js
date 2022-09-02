import React from 'react';
import './Navbar.css';
import SignIn from '../SignIn/SignIn';
import Settings from '../Settings/Settings';
import Collab from '../Collab/Collab';
import SignOut from '../SignOut/SignOut';
import Info from '../Info/Info';
import Contact from '../Contact/Contact';
import Github from '../Github/Github';
import Fork from '../Fork/Fork';
import ChooseProject from '../ChooseProject/ChooseProject';

function Navbar() {


  return (
    <>
    <nav className='navbar'>

    <h1 className='navbar-logo'>
       OnCode Editor
    </h1>
    <input type="checkbox" className="menu-btn" id="menu-btn"/>
    <label className="menu-icon" htmlFor="menu-btn">
      <span className="nav-icon"></span>
    </label>

    <ul className='nav-menu'>

      <Collab/>

      <Github/>

      <Settings/>
   
      <ChooseProject/>

      <Fork/>

      <Info/>

      <Contact/>
      
      <SignOut/>
      
    </ul>
   
  </nav>
  <SignIn/>
  </>

    
  );
}

export default Navbar;
