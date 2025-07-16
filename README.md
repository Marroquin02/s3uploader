# S3 File Uploader

Aplicación web para subir archivos a Amazon S3 de forma segura y sencilla con autenticación y autorización integrada.

## 🚀 Características

- **Autenticación con Keycloak**: Sistema de login seguro con SSO
- **Autorización basada en roles**: Control de acceso granular
- **Subida de archivos a S3**: Compatible con AWS S3, MinIO y otros servicios S3
- **SSR (Server-Side Rendering)**: Sin problemas de CORS
- **Interfaz moderna**: UI responsive con modo oscuro
- **Validación en tiempo real**: Verificación de configuración antes de subir
- **Gestión de carpetas**: Organización de archivos personalizada
- **Middleware de protección**: Rutas protegidas automáticamente

## 🔐 Sistema de Autenticación

La aplicación utiliza **NextAuth.js** con **Keycloak** como proveedor de identidad, ofreciendo:

- **Single Sign-On (SSO)**: Integración con sistemas existentes
- **Gestión de roles**: Control de acceso basado en roles de Keycloak
- **Sesiones seguras**: Tokens JWT con renovación automática
- **Logout completo**: Cierre de sesión tanto en la aplicación como en Keycloak
- **Páginas personalizadas**: Login y error pages adaptadas

### Funcionalidad de Logout

El sistema implementa un **logout completo** que:

1. **Cierra la sesión local**: Elimina la sesión de NextAuth.js
2. **Redirige a Keycloak**: Termina la sesión SSO en el servidor de identidad
3. **Limpia todas las sesiones**: Asegura que no queden sesiones activas
4. **Retorna a la aplicación**: Redirige de vuelta después del logout completo

### Roles Predefinidos

- **admin/administrator**: Acceso completo a todas las funciones
- **uploader**: Puede subir archivos
- **moderator**: Puede eliminar archivos
- **user**: Acceso básico (solo visualización)

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Keycloak Configuration (Server-side)
KEYCLOAK_CLIENT_ID=your-keycloak-client-id
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_ISSUER=https://your-keycloak-server.com/realms/your-realm

NEXT_PUBLIC_S3_CONFIG_STORAGE_KEY=s3_config
NEXT_PUBLIC_S3_SALT_KEY=s3_salt

# Keycloak Configuration (Client-side - for logout)
KEYCLOAK_CLIENT_ID_PUBLIC=your-keycloak-client-id
KEYCLOAK_ISSUER=https://your-keycloak-server.com/realms/your-realm
```

> **⚠️ Configuración con Subpath**: Si usas la imagen Docker `-uploader` o configuras `basePath: "/uploader"`, debes ajustar `NEXTAUTH_URL`:
> ```bash
> NEXTAUTH_URL=http://localhost:3000/uploader/api/auth
> NEXTAUTH_URL_INTERNAL=http://localhost:3000/uploader/api/auth
> ```

> **Nota**: Las variables de Keycloak ahora se configuran dinámicamente en tiempo de ejecución para mayor flexibilidad en Docker.

### Configuración de Keycloak

1. **Crear un Cliente en Keycloak**:
   - Client ID: `s3uploader`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: 
     - Versión estándar: `http://localhost:3000/api/auth/callback/keycloak`
     - Versión con subpath: `http://localhost:3000/uploader/api/auth/callback/keycloak`

2. **Configurar Roles**:
   - Crear roles: `admin`, `uploader`, `moderator`
   - Asignar roles a usuarios según necesidades

3. **Configurar Mappers** (opcional):
   - Agregar mapper para grupos si usas grupos de Keycloak
   - Configurar claims personalizados si es necesario

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

> **⚠️ IMPORTANTE**: Al usar la imagen `-uploader`, es **CRÍTICO** configurar correctamente las variables de entorno de NextAuth:
> 
> ```bash
> # ✅ CORRECTO - Incluir /uploader/api/auth
> NEXTAUTH_URL=http://localhost:3000/uploader/api/auth
> NEXTAUTH_URL_INTERNAL=http://localhost:3000/uploader/api/auth
> 
> # ❌ INCORRECTO - Sin el subpath
> NEXTAUTH_URL=http://localhost:3000/api/auth
> ```
> 
> **Ejemplo completo con Docker Compose:**
> ```yaml
> version: '3.8'
> services:
>   s3uploader:
>     image: marroquin02/s3uploader:v0.1.0-uploader
>     ports:
>       - "3000:3000"
>     environment:
>       - NEXTAUTH_URL=http://localhost:3000/uploader/api/auth
>       - NEXTAUTH_URL_INTERNAL=http://localhost:3000/uploader/api/auth
>       - NEXTAUTH_SECRET=your-secret-key
>       - KEYCLOAK_CLIENT_ID=your-client-id
>       - KEYCLOAK_CLIENT_SECRET=your-client-secret
>       - KEYCLOAK_ISSUER=https://your-keycloak.com/realms/realm
> ```

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
