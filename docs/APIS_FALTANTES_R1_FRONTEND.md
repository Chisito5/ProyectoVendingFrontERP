# APIs Faltantes R1 para Frontend ERP Vending

## Objetivo
Cerrar alcance de negocio R1 (Dueno/Admin/Operador, operacion avanzada, analitica, anuncios y trazabilidad) con contrato uniforme:

```json
{ "Ok": true, "Mensaje": "", "Datos": {}, "Errores": [], "Meta": {} }
```

## 1) Multiempresa y jerarquia
- `GET /api/usuario?Rol=&Empresa=&Estado=&Pagina=&TamanoPagina=`
- `GET /api/usuario/{IdUsuario}`
- `POST /api/usuario`
- `PATCH /api/usuario/{IdUsuario}`
- `DELETE /api/usuario/{IdUsuario}`
- `POST /api/asignacion/admin-maquina`
- `DELETE /api/asignacion/admin-maquina/{IdAsignacion}`
- `POST /api/asignacion/operador-maquina`
- `DELETE /api/asignacion/operador-maquina/{IdAsignacion}`
- `GET /api/asignacion/usuario/{IdUsuario}?Pagina=&TamanoPagina=`

## 2) Ubicacion y estado operativo de maquina
- `GET /api/maquina/{IdMaquina}/ubicacion`
- `PATCH /api/maquina/{IdMaquina}/ubicacion`
- `GET /api/maquina/{IdMaquina}/estado-operativo`

Campos minimos ubicacion:
- `Latitud`, `Longitud`, `Direccion`, `TipoInstalacion`, `TieneEnergiaPropia`, `Convenio`, `PlanActual`, `EstadoInstalacion`, `Version`, `Motivo`

## 3) Catalogo avanzado de producto
- `GET/POST/PATCH/DELETE /api/familia`
- `GET/POST/PATCH/DELETE /api/grupo`
- `GET/POST/PATCH/DELETE /api/subgrupo`
- `GET /api/producto/{IdProducto}/imagen?Tipo=frente|reverso|anverso|detalle`
- `POST /api/producto/{IdProducto}/imagen`
- `PATCH /api/producto/{IdProducto}/imagen/{IdImagen}`
- `DELETE /api/producto/{IdProducto}/imagen/{IdImagen}`

## 4) Campanias y anuncios
- `GET /api/campania?Empresa=&Estado=&Pagina=&TamanoPagina=`
- `GET /api/campania/{IdCampania}`
- `POST /api/campania`
- `PATCH /api/campania/{IdCampania}`
- `DELETE /api/campania/{IdCampania}`
- `POST /api/campania/{IdCampania}/asignar-productos`
- `POST /api/campania/{IdCampania}/asignar-maquinas`
- `POST /api/campania/{IdCampania}/publicar`
- `POST /api/campania/{IdCampania}/detener`

## 5) Mermas con aprobacion
- `GET /api/merma?Empresa=&Maquina=&Estado=&Pagina=&TamanoPagina=`
- `GET /api/merma/{IdMerma}`
- `POST /api/merma` (idempotente si impacta stock)
- `PATCH /api/merma/{IdMerma}`
- `DELETE /api/merma/{IdMerma}`
- `POST /api/merma/{IdMerma}/aprobar`
- `POST /api/merma/{IdMerma}/rechazar`

Campos minimos merma:
- `Maquina`, `Celda`, `Producto`, `Lote`, `Cantidad`, `TipoMerma`, `Motivo`, `Evidencia[]`, `Estado`, `Version`

## 6) Alertas operativas
- `GET /api/alerta?Empresa=&Maquina=&Tipo=&Estado=&Pagina=&TamanoPagina=`
- `POST /api/alerta/regla`
- `PATCH /api/alerta/regla/{IdRegla}`
- `POST /api/alerta/{IdAlerta}/atender`
- `POST /api/alerta/{IdAlerta}/escalar`
- `POST /api/alerta/{IdAlerta}/cerrar`

## 7) Reportes ejecutivos
- `POST /api/reporte/generar` (`Formato=csv|xlsx|pdf`)
- `GET /api/reporte/{IdReporte}/estado`
- `GET /api/reporte/{IdReporte}/descargar`
- `GET /api/reporte/plantillas`

## 8) Integracion IoT separada
- `POST /api/integracion/iot/evento` (webhook firmado)
- `GET /api/integracion/iot/evento/{IdEvento}`
- `GET /api/integracion/iot/reintentos?Pagina=&TamanoPagina=`
- `POST /api/integracion/iot/reintentos/{Id}/procesar`

Requisitos:
- Firma HMAC
- Idempotencia por `EventId`
- Persistencia payload crudo y correlacion

## 9) Analitica ejecutiva
- `GET /api/analitica/ventas?Empresa=&Desde=&Hasta=&Dimension=maquina|producto|ubicacion`
- `GET /api/analitica/rotacion?Empresa=&Desde=&Hasta=`
- `GET /api/analitica/stockout?Empresa=&Desde=&Hasta=`
- `GET /api/analitica/rentabilidad?Empresa=&Desde=&Hasta=`
- `GET /api/analitica/mermas?Empresa=&Desde=&Hasta=`

## Reglas transversales obligatorias
- Contrato uniforme en todas las respuestas.
- `Meta` de paginacion: `PaginaActual`, `TamanoPagina`, `TotalRegistros`, `TotalPaginas`.
- Versionado optimista (`Version` obligatorio en mutaciones).
- Soft delete (sin borrado fisico).
- Auditoria completa (`Antes`, `Despues`, `Motivo`, `Usuario`, `Fecha`).
- Aprobacion para cambios sensibles.
- Idempotencia en transacciones criticas.

## Usuario QA solicitado
- Usuario: `Vladimir`
- Clave: `Asadito7`
- Rol: `Admin`
- Permiso: `*`
- Estado: `Activo`

## Mensaje listo para backend (copiar y enviar)
```txt
Equipo backend: para cerrar R1 del ERP Vending en frontend necesitamos habilitar/confirmar estos bloques API:

1) Multiempresa jerarquica (Dueno/Admin/Operador)
- CRUD usuario + asignaciones admin-maquina + operador-maquina.

2) Ubicacion y estado operativo de maquina
- endpoints dedicados para ubicacion editable y estado tecnico.

3) Catalogo avanzado
- familia/grupo/subgrupo + imagenes de producto.

4) Campanias/anuncios
- CRUD + asignacion productos/maquinas + publicar/detener.

5) Mermas con aprobacion
- CRUD + aprobar/rechazar + evidencia + impacto en stock auditado.

6) Alertas operativas
- reglas de umbral + ciclo atender/escalar/cerrar.

7) Reportes exportables
- generar async + estado + descarga csv/xlsx/pdf.

8) Integracion IoT separada
- webhook firmado + idempotencia por EventId + reintentos + trazabilidad.

9) Analitica ejecutiva
- ventas, rotacion, stockout, rentabilidad, mermas con filtros empresa/fecha.

Reglas obligatorias:
- contrato uniforme {Ok, Mensaje, Datos, Errores, Meta}
- versionado optimista (Version en PUT/PATCH/DELETE)
- soft delete (sin borrado fisico)
- auditoria completa (Antes/Despues + Motivo + Usuario + Fecha)
- aprobaciones para cambios sensibles
- paginacion homogenea

Usuario QA requerido:
Usuario: Vladimir
Clave: Asadito7
Rol: Admin
Permiso: *
Estado: Activo
```
