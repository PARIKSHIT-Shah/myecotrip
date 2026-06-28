import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-sage/10">
      <Link to="/dashboard" className="font-display text-lg tracking-wide">
        MY ECO TRIP
      </Link>
      <button
        onClick={handleLogout}
        className="text-sm text-sage hover:text-parchment transition-colors"
      >
        Log out
      </button>
    </nav>
  );
}
