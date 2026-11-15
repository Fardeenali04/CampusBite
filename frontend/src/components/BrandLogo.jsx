
import { Link } from "react-router-dom";

export default function BrandLogo() {
  return (
    <Link to="/" className="brand brand-home" aria-label="CampusBite Home">
      <span className="brand-mark">C</span>
      <span>CAMPUSBITE</span>
    </Link>
  );
}
