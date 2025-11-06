import logo from "../../../images/logo.svg";
import styles from "./header.module.css";

export function Header(props) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLogoContainer}>
        <img src={logo} alt="Logo" className={styles.headerLogo} />
        <span className={styles.headerBrand}>Participium</span>
      </div>
      {props.user?.name && (
        <div className={styles.headerGreeting}>Hello, {props.user.name}</div>
      )}
    </header>
  );
}
