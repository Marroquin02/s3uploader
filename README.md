# S3 File Uploader

Aplicación web para subir archivos a Amazon S3 de forma segura y sencilla.

## 🚀 Características

- **Subida de archivos a S3**: Compatible con AWS S3, MinIO y otros servicios S3
- **SSR (Server-Side Rendering)**: Sin problemas de CORS
- **Interfaz moderna**: UI responsive con modo oscuro
- **Validación en tiempo real**: Verificación de configuración antes de subir
- **Gestión de carpetas**: Organización de archivos personalizada

## 🔧 Configuración S3

Para usar la aplicación, configura los siguientes parámetros:

- **Endpoint**: URL del servicio S3 (ej: `https://s3.amazonaws.com`)
- **Región**: Región del bucket S3 (ej: `us-east-1`)
- **Access Key ID**: Clave de acceso
- **Secret Access Key**: Clave secreta
- **Bucket**: Nombre del bucket S3

## 🐳 Docker (Recomendado)

### Imágenes Disponibles

Hay dos versiones de la imagen Docker disponibles:

#### Versión Estándar (Path: `/`)
```bash
docker run -p 3000:3000 marroquin02/s3uploader:v0.1.0
```
Accede en: `http://localhost:3000`

#### Versión con Subpath (Path: `/uploader`)
```bash
docker run -p 3000:3000 marroquin02/s3uploader:v0.1.0-uploader
```
Accede en: `http://localhost:3000/uploader`

### Construcción Local (Solo para Desarrollo)

Si necesitas construir las imágenes localmente:

```bash
# Versión estándar
docker build -t s3uploader:local .

# Versión con subpath
docker build --build-arg NEXT_PUBLIC_BASE_PATH="/uploader" -t s3uploader:local-uploader .
```

## 🚀 Desarrollo Local

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd s3uploader
```

2. Instala dependencias:
```bash
pnpm install
```

3. Ejecuta el servidor:
```bash
pnpm dev
```

4. Abre [http://localhost:3000](http://localhost:3000)

## 🏗️ Arquitectura

- **Next.js 15** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **AWS SDK v3** para S3 (solo en servidor)
- **API Routes** para SSR sin problemas de CORS

## 🔒 Seguridad

- Las credenciales S3 se procesan únicamente en el servidor
- No se almacenan credenciales en el cliente
- Validación de archivos antes del upload
