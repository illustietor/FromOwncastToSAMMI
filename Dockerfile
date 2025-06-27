# Dockerfile
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de tu proyecto
COPY package.json ./
COPY index.js ./

# Instala las dependencias
RUN npm install

# Expone el puerto del servidor
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
CMD ["node", "index.js"]