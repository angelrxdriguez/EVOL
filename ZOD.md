# Validaciones Zod en la pagina de registro.

He decidido aplicar las validaciones únicamente en el front ya que ya hacía en el back.
En `src/views/RegistroView.vue` se usan validaciones Zod justo antes de enviar el formulario de registro al backend (`/api/registro`).

La idea es simple:
- Primero se validan los datos en frontend.
- Si algo falla, se muestra un mensaje claro y no se hace el `fetch`.
- Si todo esta bien, se construye el `payload` y se envia.

## Donde se aplican

Lo he aplicado en estos 3 puntos:

1. `esquemaRegistro`: define las reglas del formulario.
2. `validarConZod()`: ejecuta `safeParse` y devuelve `ok/error`.
3. `crearCuenta()`: llama a la validacion antes de enviar datos.

## Como se aplican

### 1) Esquema con reglas por campo

```js
const esquemaRegistro = z
  .object({
    nombreUsuario: z.string().trim().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios"),
    contraseña: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    repetircontraseña: z.string().min(1, "Repite la contraseña"),
  })
  .refine((datos) => datos.contraseña === datos.repetircontraseña, {
    message: "Las contraseñas no coinciden",
    path: ["repetircontraseña"],
  });
```

### 2) Validacion del formulario

```js
function validarConZod() {
  const datosFormulario = {
    nombreUsuario: usuarioNuevo.value,
    nombre: nombreNuevo.value,
    apellidos: apellidosNuevos.value,
    contrasena: contrasenaNueva.value,
    repetircontrasena: repetircontrasenaNueva.value,
  };

  const resultado = esquemaRegistro.safeParse(datosFormulario);

  if (!resultado.success) {
    const primerError = resultado.error.issues?.[0]?.message || "Datos invalidos";
    return { ok: false, error: primerError };
  }

  return { ok: true, datos: resultado.data };
}
```

### 3) Bloqueo de envio si hay error

```js
const validacion = validarConZod();
if (!validacion.ok) {
  mensajeErrorRegistro.value = validacion.error;
  return;
}
```

Con esto, si hay error no se llega a ejecutar el `fetch`.

## Que controlan estas validaciones

- `nombreUsuario`: minimo 3 caracteres (con `trim` para evitar espacios al inicio/final).
- `nombre`: obligatorio.
- `apellidos`: obligatorio.
- `contrasena`: obligatoria y minimo 6 caracteres.
- `repetircontrasena`: obligatoria.
- Regla cruzada (`refine`): la contraseña repetida debe coincidir con la original.

## Ejemplos rapidos

Caso valido:

```js
{
  nombreUsuario: "maria88",
  nombre: "Maria",
  apellidos: "Lopez Ruiz",
  contraseña: "clave123",
  repetircontraseña: "clave123"
}
```

Caso invalido (usuario corto):

```js
{
  nombreUsuario: "ab",
  nombre: "Ana",
  apellidos: "Perez",
  contraseña: "123456",
  repetircontraseña: "123456"
}
```

Error esperado: `El nombre de usuario debe tener al menos 3 caracteres`.

Caso invalido (contraseñas distintas):

```js
{
  nombreUsuario: "ana123",
  nombre: "Ana",
  apellidos: "Perez",
  contraseña: "123456",
  repetircontraseña: "654321"
}
```

Error esperado: `Las contraseñas no coinciden`.
