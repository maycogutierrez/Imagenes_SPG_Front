import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faDownload,
  faEdit,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  actualizarDescripcionEstudio,
  getEstudioById,
  getUserByDni,
  getUserById,
} from "../services/apis";
import { calcularEdad, capitalizeFirstLetter } from "../function/CalcularEdad";
import Viewer from "react-viewer";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import { eurostileFont } from "../../font/eurostileFont.js";

const DetalleEstudio = () => {
  const [datosUser, setDatosUser] = useState([]);
  const [rolUser, setRolUser] = useState([]);
  const [detallesEstudios, setDetallesEstudios] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [descripcion, setDescripcion] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [descripcionEdit, setDescripcionEdit] = useState("");
  const [nombreMedico, setNombreMedico] = useState(""); // <-- Nueva línea
  const [firmaMedico, setFirmaMedico] = useState(""); // NUEVO

  const handleBrightnessChange = (e) => {
    e.preventDefault();
    setBrightness(e.target.value);
    document.documentElement.style.setProperty(
      "--brightness",
      `${e.target.value}%`
    );
  };

  const handleCancelar = () => {
    setDescripcionEdit(detallesEstudios?.descripcion || "");
    setEditMode(false);
  };

  const handleContrastChange = (e) => {
    e.preventDefault();
    setContrast(e.target.value);
    document.documentElement.style.setProperty(
      "--contrast",
      `${e.target.value}%`
    );
  };

  const handleResetearBC = () => {
    setBrightness(100);
    setContrast(100);
    document.documentElement.style.setProperty("--contrast", `100%`);
    document.documentElement.style.setProperty("--brightness", `100%`);
  };

  let userId = localStorage.getItem("id");
  let token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const userResponse = await getUserById(userId, token);
      setRolUser(userResponse.data.users.role_id);
      localStorage.setItem("rol", userResponse.data.users.role_id);
    } catch (error) {
      console.error(
        "Error al obtener usuario:",
        error.response?.data || error.message
      );
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "./";
  };

  useEffect(() => {
    const cargarDetalleEstudio = async () => {
      const tok = localStorage.getItem("token");
      const rolUsuario = localStorage.getItem("rol");
      const idUserSelect = localStorage.getItem("idSelect");
      let fechaEstudio = localStorage.getItem("fechaEstudio");

      // Si la fecha viene en formato ISO, cortamos solo la fecha
      if (fechaEstudio && fechaEstudio.length >= 10) {
        fechaEstudio = fechaEstudio.substring(0, 10);
      }

      const datos = {
        nombre: localStorage.getItem("nombreSelect"),
        apellido: localStorage.getItem("apellidoSelect"),
        dni: localStorage.getItem("dniSelect"),
        edad: localStorage.getItem("edadSelect"),
        genero: localStorage.getItem("generoSelect"),
        id: localStorage.getItem("idSelect"),
        fechaEstudio, // Solo la fecha, sin hora
        part_cuerpo: localStorage.getItem("part_cuerpo"),
        tipo_estudio: localStorage.getItem("tipo_estudio"),
      };
      setRolUser(rolUsuario);
      setDatosUser(datos);

      if (tok) {
        await fetchData();
        await datosEstudios(idUserSelect, tok);
      }
    };

    cargarDetalleEstudio();
  }, []);

  const datosEstudios = async (id, tok) => {
    try {
      const response = await getEstudioById(id, tok);
      if (response) {
        const detalles = response.data.detalles[0];
        setDetallesEstudios(detalles);
        setImages(detalles.imagenes);
        setDescripcion(detalles.descripcion);

        // Buscar el médico por dni_detalle
        if (detalles.dni_detalle) {
          const medicoResp = await getUserByDni(detalles.dni_detalle, tok);
          if (medicoResp?.data?.users[0]) {
            setNombreMedico(
              `Dr. ${medicoResp.data.users[0].nombre} ${medicoResp.data.users[0].apellido}`
            );
            setFirmaMedico(medicoResp.data.users[0].firma || ""); // <-- GUARDA LA FIRMA
          }
        }
      }
    } catch (error) {
      console.error(
        "Error al obtener usuarios:",
        error.response?.data || error
      );
    }
  };

  const handleVolverInicio = () => {
    window.location.href = "./inicio";
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Guardar cambios
  const handleGuardar = async () => {
    try {
      const tok = localStorage.getItem("token");
      const id = datosUser.id;
      const dni = localStorage.getItem("dni");

      if (!tok || !id) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No hay sesión activa",
        });
        return;
      }

      // Enviar la descripción vieja y la nueva a la API
      const response = await actualizarDescripcionEstudio(
        detallesEstudios.estudio_id,
        detallesEstudios.descripcion,
        descripcionEdit,
        tok,
        dni
      );

      if (response.message === "Descripción actualizada correctamente") {
        Swal.fire({
          title: "Descripción actualizada con éxito",
          icon: "success",
          draggable: true,
        });
        setEditMode(false);

        // Vuelve a pedir los detalles del estudio (incluye médico y firma actualizados)
        await datosEstudios(datosUser.id, tok);

        // Si también quieres actualizar el localStorage:
        // localStorage.setItem("detallesEstudios", JSON.stringify(detallesEstudiosActualizados));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error...",
          text: "Error al actualizar la descripción",
        });
      }
    } catch (error) {
      console.error("Error al guardar la descripción:", error);
      Swal.fire({
        icon: "error",
        title: "Error...",
        text: "Error al guardar la descripción",
      });
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();

    doc.addFileToVFS("EurostileLTStd.ttf", eurostileFont);
    doc.addFont("EurostileLTStd.ttf", "EurostileLT", "normal");

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ENCABEZADO ESTILO OULTON
    const logoUrl = require("../images/fondo spg.jpg"); // usá tu logo real
    const logoWidth = 50;
    const logoHeight = 20;

    // LOGO A LA IZQUIERDA
    doc.addImage(logoUrl, "JPG", margin, 15, logoWidth, logoHeight);

    // TEXTO A LA DERECHA
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Vélez Sársfield 271, X5986 Oncativo, Córdoba",
      pageWidth - margin,
      18,
      { align: "right" }
    );
    doc.text("Tel: 03572 45-6085", pageWidth - margin, 24, { align: "right" });
    doc.text("imagenes.sanatorioprivadogatti.com.ar", pageWidth - margin, 30, {
      align: "right",
    });

    // LÍNEA AZUL DEBAJO
    doc.setDrawColor(0, 70, 140);
    doc.setLineWidth(0.5);
    doc.line(margin, 40, pageWidth - margin, 40);

    // Datos del paciente (ajusta aquí la posición Y)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `PACIENTE: ${datosUser.apellido}, ${datosUser.nombre}`,
      margin,
      55
    ); // antes 90
    doc.setFont("helvetica", "normal");
    doc.text(`EDAD: ${calcularEdad(datosUser.edad)} años`, margin + 100, 55); // antes 90

    doc.text(
      `FECHA: ${datosUser.fechaEstudio || "Fecha no disponible"}`,
      margin,
      63
    ); // antes 98
    doc.text(`ESTUDIO: ${datosUser.id || "Sin ID"}`, margin + 100, 63); // antes 98

    // TÍTULOS
    doc.setFont("helvetica", "bold");
    doc.text(
      `ESTUDIO: ${datosUser.tipo_estudio} - ${datosUser.part_cuerpo}`,
      margin,
      75
    ); // antes 110

    // INFORME (lo subimos aquí)
    doc.setFont("helvetica", "bold");
    doc.text("INFORME:", margin, 85); // Cambia la posición Y para que quede debajo del título

    doc.setFont("helvetica", "normal");
    const informeLines = doc.splitTextToSize(
      descripcion.toUpperCase(),
      pageWidth - 2 * margin
    );
    let cursorY = 93; // Ajusta este valor para que quede debajo de "INFORME"
    const lineHeight = 8;

    informeLines.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - 30) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    // FIRMA
    doc.text("Cordialmente lo saluda.", pageWidth - margin, cursorY + 10, {
      align: "right",
    });

    // Firma alineada a la derecha (si existe)
    if (firmaMedico) {
      await new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
          // Firma a la derecha, debajo del saludo
          doc.addImage(
            img,
            "PNG",
            pageWidth - margin - 50, // 50 es el ancho de la firma
            cursorY + 15,
            50,
            20
          );
          resolve();
        };
        img.onerror = resolve;
        img.src = firmaMedico;
      });
      cursorY += 25;
    }

    // Nombre del médico alineado a la derecha
    doc.setFont("helvetica", "bold");
    doc.text(nombreMedico || "----", pageWidth - margin, cursorY + 20, {
      align: "right",
    });

    // IMÁGENES - UNA POR HOJA (corregido)
    for (const image of images) {
      await new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
          doc.addPage();

          const aspectRatio = img.width / img.height;
          let imgWidth = pageWidth - 2 * margin;
          let imgHeight = imgWidth / aspectRatio;

          if (imgHeight > pageHeight - 2 * margin) {
            imgHeight = pageHeight - 2 * margin;
            imgWidth = imgHeight * aspectRatio;
          }

          const xImg = (pageWidth - imgWidth) / 2;
          const yImg = (pageHeight - imgHeight) / 2;

          doc.addImage(img, "JPEG", xImg, yImg, imgWidth, imgHeight);
          resolve();
        };
        img.onerror = resolve; // Si falla, sigue con la siguiente
        img.src = image.imagen_url;
      });
    }

    // GUARDAR PDF
    doc.save(`Informe_Estudio_${datosUser.id}.pdf`);
  };

  // Cerrar el visor al hacer click en el fondo (mask)
  useEffect(() => {
    if (!selectedImage) return;

    const handleMaskClick = (e) => {
      // Solo cerrar si es click izquierdo y sobre el fondo (mask)
      if (
        e.button === 0 &&
        e.target.classList.contains("react-viewer-canvas")
      ) {
        setSelectedImage(null);
      }
    };

    document.addEventListener("click", handleMaskClick);

    return () => {
      document.removeEventListener("click", handleMaskClick);
    };
  }, [selectedImage]);

  return (
    <div id="detalle-estudio" className="contDetalleEst">
      {detallesEstudios ? (
        <div className="row" style={{ maxWidth: "100%" }}>
          <div className="col-xl-4 col-md-5 col-12 contDetalleInforme">
            {/* Botón Volver arriba de todo */}
            <div
              className="contBtnDescripcion"
              style={{ marginBottom: "15px" }}
            >
              <button onClick={handleVolverInicio} className="btnVolver">
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  style={{ paddingRight: "10px" }}
                />
                Volver
              </button>
            </div>
            <div className="contDatosDet">
              <h2>
                {datosUser.nombre} {datosUser.apellido}
              </h2>
              <p>DNI: {datosUser.dni}</p>
              <p>
                {calcularEdad(datosUser.edad)} Años &emsp;- &emsp;
                {capitalizeFirstLetter(datosUser.genero)}
              </p>
            </div>
            {/* Botones Descargar PDF y Guardar debajo de la descripción */}
            <div
              className="contBtnDescripcion"
              style={{ marginBottom: "15px" }}
            >
              {!editMode ? (
                <>
                  <button onClick={() => downloadPDF()} className="btnVolver">
                    <FontAwesomeIcon
                      icon={faDownload}
                      style={{ paddingRight: "10px" }}
                    />
                    Descargar PDF
                  </button>
                  {Number(rolUser) !== 3 && (
                    <button
                      onClick={() => {
                        setDescripcionEdit(detallesEstudios?.descripcion || "");
                        setEditMode(true);
                      }}
                      className="btnVolver"
                    >
                      <FontAwesomeIcon
                        icon={faEdit}
                        style={{ paddingRight: "10px" }}
                      />
                      Editar
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleGuardar} className="btnVolver">
                    <FontAwesomeIcon
                      icon={faSave}
                      style={{ paddingRight: "10px" }}
                    />
                    Guardar
                  </button>
                  <button onClick={handleCancelar} className="btnVolver">
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ paddingRight: "10px" }}
                    />
                    Cancelar
                  </button>
                </>
              )}
            </div>
            {/* Descripción */}
            <div className="contEstudiosDet">
              <div
                style={{
                  width: "100%",
                  borderBottom: "1px solid #000",
                  marginBottom: "1rem",
                  paddingBottom: "8px",
                  paddingTop: "8px",
                }}
              >
                <p
                  className="h5"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: "0",
                  }}
                >
                  Informe
                </p>
              </div>
              {editMode ? (
                <textarea
                  className="textAreaDetalle"
                  value={descripcionEdit}
                  onChange={(e) => setDescripcionEdit(e.target.value)}
                  autoFocus
                />
              ) : (
                <>
                  {detallesEstudios?.descripcion &&
                  detallesEstudios.descripcion.trim() ? (
                    <span
                      className="textAreaDetalle"
                      style={{ background: "#fff", whiteSpace: "pre-wrap" }}
                    >
                      {detallesEstudios.descripcion}
                    </span>
                  ) : (
                    <span
                      className="textAreaDetalle"
                      style={{
                        background: "#fff",
                        whiteSpace: "pre-wrap",
                        color: "#6c757d",
                        fontStyle: "italic",
                      }}
                    >
                      No hay informe disponible
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div
            className="col-xl-8 col-md-7 col-12"
            style={{ marginTop: "25px" }}
          >
            <div className="image-viewer-grid">
              {images.map((image) => (
                <div key={image.id} className="grid-item">
                  <img
                    src={image.imagen_url}
                    alt={`Imagen ${image.id}`}
                    onClick={() => openModal(image)}
                  />
                </div>
              ))}
            </div>

            {selectedImage && (
              <>
                <Viewer
                  visible={!!selectedImage}
                  onClose={closeModal}
                  images={[
                    {
                      src: selectedImage.imagen_url,
                      alt: "Imagen ampliada",
                      style: {
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      },
                    },
                  ]}
                  zoomable
                  rotatable
                  scalable
                  noResetZoomAfterChange
                  noResetAfterChange
                  maskClosable={true}
                />
                <div className="controls">
                  <label>Brillo:</label>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    value={brightness}
                    onChange={handleBrightnessChange}
                  />
                  <label>Contraste:</label>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    value={contrast}
                    onChange={handleContrastChange}
                  />
                  <button className="btnReset" onClick={handleResetearBC}>
                    Resetear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>No se encontró el ID del estudio en la URL.</p>
      )}
    </div>
  );
};

export default DetalleEstudio;
