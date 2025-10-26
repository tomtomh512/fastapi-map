import { Link } from 'react-router-dom';
import "../styles/Navbar.css";
import ProfileIcon from "../assets/profileIcon.png";
import SearchIcon from "../assets/searchIcon.png";
import NavBarIn from "../assets/navBarIn.png";
import NavBarOut from "../assets/navBarOut.png";

interface NavbarProps {
    showPanel: boolean;
    togglePanel: () => void;
    togglePanelTrue: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
                                           showPanel,
                                           togglePanel,
                                           togglePanelTrue
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

        </div>
    )
}

export default Navbar;