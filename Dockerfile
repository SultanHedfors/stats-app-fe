# Użyj oficjalnego obrazu Node.js 22.14
FROM node:22.14 AS build

# Ustaw katalog roboczy
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalowanie zależności
RUN npm install

# Kopiowanie wszystkich plików aplikacji
COPY . .

# Budowanie aplikacji Angular
RUN npm run build --prod

# Użyj obrazu serwera Nginx, aby serwować aplikację
FROM nginx:alpine

# Usuwanie domyślnej strony powitalnej Nginx (opcjonalne)
RUN rm -rf /usr/share/nginx/html/*

# Kopiowanie zbudowanej aplikacji do katalogu Nginx
COPY --from=build /app/dist/employee-stats-fe/browser /usr/share/nginx/html/

# Eksponowanie portu 80
EXPOSE 80

# Uruchamianie serwera Nginx
CMD ["nginx", "-g", "daemon off;"]
