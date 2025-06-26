FROM python:3.10-alpine

# install git & pip
RUN apk add --no-cache git python3-dev py3-pip

WORKDIR /opt/pacu

# clone & install PACU
RUN git clone --depth 1 https://github.com/RhinoSecurityLabs/pacu.git . \
    && pip install --no-cache-dir .

# copy & enable our launcher script
COPY entrypoint-pacu.sh /usr/local/bin/entrypoint-pacu.sh
RUN chmod +x /usr/local/bin/entrypoint-pacu.sh

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint-pacu.sh"]
CMD []