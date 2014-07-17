FROM ubuntu:precise
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y python
RUN apt-get install -y make
RUN apt-get install -y g++
RUN apt-get install -y python-software-properties
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y nodejs
ADD . ./resite
RUN cd resite && npm install

CMD cd resite && node resite.js
EXPOSE 80
