# Tienda Online de Juegos de Mesa

Aplicación web desarrollada con **Sails.js** y **MySQL** que permite gestionar un catálogo de juegos de mesa, con funcionalidades de usuario, carrito y panel de administración.

## Despliegue en producción

La aplicación está desplegada en una máquina virtual Ubuntu dentro de OpenStack y es accesible públicamente.

URL: http://172.16.11.195

---

## Tecnologías utilizadas

- **Backend:** Sails.js (Node.js)
- **Frontend:** EJS + CSS
- **Base de datos:** MySQL 8
- **Servidor web:** Nginx (proxy inverso)
- **Infraestructura:** OpenStack (Ubuntu Server)
- **Gestión de procesos:** systemd
- **Control de versiones:** Git + GitHub

---

## Funciones principales

### Usuarios
- Registro e inicio de sesión
- Gestión de sesión
- Diferenciación de roles (usuario / admin)

### Catálogo
- Listado de juegos
- Filtro por categorías
- Vista detallada de producto

### Carrito
- Añadir productos
- Persistencia mediante cookies
- Contador dinámico

### Administración (Admin)
- CRUD de juegos
- Gestión de stock
- Edición de descripciones e imágenes

---

## Arquitectura del sistema


Usuario → Nginx → Node.js (Sails) → MySQL


- **Nginx** actúa como proxy inverso.
- **Sails.js** gestiona la lógica de negocio.
- **MySQL** almacena los datos.

---

## Instalación en local

### Clonar repositorio

```bash
git clone https://github.com/clover81/tienda-juegos-sails.git
cd tienda-juegos-sails
```
## Instalar dependencias
`npm install`

## Configurar base de datos

Crear base de datos:

CREATE DATABASE tienda_mesa;

Configurar conexión en config/datastores.js:

url: 'mysql://usuario:password@localhost:3306/tienda_mesa'

## Ejecutar la aplicación
sails lift

## Despliegue en servidor (OpenStack)
Preparación del servidor
sudo apt update && sudo apt install nginx mysql-server git -y
Clonar proyecto
cd /var/www
git clone https://github.com/clover81/tienda-juegos-sails.git
cd tienda
npm install --production

Configurar servicio systemd

Archivo: /etc/systemd/system/tienda.service
```bash
[Unit]
Description=Tienda Sails
After=network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/tienda
Environment=NODE_ENV=production
ExecStart=/ruta/a/node app.js
Restart=always

[Install]
WantedBy=multi-user.target
```
Activar servicio:

sudo systemctl daemon-reload
sudo systemctl enable tienda
sudo systemctl start tienda
Configuración de Nginx

Archivo: /etc/nginx/sites-available/tienda
```bash
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:1337;
        proxy_set_header Host $host;
    }
}
```
Activar:

sudo ln -s /etc/nginx/sites-available/tienda /etc/nginx/sites-enabled/
sudo systemctl restart nginx

## Actualización del despliegue
cd /var/www/tienda
git pull
npm install --production   # si cambian dependencias
sudo systemctl restart tienda

Seguridad y producción

Estrategia de migración: migrate: safe

Configuración de orígenes WebSocket en producción

Proxy inverso con Nginx

Servicio persistente con systemd

## Estado del proyecto

✔ Aplicación funcional
✔ Despliegue en producción
✔ Acceso público
✔ CRUD completo
✔ Gestión de usuarios y carrito

## Autor

Alejandro
Proyecto académico para Desarrollo Web en Entorno Servidor — Desarrollo de Aplicaciones Web (DAW)
