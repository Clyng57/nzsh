#!/bin/zsh
sendfunc='cd web/numedica.com/nodeapp/nm-website
git pull origin
git diff --name-only HEAD@{1} HEAD 
IFS=$"\n" 
PACKAGE_REGEX="(^package\.json)" 
PACKAGE=("$(git diff --name-only HEAD@{1} HEAD | grep -E "$PACKAGE_REGEX")") 
if [[ ${PACKAGE[@]} ]]; then 
	echo "📦 package.json was changed. Running npm install to update dependencies..." 
	npm install 
fi
pm2 restart all' 
ssh admin@104.131.122.102 $sendfunc 
