# A minimal Docker image with Node and Puppeteer
#
# Initially based upon:
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

FROM node:buster-slim

RUN apt-get update

# Install VIM, WGET, GNUPG, ca-certificates, CHROME, wait-for-it.sh
RUN apt-get install -y vim wget gnupg ca-certificates

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - 

RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
        && apt-get update \
        # We install Chrome to get all the OS level dependencies.
        && apt-get install -y google-chrome-stable


# Cleanup packages
RUN rm -rf /var/lib/apt/lists/* 

# https://github.com/vishnubob/wait-for-it
RUN wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
        # Make executable
        && chmod +x /usr/sbin/wait-for-it.sh

# Add an alias
RUN echo 'alias ll="ls -la"' >> ~/.bashrc

WORKDIR /usr/src/app

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
        && mkdir -p /home/pptruser \
        && chown -R pptruser:pptruser /home/pptruser 

# Copy all scripts.
COPY . ./

# Install all node dependencies
# Add user so we don't need --no-sandbox.
# same layer as npm install to keep re-chowned files from using up several hundred MBs more space
RUN cd /usr/src/app \ 
        && npm install \
        && npm install -g \
        && echo "[]" > /usr/src/app/cookies/cookies.json \
        && chown -R pptruser:pptruser /usr/src

EXPOSE 8080

CMD [ "node", "server.js" ]