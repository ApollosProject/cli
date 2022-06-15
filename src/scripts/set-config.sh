API_KEY=$1
CHURCH=$2
BODY=$3

curl -H "content-type: application/json" \
  -H "x-api-key: $API_KEY" \
  --data "$BODY" \
  "https://apollos-cluster-production.herokuapp.com/api/config/$CHURCH"
