import React from "react";
import {Link} from "react-router-dom";
import "../styles/Navbar.css";
import ProfileIcon from "../assets/profileIcon.png";
import SearchIcon from "../assets/searchIcon.png";
import HeartIcon from "../assets/heartIcon.png";
import SavedIcon from "../assets/savedIcon.png";
import NavBarIn from "../assets/navBarIn.png";
import NavBarOut from "../assets/navBarOut.png";

export default function Navbar(props) {
    const {togglePanel, togglePanelTrue, showPanel} = props;

    return (
        <div className="sidebar-container">
            <span className="navbar-link" onClick={togglePanel}>
                {showPanel ?
                    <img src={NavBarIn} alt="Toggle"/>
                    :
                    <img src={NavBarOut} alt="Toggle"/>
                }
            </span>

            <Link to="/" className="navbar-link" onClick={togglePanelTrue}>
                <img src={SearchIcon} alt="Search"/>
            </Link>

            <Link to="/profile" className="navbar-link" onClick={togglePanelTrue}>
                <img src={ProfileIcon} alt="Profile"/>
            </Link>

            <Link to="/favorites" className="navbar-link" onClick={togglePanelTrue}>
                <img src={HeartIcon} alt="Favorites"/>
            </Link>

            <Link to="/planned" className="navbar-link" onClick={togglePanelTrue}>
                <img src={SavedIcon} alt="Planned"/>
            </Link>

        </div>
    );
}