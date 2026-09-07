import React, { useEffect, useState } from 'react';
import { loginUser } from '../services/apis';
import Swal from 'sweetalert2';

const Login = () => {

    useEffect(()=>{
        localStorage.clear()
    },[])

    const [formData, setFormData] = useState({
        dni: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

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
        // Validación de DNI
        if (!formData.dni || formData.dni.length < 7 || formData.dni.length > 8) {
            newErrors.dni = "El DNI debe tener entre 7 y 8 dígitos";
        }
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; 
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return; 
        try {
            const response = await loginUser(formData);
            console.log(response.data);
            if(response.status === 200){
                localStorage.setItem("token", response.data.success);
                localStorage.setItem("rol", response.data.role_id);
                localStorage.setItem("id", response.data.id);
                localStorage.setItem("dni", response.data.dni);
                localStorage.setItem("nombre", response.data.nombre);
                localStorage.setItem("apellido", response.data.apellido);
                Swal.fire({
                    position: "Center",
                    icon: "success",
                    title: "Inicio Exitoso",
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => {
                    window.location.href = "/inicio"
                }, 1500);
            }
            setServerError(''); 
        } catch (error) {
            console.error('Error al iniciar sesión:', error.response.data);
            setServerError(error.response.data.error || 'Error al iniciar sesión'); 
        }
    };


    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <label>DNI</label>
                    <input
                        type="number"
                        name="dni"
                        placeholder="99999999"
                        value={formData.dni}
                        onChange={handleChange}
                        className={errors.dni ? 'error' : ''}
                        min="1000000"
                        max="99999999"
                    />
                    <br />
                    {errors.dni && <span className="error-message">{errors.dni}</span>} 
                    <br />

                    <label>Contraseña</label>
                    <input 
                        type='password' 
                        name='password' 
                        placeholder='**********' 
                        value={formData.password} 
                        onChange={handleChange} 
                        className={errors.password ? 'error' : ''} 
                    />
                    <br />
                    {errors.password && <span className="error-message">{errors.password}</span>} 

                    {serverError && <span className="error-message">{serverError}</span>} 

                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
