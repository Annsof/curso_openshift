# Imagen base de Red Hat (UBI), no-root, apta para OpenShift.
FROM registry.access.redhat.com/ubi9/nodejs-20

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
