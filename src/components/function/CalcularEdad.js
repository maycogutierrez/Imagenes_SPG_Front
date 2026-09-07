export const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};


export const capitalizeFirstLetter = (string) => {
    if (!string) return ""; // Maneja null, undefined o string vacío
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};