#!/bin/bash

# 실행 전 docker-compose 명령어 확인
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

# 도메인 설정 - 새로운 도메인 사용
domains=(mensclub-fashion.store mensclub-api.store)
rsa_key_size=4096
data_path="./data/certbot"
email=""
staging=0

# 기존 데이터 확인
if [ -d "$data_path" ]; then
  read -p "Existing data found. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

# TLS 매개변수 다운로드
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo "TLS parameters downloaded successfully."
fi

# 각 도메인에 대한 임시 인증서 생성
for domain in "${domains[@]}"; do
  echo "### Creating dummy certificate for $domain ..."
  path="/etc/letsencrypt/live/$domain"
  mkdir -p "$data_path/conf/live/$domain"

  docker-compose -f proxy.server.docker-compose.yaml run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
      -keyout '$path/privkey.pem' \
      -out '$path/fullchain.pem' \
      -subj '/CN=localhost'" certbot

  if [ $? -ne 0 ]; then
    echo "Failed to create dummy certificate for $domain. Aborting..."
    exit 1
  fi
  echo "Dummy certificate created successfully for $domain."
done

# Nginx 시작
echo "### Starting nginx ..."
docker-compose -f proxy.server.docker-compose.yaml up --force-recreate -d nginx

if [ $? -ne 0 ]; then
  echo "Failed to start Nginx! Aborting..."
  exit 1
fi
echo "Nginx started successfully."

# 임시 인증서 삭제
for domain in "${domains[@]}"; do
  echo "### Deleting dummy certificate for $domain ..."
  docker-compose -f proxy.server.docker-compose.yaml run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$domain && \
    rm -Rf /etc/letsencrypt/archive/$domain && \
    rm -Rf /etc/letsencrypt/renewal/$domain.conf" certbot
  echo "Dummy certificate deleted for $domain."
done

# 이메일 인자 설정
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *)  email_arg="--email $email" ;;
esac

# 스테이징 인자 설정
if [ $staging != "0" ]; then
  staging_arg="--staging"
  echo "Using Let's Encrypt staging environment."
else
  staging_arg=""
  echo "Using Let's Encrypt production environment."
fi

# 각 도메인에 대해 개별적으로 인증서 발급
echo "### Requesting Let's Encrypt certificates for each domain..."
for domain in "${domains[@]}"; do
  echo "### Requesting certificate for $domain"

  docker-compose -f proxy.server.docker-compose.yaml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      -d $domain \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --force-renewal \
      --non-interactive" certbot

  if [ $? -ne 0 ]; then
    echo "Failed to obtain certificate for $domain. Check the certbot logs for details."
    echo "Continuing with other domains..."
  else
    echo "Successfully obtained certificate for $domain."
  fi
done

# 발급된 인증서 확인
echo "### Verifying certificates..."
docker-compose -f proxy.server.docker-compose.yaml run --rm --entrypoint "\
  certbot certificates" certbot

# Nginx 재시작
echo "### Reloading nginx..."
docker-compose -f proxy.server.docker-compose.yaml exec nginx nginx -s reload

if [ $? -ne 0 ]; then
  echo "Failed to reload Nginx!"
  exit 1
fi

echo "### Process completed successfully!"
echo "Now you can update your Nginx configuration to use HTTPS."
