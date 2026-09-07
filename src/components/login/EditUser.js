// src/components/EditUser.js
import React, { useState, useEffect } from "react";
import { getUserById, updateUser, getRoles } from "../services/apis";
import Swal from "sweetalert2";
import ChangePasswordForm from "./cambiarContrasena";

const EditUser = ({ userId, closeEdit, token, capitalizeFirstLetter }) => {
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    genero: "",
    edad: "",
    role_id: "",
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [rolUser, setRolUser] = useState([]);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [firma, setFirma] = useState(null);

  useEffect(() => { 
    let rolU = localStorage.getItem("rol");
    setRolUser(rolU);
    const fetchData = async () => {
      try {
        const userResponse = await getUserById(userId, token);
        console.log("Datos del usuario:", userResponse.data);
        setFormData({
          dni: userResponse.data.users.dni,
          nombre: userResponse.data.users.nombre,
          apellido: userResponse.data.users.apellido,
          genero: userResponse.data.users.genero,
          edad: userResponse.data.users.edad
            ? new Date(userResponse.data.users.edad).toISOString().slice(0, 10)
            : "",
          role_id: userResponse.data.users.role_id,
          firma: userResponse.data.users.firma || "", // <-- AGREGA ESTA LÍNEA
        });
        const rolesResponse = await getRoles(token);
        setRoles(rolesResponse.data.roles);
      } catch (error) {
        console.error(
          "Error al obtener usuario:",
          error.response?.data || error.message
        );
      }
    };

    fetchData();
  }, [userId, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFirma(file);
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.dni) newErrors.dni = "El DNI es requerido";
    if (!formData.nombre) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido) newErrors.apellido = "El apellido es requerido";
    if (!formData.genero) newErrors.genero = "El genero es requerido";
    if (!formData.edad) newErrors.edad = "La edad es requerida";
    if (!formData.role_id) newErrors.role = "Selecciona un rol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        // No agregues la firma si es string (ya está en el servidor)
        if (key !== "firma") formDataToSend.append(key, formData[key]);
      });
      // Si hay una nueva firma, la agregas
      if (firma) {
        formDataToSend.append("firma", firma);
      }
      // Si la firma fue borrada (formData.firma === ""), envía un campo especial
      if (formData.firma === "") {
        formDataToSend.append("firma", "");
      }
      await updateUser(userId, formDataToSend, token, true);
      Swal.fire({
        position: "Center",
        icon: "success",
        title: "Usuario actualizado con éxito",
        showConfirmButton: false,
        timer: 1500,
      });
      closeEdit();
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };

  return (
    <div className="edit-user-container">
      {isChangePassword ? (
        <ChangePasswordForm
          userId={formData.dni}
          closeEdit={() => setIsChangePassword(false)}
        />
      ) : (
        <>
          <h2>Editar Usuario</h2>
          <form onSubmit={handleUpdate} className="edit-user-form">
            <label>DNI</label>
            <input
              type="number"
              name="dni"
              placeholder="DNI"
              value={formData.dni}
              onChange={handleChange}
              min="1000000"
              max="99999999"
              className={errors.dni ? 'error' : ''}
            />
            {errors.dni && <span className="error-message">{errors.dni}</span>}

            <label>Nombre</label>
            <input
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? "error" : ""}
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}

            <label>Apellido</label>
            <input
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              className={errors.apellido ? "error" : ""}
            />
            {errors.apellido && (
              <span className="error-message">{errors.apellido}</span>
            )}

            <label>Genero</label>

            <select
              name="genero"
              style={{
                marginBottom: "0",
              }}
              value={formData.genero}
              onChange={handleChange}
              className={errors.genero ? "error" : ""}
            >
              <option value="">Selecciona tu Genero</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>

            {errors.genero && (
              <span className="error-message">{errors.genero}</span>
            )}

            <label>Edad</label>
            <input
              name="edad"
              type="date"
              value={formData.edad}
              onChange={handleChange}
              className={errors.edad ? "error" : ""}
            />
            {errors.edad && <span className="error-message">{errors.edad}</span>}
            {rolUser !== 3 && rolUser !== 2 && rolUser !== 5 && (
              <>
                <label>Rol</label>

                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className={errors.role ? "error" : ""}
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {capitalizeFirstLetter(role.nombre)}
                    </option>
                  ))}
                </select>

                {errors.role && (
                  <span className="error-message">{errors.role}</span>
                )}
              </>
            )}
            <label>Firma Digital (imagen)</label>
            <input
              type="file"
              name="firma"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.firma && typeof formData.firma === "string" && (
              <div style={{ margin: "10px 0" }}>
                <img
                  src={formData.firma}
                  alt="Firma actual"
                  style={{ maxWidth: 200, maxHeight: 80, border: "1px solid #ccc" }}
                />
                <button
                  type="button"
                  className="btnBorrarFiltro"
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    setFormData({ ...formData, firma: "" });
                    setFirma(null);
                  }}
                >
                  Borrar firma
                </button>
              </div>
            )}
            <button
              className="btnBorrarFiltro"
              style={{ marginTop: "5%" }}
              type="submit"
            >
              Actualizar
            </button>

            <button type="button" onClick={closeEdit} className="cancel-button">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setIsChangePassword(true)}
              className="btnBorrarFiltro"
            >
              Cambiar Contraseña
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default EditUser;
