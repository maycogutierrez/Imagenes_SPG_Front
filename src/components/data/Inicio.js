import React, { useEffect, useState } from "react";
import {
  actualizarEstudio,
  estudiosPorDni,
  getUsers,
  getUserByDni,
  tiposDeEstudio,
} from "../services/apis";
import { calcularEdad, capitalizeFirstLetter } from "../function/CalcularEdad";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faEdit } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const Inicio = () => {
  const [pacientes, setPacientes] = useState([]);
  const [tipoEstudio, setTipoEstudio] = useState([]);
  const [selectedDNI, setSelectedDNI] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [pacienteEstudios, setPacienteEstudios] = useState([]);
  const [fechaFilter, setFechaFilter] = useState("fechaDesc");
  const [tipoFilter, setTipoFilter] = useState("");
  const [token, setToken] = useState("");
  const [rolUser, setRolUser] = useState();

  // Detectar si es móvil
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar pacientes y tipos de estudios
  const cargarDatos = async () => {
    try {
      const tok = localStorage.getItem("token");
      const rolU = localStorage.getItem("rol");
      const dni = localStorage.getItem("dni");

      if (tok) setToken(tok);
      if (rolU) setRolUser(rolU);

      if (tok) {
        // Si es un paciente (rol 3), cargamos solo sus datos por DNI para optimizar
        if (Number(rolU) === 3 && dni) {
          const pacienteResponse = await getUserByDni(dni, tok);
          if (pacienteResponse.data && pacienteResponse.data.users) {
            // Aseguramos que 'pacientes' siempre sea un array
            const userData = pacienteResponse.data.users;
            setPacientes(Array.isArray(userData) ? userData : [userData]);
          }
        } else {
          // Para otros roles, mantenemos la carga de todos los pacientes
          const pacientesObtenidos = await traerPacientes(tok);
          setPacientes(pacientesObtenidos.data.users);
        }
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  const traerPacientes = async (token) => {
    try {
      const pacientes = await getUsers(token);
      return pacientes;
    } catch (error) {
      console.error("Error al obtener los pacientes:", error);
      return [];
    }
  };

  const handleTiposEstudios = async () => {
    try {
      const tipos = await tiposDeEstudio();
      setTipoEstudio(tipos);
    } catch (error) {
      console.error("Error al obtener los tipos de estudio:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
    handleTiposEstudios();

    localStorage.removeItem("nombreSelect");
    localStorage.removeItem("apellidoSelect");
    localStorage.removeItem("dniSelect");
    localStorage.removeItem("edadSelect");
    localStorage.removeItem("generoSelect");
    localStorage.removeItem("idSelect");
    localStorage.removeItem("fechaEstudio");
    localStorage.removeItem("part_cuerpo");
    localStorage.removeItem("tipo_estudio");
  }, []);
  useEffect(() => {
    const dni = localStorage.getItem("dni");
    if (Number(rolUser) === 3) {
      handleSelectPaciente(dni);
    }
  }, [rolUser, pacientes]);

  useEffect(() => {
    const storedPaciente = localStorage.getItem("selectedPaciente");
    if (
      storedPaciente &&
      storedPaciente !== "undefined" &&
      pacientes.length > 0
    ) {
      let paciente = null;
      try {
        paciente = JSON.parse(storedPaciente);
      } catch (e) {
        paciente = null;
      }
      if (paciente?.dni) {
        const pacienteActualizado = pacientes.find(
          (p) => p.dni === paciente.dni
        );
        if (pacienteActualizado) {
          setSelectedPaciente(pacienteActualizado);
          localStorage.setItem(
            "selectedPaciente",
            JSON.stringify(pacienteActualizado)
          );
          estudiosPorDni(paciente.dni).then((estudios) => {
            setPacienteEstudios(estudios);
            localStorage.setItem("pacienteEstudios", JSON.stringify(estudios));
          });
        }
      }
    }
  }, [pacientes]);

  const handleSelectPaciente = async (dni) => {
    try {
      const estudios = await estudiosPorDni(dni);
      const paciente = pacientes.find((p) => p.dni === dni);
      localStorage.setItem("selectedPaciente", JSON.stringify(paciente));
      localStorage.setItem("pacienteEstudios", JSON.stringify(estudios));
      setSelectedPaciente(paciente);
      setPacienteEstudios(estudios);
    } catch (error) {
      console.error("Error al obtener estudios:", error);
      setPacienteEstudios([]);
    }
  };

  const sortEstudios = (estudios = []) => {
    let sortedEstudios = [...estudios];
    if (fechaFilter === "fechaAsc") {
      sortedEstudios.sort(
        (a, b) => new Date(a.fecha_estudio) - new Date(b.fecha_estudio)
      );
    } else if (fechaFilter === "fechaDesc") {
      sortedEstudios.sort(
        (a, b) => new Date(b.fecha_estudio) - new Date(a.fecha_estudio)
      );
    }
    return sortedEstudios.filter((estudio) =>
      tipoFilter ? estudio.tipo_estudio_id === parseInt(tipoFilter) : true
    );
  };

  const handleFechaFilterChange = (event) => setFechaFilter(event.target.value);
  const handleTipoFilterChange = (event) => setTipoFilter(event.target.value);
  const handleBorrarFiltroTipo = () => setTipoFilter("");
  const handleSearch = (event) => setSelectedDNI(event.target.value);

  const tiposDeEstudioOpciones = tipoEstudio.map((tipo, index) => (
    <option key={index} value={tipo.id}>
      {tipo.nombre}
    </option>
  ));

  const handleVolverAlMenu = () => {
    setSelectedPaciente(null);
    setPacienteEstudios([]);
    localStorage.removeItem("selectedPaciente");
    localStorage.removeItem("pacienteEstudios");
  };

  const cargarDatosDetalle = (
    nombre,
    apellido,
    dni,
    edad,
    genero,
    id,
    fechaEstudio,
    part_cuerpo,
    tipo_estudio
  ) => {
    localStorage.setItem("nombreSelect", nombre);
    localStorage.setItem("apellidoSelect", apellido);
    localStorage.setItem("dniSelect", dni);
    localStorage.setItem("edadSelect", edad);
    localStorage.setItem("generoSelect", genero);
    localStorage.setItem("idSelect", id);
    localStorage.setItem("fechaEstudio", fechaEstudio);
    localStorage.setItem("part_cuerpo", part_cuerpo);
    localStorage.setItem("tipo_estudio", tipo_estudio);

    setTimeout(() => {
      window.location.href = `/detalle-estudio`;
    }, 100);
  };

  const filteredPacientes = pacientes.filter((paciente) => {
    const searchTerms = selectedDNI
      .toLowerCase()
      .split(" ")
      .filter((term) => term);
    if (searchTerms.length === 0) return true;

    const nombreCompleto =
      `${paciente.nombre.toLowerCase()} ${paciente.apellido.toLowerCase()}`;
    const dni = paciente.dni ? paciente.dni.toString() : "";

    return searchTerms.every(
      (term) => nombreCompleto.includes(term) || dni.includes(term)
    );
  });

  return (
    <div className="contInicio row">
      {rolUser !== "3" && (!selectedPaciente || !esMovil) && (
        <div className="contPacientes col-12 col-md-3">
          <div className="search-controls">
            <input
              type="text"
              className="buscadorPacientes"
              placeholder="Buscar por DNI, Nombre o Apellido"
              value={selectedDNI}
              onChange={handleSearch}
            />
            <button
              type="button"
              className="btnBorrarFiltro"
              onClick={() => setSelectedDNI("")}
            >
              Borrar Filtros
            </button>
          </div>
          <div className="pacientes-list">
            {filteredPacientes.slice(0, 1000).map((paciente) => (
              <div
                key={paciente.dni}
                className="paciente-info"
                onClick={() => handleSelectPaciente(paciente.dni)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedPaciente?.dni === paciente.dni
                      ? "#3498db"
                      : "transparent",
                }}
              >
                <h3>
                  {paciente.nombre} {paciente.apellido}
                </h3>
                <div className="contBetween">
                  <span>DNI: {paciente.dni}</span>
                </div>
                <span>
                  {calcularEdad(paciente.edad)} Años -{" "}
                  {capitalizeFirstLetter(paciente.genero || "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datos del paciente y estudios */}
      {(selectedPaciente || !esMovil) && (
        <div
          className={
            `contEstudios col-12 col-md-9` +
            (Number(rolUser) === 3 ? " paciente-estudios" : "")
          }
        >
          {/* Botón volver solo en móvil */}
          {esMovil && selectedPaciente && (
            <button onClick={handleVolverAlMenu} className="btnBorrarFiltro">
              Volver al menú de búsqueda
            </button>
          )}
          {selectedPaciente ? (
            <>
              <h2>
                Estudios de {selectedPaciente.nombre}{" "}
                {selectedPaciente.apellido}
              </h2>
              <div>
                <select
                  className="filtroEstudios"
                  onChange={handleFechaFilterChange}
                  value={fechaFilter}
                >
                  <option value="fechaDesc">Más reciente</option>
                  <option value="fechaAsc">Más antiguo</option>
                </select>
                <select
                  className="filtroEstudios"
                  value={tipoFilter}
                  onChange={handleTipoFilterChange}
                >
                  <option value="">Todos los estudio</option>
                  {tiposDeEstudioOpciones}
                </select>
                <button
                  type="button"
                  className="btnBorrarFiltro"
                  style={{ marginLeft: "10px" }}
                  onClick={handleBorrarFiltroTipo}
                >
                  Mostrar Todos
                </button>
              </div>
              <div className="row">
                {pacienteEstudios.length > 0 ? (
                  sortEstudios(pacienteEstudios).map((estudio) => (
                    <div className="col-md-8 col-12" key={estudio.id}>
                      <button
                        className="estudio-info"
                        onClick={() =>
                          cargarDatosDetalle(
                            selectedPaciente.nombre,
                            selectedPaciente.apellido,
                            selectedPaciente.dni,
                            selectedPaciente.edad, // <-- Usa el campo correcto
                            selectedPaciente.genero,
                            estudio.id,
                            estudio.fecha_estudio,
                            estudio.part_cuerpo,
                            tipoEstudio.find(
                              (t) => t.id === estudio.tipo_estudio_id
                            )?.nombre || "Tipo de estudio no encontrado"
                          )
                        }
                      >
                        <div className="contBetween">
                          <h4>N°: {String(estudio.id).padStart(4, "0")}</h4>
                          <span>
                            <strong>Informe:</strong>
                            <FontAwesomeIcon
                              icon={faCircle}
                              style={{
                                color: estudio.descripcion
                                  ? "#28a745"
                                  : "#ff9800",
                                marginLeft: "5px",
                              }}
                            />
                            <span
                              style={{
                                color: estudio.descripcion
                                  ? "#28a745"
                                  : "#ff9800",
                                marginLeft: "5px",
                              }}
                            >
                              {estudio.descripcion ? "Disponible" : "Pendiente"}
                            </span>
                          </span>
                          <span>
                            <strong>Fecha: </strong>
                            {new Date(
                              estudio.fecha_estudio
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="contBetween">
                          <h7>
                            <strong>
                              Tipo: <br />{" "}
                            </strong>

                            {tipoEstudio.find(
                              (t) => t.id === estudio.tipo_estudio_id
                            )?.nombre || "Tipo de estudio no encontrado"}
                          </h7>
                          <h7>
                            <strong>
                              Área: <br />
                            </strong>
                            {estudio.part_cuerpo}
                          </h7>
                        </div>
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No se encontraron estudios para este paciente.</p>
                )}
              </div>
            </>
          ) : (
            !esMovil && (
              <div className="col-12">
                <p>Selecciona un paciente para ver sus estudios.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Inicio;
