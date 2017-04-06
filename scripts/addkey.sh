#!/bin/bash

# $1 = Nom de compte
# $2 = Email du compte sur site

#Definition des variables
IP=92.222.36.198
PO=443
CN=$1
EMAIL=$2
LIENSCRIPTFOLDER=$(pwd)

cd ~/openvpn-ca/

#Test si les certificats existent déjà, si oui revocation
if [ -f $LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/$CN.zip ]
then
  rm -Rf $LIENSCRIPTFOLDER/../static/members/$EMAIL/keys
  ./revoke-full $CN
  rm keys/$CN.*
fi

#Creation des certificats
. ./vars
export KEY_EMAIL=$EMAIL
./build-key --batch $CN
mkdir $CN

#Creation du fichier de configuration
cat "$LIENSCRIPTFOLDER/conf_client" | sed -e "s/{pseudo}/$CN/g" > $CN/$CN.ovpn

cp keys/ca.crt keys/$CN.crt keys/$CN.key keys/ta.key $CN/
zip -r $CN.zip $CN
mkdir "$LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/"
mv $CN.zip "$LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/"
cp -R $CN/* "$LIENSCRIPTFOLDER/../static/members/$EMAIL/keys/"
rm -Rf $CN/
