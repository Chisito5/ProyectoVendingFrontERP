import { solicitarApi } from '../api/client';

/**
 * SYSCOOP
 * category: Service
 * package: resources/js/services
 * author: Vladimir Meriles Velasquez
 * fecha: 28-02-2026
 *
 * CRUD de usuarios para jerarquia Dueno/Admin/Operador.
 */
export const usuarioService = {
    listar(loFiltros = {}) {
        return solicitarApi({ method: 'get', url: '/usuario', params: loFiltros });
    },
    obtener(tnUsuario) {
        return solicitarApi({ method: 'get', url: `/usuario/${tnUsuario}` });
    },
    crear(loPayload) {
        return solicitarApi({ method: 'post', url: '/usuario', data: loPayload });
    },
    actualizar(tnUsuario, loPayload) {
        return solicitarApi({ method: 'patch', url: `/usuario/${tnUsuario}`, data: loPayload });
    },
    actualizarRol(tnUsuario, loPayload) {
        const loData = {
            Version: loPayload.Version,
            Motivo: loPayload.Motivo,
            Rol: loPayload.Rol ?? loPayload.Roles ?? [],
            Roles: loPayload.Roles ?? loPayload.Rol ?? [],
        };
        return solicitarApi({ method: 'put', url: `/usuario/${tnUsuario}/rol`, data: loData });
    },
    obtenerRol(tnUsuario) {
        return solicitarApi({ method: 'get', url: `/usuario/${tnUsuario}/rol` });
    },
    eliminarLogico(tnUsuario, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/usuario/${tnUsuario}`, data: loPayload });
    },
    listarMaquinas(tnUsuario, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/usuario/${tnUsuario}/maquina`, params: loFiltros });
    },
    asignarMaquina(tnUsuario, loPayload) {
        return solicitarApi({ method: 'post', url: `/usuario/${tnUsuario}/maquina`, data: loPayload });
    },
    quitarMaquina(tnUsuario, tnMaquina, loPayload = {}) {
        return solicitarApi({ method: 'delete', url: `/usuario/${tnUsuario}/maquina/${tnMaquina}`, data: loPayload });
    },
    listarAdministradoresPorMaquina(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/administradores`, params: loFiltros });
    },
    listarOperadoresPorMaquina(tnMaquina, loFiltros = {}) {
        return solicitarApi({ method: 'get', url: `/maquina/${tnMaquina}/operadores`, params: loFiltros });
    },
};
