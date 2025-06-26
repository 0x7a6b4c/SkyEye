#── stage-1: get bash, curl, jq, python3 ─────────────────────────────────
FROM alpine:3.14 AS stage-1
RUN apk add --no-cache bash curl jq python3

#── builder: clone & compile Cloudfox ────────────────────────────────────
FROM golang:1.23-alpine AS builder
RUN apk add --no-cache git
WORKDIR /src/cloudfox
RUN git clone --depth 1 https://github.com/BishopFox/cloudfox.git . \
 && go build -ldflags "-s -w" -o cloudfox

#── final image: assemble runtime ────────────────────────────────────────
FROM alpine:3.14
# runtime deps
RUN apk add --no-cache bash curl jq python3 aws-cli

# bring in the runtime bits
COPY --from=stage-1 /bin/bash    /bin/
COPY --from=stage-1 /usr/bin/curl /usr/bin/
COPY --from=stage-1 /usr/bin/jq   /usr/bin/
COPY --from=stage-1 /usr/bin/python3 /usr/bin/
COPY --from=builder /src/cloudfox/cloudfox /usr/local/bin/cloudfox

# our entrypoint
COPY entrypoint-cloudfox.sh /usr/local/bin/entrypoint-cloudfox.sh
RUN chmod +x /usr/local/bin/entrypoint-cloudfox.sh

ENTRYPOINT ["/usr/local/bin/entrypoint-cloudfox.sh"]
CMD []


