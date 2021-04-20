# xray-violations-csv

xray-violations-csv is a node.js app which fetches all violation details from a xray watch configured in jfrog and saves it to a comma separated CSV file.

The needed parameters are configured via environment variables:
```
FQDN="https://jfrog/xray"
USER="user"
PASS="password"
NAME_CONTAINS=""
VIOLATION_TYPE="security"
WATCH_NAME=""
MIN_SEVERITY="High"
CREATED_FROM="2020-01-01T12:22:16+03:00"
ORDER_BY="updated"
LIMIT="250"
OFFSET="0"
ARTIFACTS="<path>/<image>/<tag>/;<path>/<image>/<tag>/"
```