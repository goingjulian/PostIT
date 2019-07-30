FROM node:10-alpine

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

# Copy API and install dependecies
WORKDIR /home/app

# COPY ./ideaboard-server/package*.json ./

# RUN npm install

COPY ./postit-server .

# Build client and place it in public folder of API
# WORKDIR /home/app/temp

# COPY ./ideaboard-client .

# RUN npm install

# RUN npm run build

# WORKDIR /home/app

# RUN ls

# RUN cp -a temp/build/. public/

# RUN ls

# WORKDIR /home/app

# Define environment variables
ENV DB_URL=some_url.com
ENV DB_PORT=27017
ENV DB_USER=username
ENV DB_PASSWORD=pass
ENV DB_NAME=ideaboard
ENV DB_AUTH=admin
ENV DB_SRV=true

ENV APP_PORT=3010
ENV SECRET_KEY=C6HS@+RhbJL7E{^c

ENV EMAIL_HOST=smtp.gmail.com
ENV EMAIL_PORT=587
ENV EMAIL_ADDR=mail@domain.com
ENV EMAIL_PASSWORD=pass
ENV EMAIL_BASE_URL_TO_PAGE=https://postit.korfdegidts.nl

ENV IMAGE_SERVER_URL=postit.korfdegidts.nl
ENV IMAGE_SERVER_PORT=443
ENV IMAGE_SERVER_PROTOCOL=https
ENV IMAGE_MAX_SIZE_IN_MB=5

ENV VAPID_SUBJECT=mailto:mail@domain.com
ENV VAPID_PUBLIC_KEY=BDVtR_fsu51tleq9w89l5ESki3vDnwv4SVnH9siIclHpCJZqmfNYYOm2BoCgJiCMi90PH0IdO2YKx5CKExRqT5w
ENV VAPID_PRIVATE_KEY=FSW-8BWG9CV9BU-wlY0tYTzPiUUyOdQEFqP7HQU92qA

EXPOSE 3010
RUN ls
CMD [ "node", "server.js" ]
