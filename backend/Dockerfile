# Imagen base de Red Hat (UBI). Corre como usuario no-root (1001),
# justo lo que exige la seguridad estricta de OpenShift.
FROM registry.access.redhat.com/ubi9/nodejs-20-minimal

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
