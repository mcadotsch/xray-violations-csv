# xray-violations-csv

xray-violations-csv is a node.js app which fetches all violation details from a xray watch configured in jfrog and saves it to a comma separated CSV file.
Due to the fact that the xray api returns the violations detail of all the artifacts versions - e.g. all docker image tags - only based on the create date, the data can be limited with a artifact whitelist.

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
ARTIFACTS_WHITELIST="<path>/<image>/<tag>/;<path>/<image>/<tag>/" or "*"
```