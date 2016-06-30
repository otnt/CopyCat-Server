FROM node:latest

#COPY . /workspace
#WORKDIR /workspace

## Provides cached layer for node_modules
#ADD package.json /tmp/package.json
#RUN cd /tmp && npm install
#RUN mkdir -p /src && cp -a /tmp/node_modules /src/
#
## Define working directory
#WORKDIR /src
#ADD . /src

WORKDIR /workspace
ADD package.json /workspace
RUN npm install
ADD . /workspace

# Expose port
EXPOSE 3001

# Run app using nodemon
#CMD ["npm", "start"]

CMD ["npm", "start"]
