FROM nginx:stable-alpine3.17-slim
RUN apt-get update && apt-get install -y curl && apt-get clean
RUN rm -rf /usr/share/nginx/html/*
RUN rm -rf /etc/nginx/conf.d/default.conf 
RUN mkdir -p /usr/share/nginx/html/js/
RUN mkdir -p /usr/share/nginx/html/img/
COPY docker/config/default.conf.template /etc/nginx/conf.d/
COPY docker/entry.sh /
RUN chmod +x entry.sh
COPY dist/js/ /usr/share/nginx/html/js/
COPY dist/index.html /usr/share/nginx/html/
ENTRYPOINT ["/entry.sh"]
CMD ["nginx", "-g", "daemon off;"]