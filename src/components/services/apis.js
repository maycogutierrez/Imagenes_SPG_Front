// src/services/api.js
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/"; // Cambiar por el puerto donde corre tu API

export const registerUser = async (userData) => {
  return await axios.post(`${API_URL}users/register`, userData);
};

export const loginUser = async (credentials) => {
  return await axios.post(`${API_URL}users/login`, credentials);
};

export const getUsers = async (token) => {
  return await axios.post(
    `${API_URL}users/todoslosUsuarios`,
    {},
    {
      headers: {
        user_token: token,
      },
    }
  );
};

export const getRoles = async (token) => {
  return await axios.post(
    `${API_URL}users/roles`,
    {},
    {
      headers: {
        user_token: token,
      },
    }
  );
};

export const getUserByDni = async (dni, token) => {
  return await axios.post(
    `${API_URL}users/porDNI/${dni}`,
    {},
    {
      headers: {
        user_token: token,
      },
    }
  );
};

export const getUserById = async (userId, token) => {
  return await axios.post(
    `${API_URL}users/porId/${userId}`,
    {},
    {
      headers: {
        user_token: token,
      },
    }
  );
};

export const updateUser = async (userId, data, token, isFormData = false) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return await axios.put(`${API_URL}users/update/${userId}`, data, { headers });
};

export const estudiosPorDni = async (dni) => {
  try {
    const response = await axios.post(`${API_URL}estudios/obtener`, { dni });

    return response.data.estudios;
  } catch (error) {
    Swal.fire({
      title: "Atención",
      icon: "info",
      text: "Este paciente no tiene estudios cargados",
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonAriaLabel: "Continuar",
    });
    console.error("Error al obtener los estudios:", error);
    throw error;
  }
};

export const tiposDeEstudio = async () => {
  try {
    const response = await axios.get(`${API_URL}estudios/tipos`);

    return response.data.tipos;
  } catch (error) {
    console.error("Error al obtener los estudios:", error);
    throw error;
  }
};

export const getEstudioById = async (estudioId, token) => {
  return await axios.post(
    `${API_URL}estudios/detalles`,
    { estudioId },
    {
      headers: {
        user_token: token,
      },
    }
  );
};

export const actualizarDescripcionEstudio = async (
  estudioId,
  descripcionVieja,
  descripcionNueva,
  token,
  dni
) => {
  try {
    const response = await axios.post(
      `${API_URL}estudios/actualizarDescripcion`,
      {
        estudio_id: estudioId,
        descripcion_vieja: descripcionVieja,
        descripcion_nueva: descripcionNueva,
        dni: dni,
      },
      {
        headers: {
          user_token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la descripción:", error);
    throw error;
  }
};

export const actualizarEstudio = async (
  estudioId,
  tipo_estudio_id,
  estado,
  token
) => {
  try {
    const response = await axios.post(
      `${API_URL}estudios/actualizarEstudio`,
      {
        estudio_id: estudioId,
        tipo_estudio_id: tipo_estudio_id,
        estado: estado,
      },
      {
        headers: {
          user_token: token,
        },
      }
    );
    // axios automáticamente parsea la respuesta en formato JSON
    return response.data; // La respuesta ya es un objeto JSON
  } catch (error) {
    console.error("Error al actualizar la descripción:", error);
    throw error; // Lanza el error para ser capturado en el manejador del frontend
  }
};

export const changePassword = async (dni, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}users/cambiar-password`, {
      dni,
      newPassword,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error; // Propaga el error para que el frontend lo maneje
  }
};

export const insertarTipoEstudio = async (nombreTipo) => {
  console.log(nombreTipo);
  return await axios.post(`${API_URL}estudios/agregarTipoEstudio`, {
    nombreTipo: nombreTipo,
  });
};
