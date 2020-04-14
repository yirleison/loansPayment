FROM node
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install nodemon -g
COPY . /app
RUN ls -l
VOLUME [ "/home/yirleison/git-repositories/loansPayment:/app" ]
EXPOSE 3000
CMD [ "npm", "run", "start" ]