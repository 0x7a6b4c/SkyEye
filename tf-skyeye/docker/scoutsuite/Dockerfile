FROM python:3.10-alpine

RUN apk add --no-cache git python3 py3-pip
RUN pip install --no-cache-dir scoutsuite

ENTRYPOINT ["/bin/sh","-c",\
  "scout aws \
     --report-dir /output \
     --region $AWS_REGION"]
