# Requerimientos Backend para Frontend ERP Vending (R2)

## 1. Objetivo del producto
- Sistema: ERP operativo para vending machine.
- Roles objetivo: Dueno, Admin, Operador.
- Proposito: monitoreo ejecutivo, operacion diaria de inventario/ventas, gestion fisica de celdas, gestion comercial de producto y control de deposito.
- Regla UX: el usuario debe operar por catalogos y selectores; evitar ingreso manual de IDs.

## 2. Modulos activos del frontend
- Acceso y sesion (login, refresh, logout, permisos).
- Tablero ejecutivo + mapa + ranking + detalle por maquina.
- Analitica (resumen, ventas, rotacion, stockout, rentabilidad, mermas).
- Core operativo: stock, reservas, ventas/reversa, reposicion.
- Maestros: empresa, maquina, celda, producto, lote, planograma.
- R1 extendido: usuarios, ubicaciones, catalogo avanzado, anuncios, mermas, alertas, reportes, integracion IoT.
- R2 operativo:
  - Maquinas y celdas inteligentes (matriz 6x9 = 54).
  - Productos (dimensiones fisicas + galeria).
  - Diseno de producto por capas.
  - Deposito y transferencia a maquina.

## 3. Endpoints que ya consume frontend

### 3.1 Autenticacion y sesion
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/permisos`

### 3.2 Tablero ejecutivo
- `GET /api/tablero/resumen`
- `GET /api/tablero/ejecutivo/resumen`
- `GET /api/tablero/ejecutivo/maquinas`
- `GET /api/tablero/ejecutivo/mapa`
- `GET /api/tablero/ejecutivo/ranking`
- `GET /api/tablero/ejecutivo/maquina/{IdMaquina}/detalle`

### 3.3 Analitica
- `GET /api/analitica/resumen`
- `GET /api/analitica/ventas`
- `GET /api/analitica/rotacion`
- `GET /api/analitica/stockout`
- `GET /api/analitica/rentabilidad`
- `GET /api/analitica/mermas`

### 3.4 Core operativo
- `GET /api/stock/maquina/{IdMaquina}`
- `GET /api/stock/maquina/{IdMaquina}/seleccion/{CodigoSeleccion}`
- `GET /api/stock/movimientos`
- `POST /api/reserva`
- `POST /api/reserva/confirmar`
- `POST /api/reserva/cancelar`
- `POST /api/venta`
- `GET /api/venta`
- `POST /api/venta/reversa`
- `POST /api/reposicion/prevalidar`
- `POST /api/reposicion`
- `GET /api/reposicion`

### 3.5 Maestros / catalogos
- `GET/POST/PATCH/DELETE /api/empresa`
- `GET/POST/PATCH/DELETE /api/maquina`
- `GET/POST/PATCH/DELETE /api/maquina/{IdMaquina}/celda`
- `GET/POST/PATCH/DELETE /api/producto`
- `GET/POST/PATCH/DELETE /api/lote`
- `GET/POST/PATCH/DELETE /api/planogramacelda`
- `GET /api/estado`
- `GET /api/tipoempresa`

### 3.6 Usuarios y jerarquia
- `GET/POST/PATCH/DELETE /api/usuario`
- `GET /api/usuario/{IdUsuario}/rol`
- `PUT /api/usuario/{IdUsuario}/rol`
- `GET/POST/DELETE /api/usuario/{IdUsuario}/maquina`
- `GET /api/maquina/{IdMaquina}/administradores`
- `GET /api/maquina/{IdMaquina}/operadores`

### 3.7 Otros modulos
- `GET/POST/PATCH/DELETE /api/anuncio`
- `GET/POST/PATCH/DELETE /api/merma`
- `GET /api/alerta`
- `POST /api/alerta/regla`
- `POST /api/reporte/generar`
- `GET /api/reporte`
- `GET /api/reporte/{IdReporte}`
- `GET /api/reporte/{IdReporte}/descargar`
- `GET /api/reporte/plantillas`
- `POST /api/integracion/iot/webhook`
- `GET /api/integracion/iot/evento`
- `GET /api/integracion/iot/evento/{IdEvento}`
- `GET /api/aprobaciones`
- `POST /api/aprobaciones/solicitar`
- `POST /api/aprobaciones/{IdAprobacion}/aprobar`
- `POST /api/aprobaciones/{IdAprobacion}/rechazar`

### 3.8 R2 (celdas, deposito, diseno)
- `GET /api/maquina/{IdMaquina}/celdas/matriz`
- `POST /api/maquina/{IdMaquina}/celdas/simular-ocupacion`
- `POST /api/maquina/{IdMaquina}/celdas/asignar-producto`
- `POST /api/maquina/{IdMaquina}/celdas/liberar`
- `GET /api/maquina/{IdMaquina}/celdas/conflictos`
- `GET /api/deposito`
- `GET /api/deposito/{IdDeposito}/stock`
- `GET /api/deposito/movimientos`
- `POST /api/deposito/movimiento/entrada`
- `POST /api/deposito/movimiento/salida`
- `POST /api/deposito/transferir-a-maquina`
- `GET /api/producto/{IdProducto}/diseno`
- `POST /api/producto/{IdProducto}/diseno`
- `PATCH /api/producto/{IdProducto}/diseno`
- `POST /api/producto/{IdProducto}/diseno/render`
- `GET /api/producto/{IdProducto}/galeria`
- `POST /api/producto/{IdProducto}/imagen/lote-subir`
- `POST /api/producto/{IdProducto}/galeria/reordenar`

## 4. Datos minimos que frontend necesita por dominio

### 4.1 Tablero por maquina
- `IdMaquina`
- `CodigoMaquina`
- `NombreMaquina`
- `TipoMaquina`
- `EstadoMaquina`
- `EstadoOperativo`
- `Responsables[]` con `Nombre` y `Rol`
- `VentasPeriodo`
- `IngresosPeriodo`
- `ProductoEstrella`
- `Alertas`
- `Latitud`
- `Longitud`

### 4.2 Detalle de maquina
- `Maquina`
- `VentasResumen`
- `TopProductos[]`
- `VentasPorDia[]`
- `AlertasActivas[]`
- `MermasResumen`
- `UltimosMovimientosStock[]`

### 4.3 Usuario
- `IdUsuario`
- `NombreUsuario`
- `Nombres`
- `Estado`
- `RolActual` (estructura clara, no objeto serializado a string)
- `MaquinasAsignadas[]`

### 4.4 Producto
- `IdProducto`
- `CodigoProducto`
- `NombreProducto`
- `Precio`
- `Estado`
- `Version`
- `AnchoMm`
- `AltoMm`
- `ProfundidadMm`
- `PesoGr`
- `Orientacion`
- `PermiteGiro`
- `UnidadEmpaque`

### 4.5 Celda
- `IdCelda`
- `Maquina`
- `Fila`
- `Columna`
- `CodigoSeleccion`
- `EstadoCelda`
- `CapacidadMaxima`
- `CantidadDisponible`
- `CantidadReservada`
- `ProductoActual`
- `BloqueadaPor`
- `Version`

### 4.6 Deposito
- `IdDeposito`
- `NombreDeposito`
- `Estado`
- Stock por lote:
  - `Producto`
  - `Lote`
  - `CantidadDisponible`
  - `CantidadReservada`
  - `Version`
- Movimientos:
  - `IdMovimiento`
  - `Tipo`
  - `Fecha`
  - `Usuario`
  - `Cantidad`
  - `Referencia`

### 4.7 Diseno de producto por capas
- `Lienzo`:
  - `Ancho`
  - `Alto`
- `Capas[]`:
  - `Id`
  - `Tipo`
  - `Orden`
  - `X`
  - `Y`
  - `Ancho`
  - `Alto`
  - `Opacidad`
  - `Rotacion`
  - `Texto`
  - `Color`
  - `Fuente`
  - `Recurso`

## 5. Reglas de negocio criticas (backend autoritativo)
- Cada maquina tiene matriz de 54 celdas: `6 filas x 9 columnas`.
- Asignacion de producto por celda ancla (`AnchorCelda`) con `SpanColumnas` y `SpanFilas`.
- Si invade celdas ocupadas o bloqueadas, responder `409` negocio.
- Validar dimensiones del producto contra perfil fisico de maquina/celda.
- Transferencia deposito -> maquina/celda con trazabilidad y auditoria completa.
- Frontend puede simular para UX, pero la decision final la toma backend.

## 6. Contrato tecnico obligatorio
- Respuesta uniforme en todos los endpoints:
  - `{ Ok, Mensaje, Datos, Errores?, Meta? }`
- Paginacion uniforme:
  - `Meta = { PaginaActual, TamanoPagina, TotalRegistros, TotalPaginas }`
- Error de negocio/validacion por campo:
  - `Errores[] = { Codigo, Campo, Detalle }`
- HTTP consistente:
  - `400, 401, 403, 404, 409, 422`
- Versionado optimista en mutaciones:
  - `Version` obligatorio en `PUT/PATCH/DELETE` de entidades sensibles.
- Motivo obligatorio en cambios criticos.
- Idempotencia en POST transaccionales:
  - reserva, confirmar/cancelar reserva, venta, reversa, reposicion, movimientos de deposito, asignacion/liberacion de celdas.
- Replay idempotente:
  - Header `X-Repeticion-Idempotencia: si|no`.

## 7. Modelo funcional sugerido (referencia de tablas)
- `empresa` 1..N `maquina`
- `maquina` 1..N `celda`
- `producto` 1..N `producto_imagen`
- `producto` 1..1 `producto_diseno`
- `producto_diseno` 1..N `producto_diseno_capa`
- `deposito` 1..N `stock_deposito`
- `maquina/celda` 1..N `stock_maquina`
- `movimiento_stock` (origen, destino, delta, referencia)
- `usuario` N..N `maquina` (con rol)
- `auditoria` por entidad y `aprobaciones` para cambios sensibles

## 8. Prioridad de implementacion backend
1. Celdas inteligentes (matriz, simulacion, asignacion, liberacion, conflictos).
2. Deposito (stock, movimientos, transferencia a maquina/celda).
3. Producto (dimensiones fisicas completas + galeria multiple).
4. Diseno por capas (guardar/obtener/renderizar preview).
5. Homologacion de campos del tablero/analitica para evitar datos crudos en UI.

## 9. Criterio de aceptacion de integracion
- Ninguna pantalla debe depender de IDs manuales si hay catalogo disponible.
- Ninguna tabla debe mostrar objetos serializados como texto bruto.
- Todas las listas con paginacion server-side real.
- Sesion expirada debe redirigir a `/acceso?forzar=1`.
- Todos los mensajes de error de negocio deben llegar por `Errores[]` y mostrarse por campo.
