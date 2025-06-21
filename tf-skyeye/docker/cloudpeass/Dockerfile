# docker/cloudpeass/Dockerfile
FROM python:3.10-alpine

RUN apk add --no-cache \
    git \
    python3 \
    py3-pip \
    aws-cli

WORKDIR /opt/cloudpeass
RUN git clone --depth 1 https://github.com/carlospolop/CloudPEASS.git .

# only install its requirements
RUN pip install --no-cache-dir -r requirements.txt

# copy in our tiny wrapper
COPY entrypoint-cloudpeass.sh /usr/local/bin/entrypoint-cloudpeass
RUN chmod +x /usr/local/bin/entrypoint-cloudpeass

ENTRYPOINT ["entrypoint-cloudpeass"]
CMD []
