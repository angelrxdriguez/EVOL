# Bcrypt para contraseñas

En este proyecto la contraseña **no se guarda en texto normal**.  
Cuando una persona se registra, la contraseña se transforma en un hash con `bcrypt` y ese hash es lo que se guarda en MongoDB.

Así, si alguien ve la base de datos, no verá la contraseña real.

## Cómo lo estoy usando

1. En el servidor importo `bcrypt`.
2. En `/registro` hago el hash con fuerza `12`.
3. En `/login` comparo la contraseña escrita con el hash guardado.

## Ejemplo literal: importación

```js
import bcrypt from 'bcrypt'
```

## Ejemplo literal: registro (guardar hash)

```js
const contrasenaHash = await bcrypt.hash(String(contrasena), 12)

const result = await usuariosCollection.insertOne({
  nombreUsuario: nombreUsuarioLimpio,
  nombre: nombreLimpio,
  apellidos: apellidosLimpio,
  contrasena: contrasenaHash,
  es_admin: 0,
  rol: 'user',
  createdAt: new Date(),
})
```

## Ejemplo literal: login (comparar contraseña)

```js
const contrasenaValida = await bcrypt.compare(
  String(contrasena),
  String(user.contrasena || '')
)

if (!contrasenaValida) {
  return res.status(401).json({ ok: false, error: 'Usuario o contrasena incorrectos' })
}
```

## Imagen del usuario con contraseña hasheada en MongoDB

![Usuario con contraseña hasheada en MongoDB](usuariohash.png)
