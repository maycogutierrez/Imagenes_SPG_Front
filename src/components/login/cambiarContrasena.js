import { useState } from "react";
import Swal from "sweetalert2";
import { changePassword } from "../services/apis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ChangePasswordForm = ({ userId, closeEdit }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Controla la visibilidad de la contraseña

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setError('');
        if (newPassword) {
            try {
                await changePassword(userId, newPassword);
                Swal.fire({
                    position: "Center",
                    icon: "success",
                    title: "Contraseña actualizada con éxito",
                    showConfirmButton: false,
                    timer: 1500
                });
                closeEdit(); // Cierra el formulario después de cambiar la contraseña
            } catch (error) {
                Swal.fire({
                    position: "Center",
                    icon: "error",
                    title: "Error al cambiar la contraseña",
                    text: error.message || 'Ocurrió un error inesperado',
                    showConfirmButton: true
                });
            }
        }
    };

    return (
        <form onSubmit={handleChangePassword} className="edit-user-form">
            <h2>Cambiar Contraseña</h2>
            
            <label>Nueva Contraseña</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                    placeholder="********"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '60%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color:'#000'
                    }}
                >
                    {showPassword ? <FontAwesomeIcon className="iconoContrasena" icon={faEyeSlash}/> : <FontAwesomeIcon className="iconoContrasena" icon={faEye}/>}
                </button>
            </div>

            <label>Confirmar Contraseña</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                    placeholder="********"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '60%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color:'#000'
                    }}
                >
                    {showPassword ? <FontAwesomeIcon className="iconoContrasena" icon={faEyeSlash}/> : <FontAwesomeIcon className="iconoContrasena" icon={faEye}/>}
                </button>
            </div>

            {error && <span className="error-message">{error}</span>}

            <button className="btnBorrarFiltro" type="submit" style={{ marginTop: "15px" }}>
                Actualizar Contraseña
            </button>
            <button type="button" onClick={closeEdit} className="cancel-button">
                Cancelar
            </button>
        </form>
    );
};

export default ChangePasswordForm;
