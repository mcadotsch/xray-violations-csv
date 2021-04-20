const axios = require('axios')
const fs = require('fs');
const jc = require('json-2-csv');

const FQDN = process.env.FQDN || 'https://jfrog/xray';
const USER = process.env.USER || 'username';
const PASS = process.env.PASS || 'password';

const NAME_CONTAINS = process.env.NAME_CONTAINS || '';
const VIOLATION_TYPE = process.env.VIOLATION_TYPE || '';
const WATCH_NAME = process.env.WATCH_NAME || '';
const MIN_SEVERITY = process.env.MIN_SEVERITY || '';
const CREATED_FROM = process.env.CREATED_FROM || '';
const ORDER_BY = process.env.ORDER_BY || '';

const LIMIT = process.env.LIMIT || '250';
const OFFSET = process.env.OFFSET || '0';
const ARTIFACTS_WHITELIST = process.env.ARTIFACTS_WHITELIST || '<path>/<image>/<tag>/;<path>/<image>/<tag>/';

var offset = Number(OFFSET);
var limit = Number(LIMIT);
var violationList = [];
var artifacts = ARTIFACTS_WHITELIST.toString().split(';');

function violationRequest() {
    offset++
    axios.post(FQDN + '/api/v1/violations', {
            'filters': {
                'name_contains': NAME_CONTAINS,
                'violation_type': VIOLATION_TYPE,
                'watch_name': WATCH_NAME,
                'min_severity': MIN_SEVERITY,
                'created_from': CREATED_FROM
            },
            'pagination': {
                'order_by': ORDER_BY,
                'limit': limit,
                'offset': offset
            }
        },{
            'auth': {
                'username': USER,
                'password': PASS
        }    
        })
        .then((res) => {
            var data = res.data.violations;
            var newData = {};

            if (data.length > 0){
                console.log('<' + offset + '/' + data.length + '> request junk offset / size')

                newData = data.map(function(violation) {
                    if (violation.impacted_artifacts.some(v=> artifacts.indexOf(v.replace('art ext/','')) !== -1)){
                        return {
                            ...violation
                        }
                    } else{
                        return ''
                    }
                }).filter(function(violation) {
                    if (violation != ''){
                        return true
                    }
                })

                if (newData.length > 0){
                    console.log('====> ' + newData.length + ' issue matches in request ' + offset)
                    violationList.push(newData);
                }

                if (data.length == LIMIT){
                    violationRequest()
                }else{
                    if(violationList.length > 0) {
                        issueRequest(violationList)
                    }else{
                        console.log('...nothing found, probably the artifact_whitelist is not configured')
                    }
                }
            }
        })
        .catch((error) => {
            console.error(error)
    })
}

function getFixVersions(url){
    return axios.get(url,{
        'auth': {
            'username': USER,
            'password': PASS
    }})
    .then((issue) => {
        return issue.data
    }) 
}

function issueRequest(data){
    var header = true;
    data.forEach((top) => {
        top.forEach((item) => {
            getFixVersions(item.violation_details_url).then((v) => {
                let {  
                    description,
                    severity,type,
                    infected_components,
                    created,
                    watch_name,
                    issue_id,
                    violation_details_url,
                    impacted_artifacts,
                    violation_id,
                    summary,
                    provider,
                    infected_versions,
                    fix_versions,
                    matched_policies
                } = {...item, ...v}

                description = description.replaceAll(',',';');
                summary = summary.replaceAll(',',';');

                data2export = {
                    violation_id,
                    issue_id,
                    impacted_artifacts,
                    infected_components,
                    infected_versions,
                    fix_versions,
                    description,
                    summary,
                    severity,type,
                    created,
                    watch_name,
                    provider,
                    matched_policies
                }

                violations2csv(data2export, header==true?{prependHeader:true}:{prependHeader:false})
                header = false;
            })
        })
    })
}

function violations2csv(data, header=false){
    jc.json2csv(data, header, (err, csv) => {
        if (err) {
            throw err;
        }

        fs.appendFile('violations.csv', csv+'\n', (err) => {
            if (err) {
                console.log(err)
            }
        });
    });  
}

fs.unlink('violations.csv', function (err) {});
violationRequest();