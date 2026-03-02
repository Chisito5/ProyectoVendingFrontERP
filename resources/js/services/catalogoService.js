import { solicitarApi } from '../api/client';

export const catalogoService = {
    listarEstados(tcEntidad = null) {
        const loParametros = tcEntidad ? { Entidad: tcEntidad } : undefined;
        return solicitarApi({ method: 'get', url: '/estado', params: loParametros });
    },
    listarTiposEmpresa() {
        return solicitarApi({ method: 'get', url: '/tipoempresa' });
    },
    listarTiposInternet() {
        return solicitarApi({ method: 'get', url: '/tipointernet' });
    },
    listarTiposLugarInstalacion() {
        return solicitarApi({ method: 'get', url: '/tipolugarinstalacion' });
    },
};
