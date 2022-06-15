API_KEY=$1
API_PATH=$2

curl -H "x-api-key: $API_KEY" \
  "https://apollos-cluster-production.herokuapp.com/api/config/$API_PATH"
