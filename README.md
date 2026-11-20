# NEXA APK STUDIO

Aplicación web inicial para crear proyectos Android a partir de URL, HTML y ZIP. Frontend Vite, API serverless de Vercel, autenticación y almacenamiento Supabase, compilación delegada a GitHub Actions con Capacitor y Gradle.

## Configuración necesaria

### 1. Supabase
1. Crea un proyecto Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. En Authentication activa Email y Google y configura las URL de redirección de tu dominio Vercel.
4. Copia Project URL, anon/public key y service_role key.

### 2. Vercel
Configura:
- `VITE_SUPABASE_URL`: Project URL.
- `VITE_SUPABASE_ANON_KEY`: anon/public key.
- `SUPABASE_URL`: Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (solo servidor).
- `GITHUB_TOKEN`: token de GitHub con permiso Actions: write.
- `GITHUB_OWNER=scriptsvoidrey`
- `GITHUB_REPO=Generador-Build-`

No expongas `SUPABASE_SERVICE_ROLE_KEY` ni `GITHUB_TOKEN` como variables `VITE_*`.

### 3. GitHub Actions
En Settings > Secrets and variables > Actions añade `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Habilita GitHub Actions y permite ejecutar workflows.

### 4. Despliegue
Importa `scriptsvoidrey/Generador-Build-` en Vercel. Usa `npm run build` y el directorio `dist`.

## Limitaciones antes de producción
- La salida actual es un APK debug sin firma de publicación.
- Las URL remotas se muestran dentro de un iframe; sitios que bloquean iframe no se visualizarán correctamente.
- Aún no hay selector de permisos Android ni icono personalizado por aplicación.
- Faltan límites de uso por usuario, pruebas automatizadas, pruebas de extremo a extremo y política de retención.
- Google OAuth requiere credenciales del proveedor configuradas en Supabase.
- No considerar listo para producción hasta configurar los servicios y ejecutar una compilación real completa.
