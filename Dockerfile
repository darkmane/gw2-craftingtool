FROM darkmane/showcase
MAINTAINER Sean Chitwood <darkmane@gmail.com>


ADD dist /var/www/public

WORKDIR /var/www

EXPOSE 3000
ENTRYPOINT npm install && node web.js
