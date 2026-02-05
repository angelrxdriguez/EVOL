# Enunciado — App Multiplataforma de Gestión de Actividades y Reservas

## 1. Objetivo del proyecto
Desarrollar una **aplicación multiplataforma** que permita **gestionar actividades y reservas** de forma centralizada desde:

- **Escritorio** (aplicación de escritorio)
- **Móvil** (aplicación móvil)

La aplicación simulará un negocio a elegir (por ejemplo: **gimnasio**, **centro de estudios**, **restaurante con eventos**, etc.). El objetivo es que los usuarios puedan **ver actividades y reservar plaza**, y que el administrador pueda **crear actividades y controlar reservas/asistencia**.

---

## 2. Tecnologías obligatorias
El proyecto debe seguir esta arquitectura:

- **Base de datos única**: **MongoDB**
- **Front-end Escritorio**: **Vue.js + Electron**
- **Front-end Móvil**: **Flutter + Material Design**

> El backend queda a elección del alumno (tecnología libre), pero debe trabajar con **MongoDB** como base de datos central.

---

## 3. Roles de usuario
La app debe tener **autenticación** (login y registro) y distinguir el rol del usuario:

### 3.1. Rol: Administrador
El administrador podrá:

- **Crear, modificar y eliminar actividades**
- **Consultar reservas**
- **Controlar la asistencia** (ver quién ha asistido realmente o quién debe contarse como asistente)

### 3.2. Rol: Usuario
El usuario podrá:

- Registrarse e iniciar sesión
- Ver el **listado de actividades disponibles**
- Realizar una **reserva** (inscripción)
- Cancelar una reserva bajo ciertas condiciones

---

## 4. Gestión de actividades
Cada actividad debe tener como mínimo los siguientes campos:

- **Nombre**
- **Descripción**
- **Fecha y hora**
- **Plazas máximas**

El sistema debe impedir que se puedan crear actividades con datos inválidos (por ejemplo, plazas negativas, fecha vacía, etc.).

---

## 5. Gestión de reservas
Las reservas deben cumplir obligatoriamente estas reglas:

### 5.1. Sin reservas duplicadas
Un usuario **no puede reservar dos veces** la misma actividad.

### 5.2. Control de aforo
No se podrán crear reservas si la actividad ya alcanzó su **cupo máximo de asistentes**.

### 5.3. Cancelación limitada en el tiempo
Un usuario solo podrá **cancelar su inscripción** hasta **15 minutos antes** del inicio de la actividad.

- Si el usuario **no cancela a tiempo**, se dará por hecho que **asistió**.
- No se requiere un sistema complejo de “check-in”; basta con aplicar esta regla.

### 5.4. Control de asistencia
El sistema debe permitir al administrador **consultar quién cuenta como asistente**, en base a:

- Inscritos que no cancelaron dentro del tiempo permitido → **se consideran asistentes**
- (Opcional si lo implementas) Inscritos cancelados a tiempo → **no asistentes**

---

## 6. Requisitos mínimos obligatorios (resumen)
La app debe incluir:

- Login + registro
- Identificación de roles (admin / usuario)
- CRUD de actividades (admin)
- Reservas (usuario)
- Reglas de negocio:
  - sin duplicados
  - plazas máximas
  - cancelación hasta 15 minutos antes
- BD central en MongoDB compartida por móvil y escritorio

---

## 7. Extras que suman nota (puntos extra)
Se valorará especialmente incluir:

- **Validaciones de datos en el backend** (reglas y control de errores del lado servidor)
- **README.md** bien documentado, incluyendo:
  - cómo ejecutar el proyecto
  - cómo usar la app
  - explicación general del funcionamiento
  - **2 diagramas de casos de uso** (hechos con draw.io u otra herramienta)  
    - ejemplo: “Reservar actividad”, “Cancelar reserva”, “Crear actividad”, etc.
- **dificultades.md** explicando problemas encontrados y cómo se resolvieron

---

## 8. Aspectos que restan nota (muy importante)
- **Permitir reservas duplicadas** (esto se considera un fallo grave)
- No controlar cupo máximo / permitir reservas erróneas
- No respetar la regla de cancelación de 15 minutos
