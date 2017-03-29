#!/bin/bash

# $1 = Nom de compte
# $2 = Email du compte sur site

#Definition des variables
IP=92.222.36.172
PO=80
CN=$1
EMAIL=$2
LIENSCRIPTFOLDER=$(pwd)

#Creation des certificats
cd /etc/openvpn/easy-rsa/
source vars
export KEY_EMAIL=$EMAIL
./build-key --batch $CN
mkdir $CN

# ./build-key --batch Paul
# ./revoke-full Paul

#Creation du fichier de configuration
cat "$LIENSCRIPTFOLDER/conf_client" | sed -e "s/{pseudo}/$CN/g" > $CN/$CN.ovpn

cp keys/ca.crt keys/$CN.crt keys/$CN.key keys/ta.key $CN/
zip -r $CN.zip $CN
mkdir "$LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/"
mv $CN.zip "$LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/"
cp -R $CN/* "$LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/"
rm -Rf $CN/
