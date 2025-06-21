# --------------------
# Stage 1: build Go tools (CloudFox + enumerate-iam)
# --------------------
FROM golang:1.23-alpine AS go-builder
RUN apk add --no-cache git curl unzip ca-certificates

# CloudFox
RUN curl -fsSL https://github.com/BishopFox/cloudfox/archive/refs/heads/main.zip -o cloudfox.zip \
 && unzip cloudfox.zip \
 && cd cloudfox-main \
 && go build -ldflags="-s -w" -o /usr/local/bin/cloudfox . \
 && cd / \
 && rm -rf cloudfox.zip cloudfox-main

# enumerate-iam
RUN git clone https://github.com/andresriancho/enumerate-iam.git /enumerate-iam \
 && cd /enumerate-iam \
 && go build -ldflags="-s -w" -o /usr/local/bin/enumerate-iam . \
 && cd / \
 && rm -rf /enumerate-iam

# --------------------
# Stage 2: assemble final image
# --------------------
FROM python:3.10-alpine

# install common dependencies
RUN apk add --no-cache \
      bash aws-cli curl git jq python3-dev py3-pip unzip ca-certificates \
 && pip3 install --upgrade pip

# ScoutSuite (Python)
RUN pip3 install --no-cache-dir https://github.com/nccgroup/ScoutSuite/archive/refs/heads/master.zip

# CloudPEASS (Python)
RUN git clone --depth 1 https://github.com/carlospolop/CloudPEASS.git /opt/cloudpeass \
 && pip3 install -r /opt/cloudpeass/requirements.txt \
 && ln -s /opt/cloudpeass/CloudPEASS.py /usr/local/bin/cloudpeass

# PACU (Python)
RUN git clone --depth 1 https://github.com/RhinoSecurityLabs/pacu.git /opt/pacu \
 && pip3 install -r /opt/pacu/requirements.txt \
 && ln -s /opt/pacu/pacu.py /usr/local/bin/pacu

# bring in Go-built binaries
COPY --from=go-builder /usr/local/bin/cloudfox      /usr/local/bin/cloudfox
COPY --from=go-builder /usr/local/bin/enumerate-iam /usr/local/bin/enumerate-iam

# our orchestrator script
WORKDIR /opt/enum
COPY run_all.sh /opt/enum/run_all.sh
RUN chmod +x run_all.sh

ENTRYPOINT ["./run_all.sh"]
