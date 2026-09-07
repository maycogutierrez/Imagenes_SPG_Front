import React, { useState, useEffect } from 'react';
import { registerUser, getRoles } from '../services/apis';
import Swal from 'sweetalert2';
import { calcularEdad } from '../function/CalcularEdad';

const Register = () => {
    const [formData, setFormData] = useState({
        dni: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellido: '',
        fechaNacimiento: ''
    });
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedGenero, setSelectedGenero] = useState('');

    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [userRole, setUserRole] = useState(null);
    const [token, setToken] = useState('');
    const [serverError, setServerError] = useState('');
    useEffect(() => {
        const fetchTokenAndUsers = async () => {
            const tok = localStorage.getItem("token");
            const rol = localStorage.getItem("rol");
            setUserRole(rol);
            setToken(tok);

            if (!tok || (Number(rol) !== 1 && Number(rol) !== 4)) {
                handleLogout();
            } else {
                const fetchRoles = async () => {
                    try {
                        const response = await getRoles(tok);
                        setRoles(response.data.roles);
                        console.log("roles: ", response.data.roles);
                    } catch (error) {
                        console.error('Error al cargar roles:', error);
                        handleLogout()

                    }
                };
                fetchRoles();
            }
        };
        fetchTokenAndUsers();
    }, []);


    const handleLogout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        window.location.href = "./"
    };
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrors({ ...errors, [e.target.name]: '' });
        setServerError('');
    };

    const validate = () => {
        let newErrors = {};

        if (!formData.dni) {
            newErrors.dni = 'El DNI es requerido';
        } else if (formData.dni.length < 7 || formData.dni.length > 8) {
            newErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Se requiere confirmar la contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.nombre)) {
            newErrors.nombre = 'El nombre solo puede contener letras, espacios y acentos';
        }
        
        
        

        if (!formData.apellido) {
            newErrors.apellido = 'El apellido es requerido';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.apellido)) {
            newErrors.apellido = 'El apellido solo puede contener letras, espacios y acentos';
        }
        
        
        

        if (!selectedGenero) {
            newErrors.genero = 'Selecciona un Genero';
        }

        if (!formData.fechaNacimiento) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
        } else {
            const edad = calcularEdad(formData.fechaNacimiento);
            if (edad > 100) {
                newErrors.fechaNacimiento = 'La edad no puede superar los 100 años';
            }
        }
        if (!selectedRoleId) {
            newErrors.role = 'Selecciona un rol';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const response = await registerUser({
                dni: formData.dni,
                password: formData.password,
                nombre: formData.nombre,
                apellido: formData.apellido,
                genero: selectedGenero,
                edad: formData.fechaNacimiento,
                role_id: selectedRoleId
            });
            console.log(response.data);
            Swal.fire({
                position: "Center",
                icon: "success",
                title: "Registro Exitoso",
                showConfirmButton: false,
                timer: 1500
            });
            setTimeout(() => {
                setFormData({
                    dni: '',
                    password: '',
                    confirmPassword: '',
                    nombre: '',
                    apellido: '',
                    edad: '',
                })
                setSelectedGenero('')
                setSelectedRoleId('')
            }, 1500);
        } catch (error) {
            console.error('Error al registrarse:', error.response.data);
            Swal.fire({
                position: "Center",
                icon: "error",
                title: "Error al registrarse",
                text:error.response.data.error,
            });
        }
    };
    const handleVolverAdministracion = (e) => {
        e.preventDefault();
        window.location.href = "./Administracion"
    }

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Registro</h2>
                <form onSubmit={handleRegister}>
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
                    {errors.dni && <><br/><span className="error-message">{errors.dni}</span><br/></>}

                    <label>Contraseña</label>

                    <input
                        type='password'
                        name='password'
                        placeholder='Contraseña'
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <><br/><span className="error-message">{errors.password}</span><br/></>}

                    <label>Repetir Contraseña</label>

                    <input
                        type='password'
                        name='confirmPassword'
                        placeholder='Confirmar Contraseña'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <><br/><span className="error-message">{errors.confirmPassword}</span><br/></>}

                    <label>Nombre</label>

                    <input
                        name='nombre'
                        placeholder='Nombre'
                        value={formData.nombre}
                        onChange={handleChange}
                        className={errors.nombre ? 'error' : ''}
                    />
                    {errors.nombre && <><br/><span className="error-message">{errors.nombre}</span><br/></>}

                    <label>Apellido</label>

                    <input
                        name='apellido'
                        placeholder='Apellido'
                        value={formData.apellido}
                        onChange={handleChange}
                        className={errors.apellido ? 'error' : ''}
                    />
                    {errors.apellido && <><br/><span className="error-message">{errors.apellido}</span><br/></>}
                    <label>Genero</label>

                    <select
                        name="genero"
                        style={{ marginBottom: "0.5rem" }}
                        value={selectedGenero} // <-- aquí el cambio
                        onChange={(e) => {
                            setSelectedGenero(e.target.value);
                            setErrors({ ...errors, genero: '' });
                        }}
                        className={errors.genero ? 'error' : ''}
                    >
                        <option value="">Selecciona el Genero</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                    </select>

                    {errors.genero && <><br/><span className="error-message">{errors.genero}</span><br/></>}

                    <label>Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        className={errors.fechaNacimiento ? 'error' : ''}
                    />
                    {errors.fechaNacimiento && <><br /><span className="error-message">{errors.fechaNacimiento}</span><br /></>}

                    <label>Rol</label>

                    <select
                        name="role"
                        onChange={(e) => {
                            setSelectedRoleId(e.target.value);
                            setErrors({ ...errors, role: '' }); // Resetea error al seleccionar
                        }}
                        className={errors.role ? 'error' : ''}
                        value={selectedRoleId} // Controla el valor del select
                    >
                        <option value="" disabled={selectedRoleId !== ''}>Selecciona un rol</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.nombre.charAt(0).toUpperCase() + role.nombre.slice(1)}
                            </option>
                        ))}
                    </select>

                    {errors.role && <><br/><span className="error-message">{errors.role}</span><br/></>}


                    <button type="submit">Registrar</button>
                    <button type="button" style={{ marginTop: "20px" }} onClick={handleVolverAdministracion}>Volver a Administracion</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
