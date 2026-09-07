import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

const Header = () => {
  const [rolUser, setRolUser] = useState("");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "./";
  };
  const handleVolverAlMenu = () => {
    localStorage.removeItem("selectedPaciente");
    localStorage.removeItem("pacienteEstudios");
     window.location.href = "./Inicio";
  };

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    setRolUser(rol);
  }, []);

  const handleAdministracion = () => {
    window.location.href = "./Administracion";
  };

  const handleInicio = () => {
    window.location.href = "./Inicio";
  };

  const isHomePage = window.location.pathname === "/";

  return (
    <header className="header">
      {!isHomePage ? (
        <img
          src={require("./images/fondo spg.jpg")}
          className="imgLogo"
          alt="logo"
          onClick={handleVolverAlMenu}
        />
      ) : (
        <img
          src={require("./images/fondo spg.jpg")}
          className="imgLogoLogin"
          alt="logo"
        />
      )}
      <div className="contBetween">
        {rolUser !== "4" && rolUser !== "1" ? (
          <h1 className="tituloHeader">Imagenes Digitales</h1>
        ) : (
          <h1 className="tituloHeader" onClick={handleAdministracion}>
            Imagenes Digitales
          </h1>
        )}

        {!isHomePage && (
          <button className="btnSalir" tooltip="Salir" onClick={handleLogout}>
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              className="iconSalir"
            />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
