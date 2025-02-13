import React from 'react';
import logo from '../../assets/logo_frame.png'

function Header() {

  return (
    <div className="header">
        <img src={logo} alt="BWF logo" height="150"/>
        <p> <a href="https://youtu.be/q3dYKgsLWFU?si=-kFGLCtDIjOTN-E6" target="_blank" rel="noopener noreferrer">Link to working demonstration</a></p>
        <p>An improved <a href="https://doi.org/10.4081/aiol.2016.5791" target="_blank" rel="noopener noreferrer">air2water model</a></p>
        <p>A full stack scientific model development project by <a href="https://iitg.ac.in/stud/riddick.kakati/index.html" target="_blank" rel="noopener noreferrer">Dr. Riddick Kakati</a></p>
    </div>
  );
}

export default Header;
