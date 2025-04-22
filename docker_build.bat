echo "copy default_aiven.json to default.json"
copy /Y .\config\default_aiven.json .\config\default.json
echo "start build docker image"
docker build -t willsofts/emigrate .
echo "copy default_localhost.json to default.json"
copy /Y .\config\default_localhost.json .\config\default.json
