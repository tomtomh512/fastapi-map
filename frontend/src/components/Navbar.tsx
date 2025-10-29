import { Link } from 'react-router-dom';
import "../styles/Navbar.css";
import ProfileIcon from "../assets/profileIcon.png";
import SearchIcon from "../assets/searchIcon.png";
import NavBarIn from "../assets/navBarIn.png";
import NavBarOut from "../assets/navBarOut.png";
import HeartIcon from "../assets/heartIcon.png";
import SavedIcon from "../assets/savedIcon.png";
import React from "react";

interface NavbarProps {
    showPanel: boolean;
    togglePanel: () => void;
    togglePanelTrue: () => void;
    favoriteID: string;
    plannedID: string;
}

const Navbar: React.FC<NavbarProps> = ({
                                           showPanel,
                                           togglePanel,
                                           togglePanelTrue,
                                           favoriteID,
                                           plannedID,
                                       }) => {

    return (
        <div className="navbar-container" >
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

            <Link to={`/list/${favoriteID}`} className="navbar-link" onClick={togglePanelTrue}>
                <img src={HeartIcon} alt="Favorites"/>
            </Link>

            <Link to={`/list/${plannedID}`} className="navbar-link" onClick={togglePanelTrue}>
                <img src={SavedIcon} alt="Planned"/>
            </Link>

        </div>
    )
}

export default Navbar;