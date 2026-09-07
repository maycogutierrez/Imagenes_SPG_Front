import React, { useEffect, useState } from "react";
import {
  getUsers,
  getRoles,
  getUserById,
  insertarTipoEstudio,
} from "../services/apis";
import EditUser from "../login/EditUser";
import { calcularEdad } from "../function/CalcularEdad";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const Administracion = () => {
  const [token, setToken] = useState("");
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [roles, setRoles] = useState([]); // Estado para roles
  const [selectedDNI, setSelectedDNI] = useState("");

  useEffect(() => {
    const cargarDatosDeUser = async () => {
      const tok = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      if (tok) {
        await datosUser(id, tok);
      } else {
        handleLogout();
      }
    };
    cargarDatosDeUser();
  }, []);

  const fetchTokenAndUsers = async () => {
    const tok = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    console.log(tok);
    setUserRole(rol);
    setToken(tok);

    if (tok) {
      await handleGetUsers(tok);
      await loadRoles(tok);
    } else {
      handleLogout();
    }
    if (Number(rol) !== 1 && Number(rol) !== 4) {
      window.location.href = "./inicio";
    }
  };

  const loadRoles = async (token) => {
    try {
      const response = await getRoles(token);
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };
  const datosUser = async (id, tok) => {
    try {
      const response = await getUserById(id, tok);
      console.log(response);
      if (!response) {
        handleLogout();
      } else {
        localStorage.setItem("rol", response.data.users.role_id);
        localStorage.setItem("id", response.data.users.id);
        fetchTokenAndUsers();
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error.response.data);
      handleLogout();
    }
  };

  const handleGetUsers = async (tok) => {
    try {
      const response = await getUsers(tok);
      if (!response) {
        handleLogout();
      } else {
        console.log("Usuarios:", response.data.users);
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error.response.data);
      handleLogout();
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "./";
  };
  const handleEditUser = (userId) => {
    setEditingUserId(userId);
  };

  const closeEdit = () => {
    setEditingUserId(null);
    handleGetUsers(token);
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return ""; // Maneja null, undefined o string vacío
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  const handleSearch = (event) => setSelectedDNI(event.target.value);

  const handleInsTipoEst = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que el clic se propague a otros elementos

    // Mostrar el SweetAlert con los campos para editar
    Swal.fire({
      title: "Agregar Tipo Estudio",
      html: `
      <div style="margin-bottom: 15px;">
        <label for="tipoEstudio" style="font-weight: bold; font-size: 16px;">Nombre:</label>
        <input type="text" id="tipoEstudio" style="width: 100%; padding: 8px; margin-top: 5px;" />
      </div>
    `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const nombreTipo = document.getElementById("tipoEstudio").value;
        return { nombreTipo };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log(result);
        const { nombreTipo } = result.value;
        console.log(nombreTipo);

        try {
          // Llamar a la API de backend para actualizar el estudio
          const response = await insertarTipoEstudio(nombreTipo);
          console.log(response);

          // La respuesta de axios ya está en formato JSON
          if (response.status === 200) {
            // Asegúrate de que el backend devuelva un campo 'success'
            Swal.fire("Tipo de Estudio cargado", "", "success");
          } else {
            Swal.fire(
              "Error al cargar el tipo de estudio",
              response.message,
              "error"
            );
          }
        } catch (error) {
          console.error("Error al cargar el tipo de estudio:", error);
          Swal.fire(
            "Error al cargar",
            "Hubo un problema con la carga del tipo de estudio.",
            "error"
          );
        }
      }
    });
  };

  const handleRegistro = (e) => {
    e.preventDefault();
    window.location.href = "./register";
  };

  return (
    <div>
      {(Number(userRole) === 1 || Number(userRole) === 4) && (
        <div className="table-container">
          {editingUserId ? (
            <EditUser
              userId={editingUserId}
              closeEdit={closeEdit}
              token={token}
              capitalizeFirstLetter={capitalizeFirstLetter}
            />
          ) : (
            <>
              <div className="header-container">
                <h2>Usuarios</h2>
                <div className="contBtnAgregar">
                  <button
                    className="btnAdministracion"
                    type="button"
                    onClick={handleInsTipoEst}
                    style={{ marginRight: "15px" }}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Tipo de Estudio
                  </button>
                  <button
                    className="btnAdministracion"
                    type="button"
                    onClick={handleRegistro}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Nuevo Usuario
                  </button>
                </div>
              </div>
              <input
                className="buscadorUsuarios"
                placeholder="Buscar por DNI || Nombre y Apellido || Rol"
                onChange={handleSearch}
              />
              <button
                type="button"
                className="btnBorrarFiltro"
                onClick={() => setSelectedDNI("")}
              >
                Borrar Filtros
              </button>
              <div className="tablaAdmin">
                <table>
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Genero</th>
                      <th>Edad</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(
                        (p) =>
                          p.dni.includes(selectedDNI) ||
                          `${(p.nombre || "").toLowerCase()} ${(p.apellido || "").toLowerCase()}`.includes(
                            selectedDNI.toLowerCase()
                          ) ||
                          (
                            roles.find((role) => role.id === p.role_id)?.nombre || ""
                          ).toLowerCase().includes(selectedDNI.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id}>
                          <td>{user.dni}</td>
                          <td>{user.nombre}</td>
                          <td>{user.apellido}</td>
                          <td>{capitalizeFirstLetter(user.genero || "")}</td>
                          <td>{calcularEdad(user.edad)}</td>
                          <td>
                            {roles.find((role) => role.id === user.role_id)?.nombre
                              ? capitalizeFirstLetter(
                                  roles.find((role) => role.id === user.role_id)
                                    ?.nombre || ""
                                )
                              : "Desconocido"}
                          </td>
                          <td>
                            <button
                              className="btnAdministracion"
                              onClick={() => handleEditUser(user.id)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Administracion;
