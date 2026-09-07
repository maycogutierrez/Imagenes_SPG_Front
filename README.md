# Imágenes Digitales - Frontend

Aplicación web desarrollada con **React** para la consulta, gestión y visualización de estudios médicos.

Este frontend fue desarrollado como parte de un **proyecto real**, con el objetivo de facilitar el acceso a estudios e imágenes médicas desde una interfaz web simple y centralizada.

> Este repositorio corresponde a una versión sanitizada publicada con fines de portfolio.  
> No contiene datos reales de pacientes, credenciales ni información sensible del entorno productivo.

---

## Funcionalidades

- Autenticación de usuarios.
- Consulta de pacientes y estudios.
- Búsqueda y filtrado de información.
- Visualización de imágenes asociadas a estudios.
- Navegación entre distintos estudios de un paciente.
- Vista detallada de cada estudio.
- Administración de usuarios.
- Consumo e integración con una API REST.
- Generación de documentos y reportes.
- Interfaz adaptable a distintos tamaños de pantalla.

---

## Tecnologías

- React.js
- JavaScript
- React Router
- Axios
- Bootstrap
- React Bootstrap
- jsPDF
- html2canvas
- React Viewer

---

## Arquitectura

La aplicación funciona como frontend de una solución Full Stack.

```text
React
  │
  │ HTTP / REST API
  ▼
Node.js / Express
  │
  ▼
Base de datos SQL
```

El backend asociado se encuentra disponible en:

[Back_Imagenes_SPG](https://github.com/maycogutierrez/Imagenes_SPG_Back.git)

---

## Estructura general

```text
src/
├── components/
├── data/
├── function/
├── images/
├── login/
├── services/
├── App.js
└── index.js
```

La aplicación se encuentra organizada separando componentes, servicios, funcionalidades y recursos utilizados por las diferentes pantallas.

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/maycogutierrez/Imagenes_SPG_Front.git
```

Ingresar al proyecto:

```bash
cd Front_Imagenes_Digitales
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto:

```bash
npm start
```

---

## Contexto del proyecto

El proyecto surgió de la necesidad de disponer de una plataforma web para consultar y visualizar estudios médicos de forma centralizada.

Mi participación estuvo enfocada principalmente en:

- Desarrollo de interfaces con React.
- Integración con servicios backend.
- Consumo de APIs REST.
- Navegación entre pacientes y estudios.
- Visualización de imágenes.
- Administración de usuarios.
- Generación de documentación desde la aplicación.
- Resolución de requerimientos funcionales del sistema.

---

## Privacidad

Debido a que el proyecto original trabajaba con información médica, la versión pública fue preparada específicamente para portfolio.

No se incluyen:

- Datos identificables de pacientes.
- DNI o información personal real.
- Imágenes médicas reales.
- Credenciales.
- Tokens.
- Direcciones de infraestructura.
- Configuración del entorno productivo.

---

## Autor

**Mayco A. Gutierrez**

Frontend / Full Stack Developer

[LinkedIn](https://www.linkedin.com/in/mayco-gutierrez-918b54b8/)  
[GitHub](https://github.com/maycogutierrez)