<!-- README para el proyecto Moon Backend

Para visualizarlo en Visual Studio Code:
    0. Descomenta el archivo README.md, excepto las instrucciones
    1. Presiona CTRL + P
    2. Escribe ">Markdown" para utilizar la extensión Markdown y ver el README.md -->

### **Español**:

# Backend de Tienda Moon 🌙

Este es el backend de la aplicación Moon, construido con Node.js y Express. Proporciona una API para la gestión de datos y otras operaciones relacionadas con la aplicación Moon.

## Instalación

### Clona este repositorio:

   ```bash
   git clone https://github.com/Matias-Paz/Moon_backend.git
   ```

### Instala las dependencias:

   ```bash
   npm install
   ```

## Importar la base de datos

Asegúrate de tener una base de datos creada en tu servidor MySQL.
Utiliza el archivo "database.sql" en la raíz del proyecto para los datos iniciales en tu base de datos o puedes importar la base de datos desde el archivo "database.sql" a tu propia base de datos:

   ```bash
   mysql -u tu_usuario -p tu_base_de_datos < database.sql
   ```

## Configuración

Crea un archivo .env en la raíz del proyecto con la siguiente configuración y reemplaza los valores correspondientes:

   ```env
   DB_HOST=nombre_de_host_de_tu_bd
   DB_NAME=nombre_de_tu_bd
   DB_USER=usuario_de_tu_bd
   DB_PORT=puerto_de_tu_bd
   DB_PASSWORD=contraseña_de_tu_bd

   PORT=puerto_de_tu_servidor
```

Este archivo .env contiene la configuración necesaria para la conexión a la base de datos y la configuración del servidor.
Asegúrate de proporcionar los valores correctos para cada variable de entorno.

## Uso

### Desarrollo

   ```bash
   npm run dev
   ```

### Producción

   ```bash
   npm start
   ```

Asegúrate de configurar las variables de entorno necesarias para el entorno.

## Dependencias

- cors
- dotenv
- express
- multer
- mysql2
- zod

## Autores

- [Rysted](https://github.com/Rysted)
- [Matias-Paz](https://github.com/Matias-Paz)
- [Mikpiciosa](https://github.com/Mikpiciosa)

### **English**: 

# Moon Store Backend 🌙

This is the backend of the Moon app, built with Node.js and Express. It provides an API for data management and other operations related to the Moon application.

## Installation

### Clone this repository:

   ```bash
   git clone https://github.com/Matias-Paz/Moon_backend.git
   ```

### Install the dependencies:

   ```bash
   npm install
   ```

## Import the database

Make sure you have a database created on your MySQL server.
Use the "database.sql" file in the root of the project for the initial data in your database or you can import the database from the "database.sql" file into your own database:

   ```bash
   mysql -u your_user -p your_database < database.sql
```

## Configuration

Create an .env file at the root of the project with the following settings and override the corresponding values:

   ```env
   DB_HOST=your_bd_host_name
   DB_NAME=your_bd_name
   DB_USER=user_of_your_dbd
   DB_PORT=your_bd_port
   DB_PASSWORD=your_bd_password

   PORT=your_server_port
   ```

This .env file contains the configuration required for the database connection and server configuration.
Be sure to provide the correct values for each environment variable.

## Usage

### Development

   ```bash
   npm run dev
   ```

### Production

   ```bash
   npm start
   ```

Make sure to set the necessary environment variables for the environment.

## Dependencies

- cors
- dotenv
- express
- multer
- mysql2
- zod

## Authors

- [Rysted](https://github.com/Rysted)
- [Matias-Paz](https://github.com/Matias-Paz)
- [Mikpiciosa](https://github.com/Mikpiciosa)
