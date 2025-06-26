FROM python:3.10-alpine

RUN apk add --no-cache git python3-dev py3-pip
WORKDIR /opt/enum-iam
RUN git clone --depth 1 https://github.com/andresriancho/enumerate-iam.git . \
 && pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["/bin/sh","-c",\
  "python3 /opt/enum-iam/enumerate-iam.py \
     --access-key $AWS_ACCESS_KEY_ID \
     --secret-key $AWS_SECRET_ACCESS_KEY \
     --region $AWS_REGION"]
