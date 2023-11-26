/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { execSync } from 'node:child_process';
import fs = require('fs');
import axios from 'axios';
import * as fse from 'fs-extra';
import parse = require('csv-parse/lib/sync');
import { ComponentSummary, Limit, OrgSummary } from '../models/summary';
import { countCodeLines } from '../libs/CountCodeLines';
import { calculateFlowCoverage, calculateFlowOrgWideCoverage } from '../libs/GetFlowCoverage';
import { dataPoints } from '../data/DataPoints';

export interface flags {
    datapoints?: string;
    keepdata?: boolean;
    nolimits?: boolean;
    notests?: boolean;
    nocodelines?: boolean;
    targetusername?: string;
}

export function buildOrgSummary(
    timestamp: string,
    currentDate: string,
    info: OrgInfo,
    resultState: string,
    limits?: { [key: string]: Limit }
): OrgSummary {
    const baseSummary: OrgSummary = {
        Timestamp: timestamp,
        SummaryDate: currentDate,
        ResultState: resultState,
        OrgId: info.orgId,
        Username: info.username,
        OrgInstanceURL: info.instanceUrl,
    };

    if (limits) {
        baseSummary.Limits = limits;
    }

    return baseSummary;
}

export async function summarizeOrg(flags: flags): Promise<OrgSummary> {

    const orgAlias = flags.targetusername ?? undefined;
    const currentDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const timestamp = Date.now().toString();
    const info = getOrgInfo(orgAlias);
    const keepData = flags.keepdata ? flags.keepdata : false;
    const noLimits = flags.nolimits ? flags.nolimits : false;
    const noTests = flags.notests ? flags.notests : false;
    const noLinesOfCode = flags.nocodelines ? flags.nocodelines : false;
    const selectedDataPoints = flags.datapoints ? flags.datapoints.split(',') : dataPoints;
    const errors = [];

    // Prepare directories
    const dataDirectory = './orgsummary';
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory);
    }
    const orgSummaryDirectory = `./orgsummary/${info.orgId}/${timestamp}`;
    if (!fs.existsSync(orgSummaryDirectory)) {
        fs.mkdirSync(orgSummaryDirectory, { recursive: true });
    }
    let initialMessage;
    if (orgAlias) {
        initialMessage = `Running queries on the Org with the Alias "${orgAlias}"`;
    } else {
        initialMessage = 'No Org Alias provided, queries will be running on the set default Org';
    }
    console.log(initialMessage);

    const baseSummary: OrgSummary = {
        Timestamp: timestamp,
        SummaryDate: currentDate,
        ResultState: 'Pending', // Adjust as needed
        OrgId: info.orgId,
        Username: info.username,
        OrgInstanceURL: info.instanceUrl,
    };
    console.log('Base Summary:', baseSummary);

    if (selectedDataPoints && selectedDataPoints.length > 0) {
        const queryResults = queryDataPoints(
            selectedDataPoints,
            orgSummaryDirectory,
            orgAlias
        );
        baseSummary.Components = calculateComponentSummary(
            selectedDataPoints,
            queryResults
        );
    }

    if (!noLimits) {
        const limits = await checkLimits(info.instanceUrl, info.accessToken);
        baseSummary.Limits = limits;
    }

    if (!noLinesOfCode) {
        process.chdir(orgSummaryDirectory);
        execSync('sfdx force:project:create -x -n tempSFDXProject');
        process.chdir('./tempSFDXProject');
        const codeLines = calculateCodeLines(orgAlias);
        process.chdir('../../../../');
        baseSummary.LinesOfCode = codeLines;
    }

    if (!noTests) {
        const testResultsCommand = `sfdx force:apex:test:run --target-org "${orgAlias}" --test-level RunLocalTests --code-coverage --result-format json > ${orgSummaryDirectory}/testResults.json`;
        execSync(testResultsCommand, { encoding: 'utf8' });
        const testRunId = extractTestRunId(`${orgSummaryDirectory}/testResults.json`);
        if (testRunId) {
            console.log(`Checking Status of Job "${testRunId}"...`);
            await pollTestRunResult(testRunId, orgSummaryDirectory, orgAlias);
            const testResult = await getTestRunDetails(testRunId, orgSummaryDirectory, orgAlias);
            const orgWideApexCoverage = await getOrgWideApexCoverage(orgSummaryDirectory, orgAlias);
            baseSummary.Tests = {
                ApexUnitTests: testResult?.methodsCompleted ?? 0,
                TestDuration: testResult?.runtime.toString() ?? 'N/A',
                TestMethodsCompleted: testResult?.methodsCompleted ?? 0,
                TestMethodsFailed: testResult?.methodsFailed ?? 0,
                TestOutcome: testResult?.outcome ?? 'N/A',
                OrgWideApexCoverage: orgWideApexCoverage ?? 0,
                OrgWideFlowCoverage: calculateFlowOrgWideCoverage(calculateFlowCoverage(orgAlias)) ?? 0,
            };
        }
    }

    baseSummary.ResultState = errors.length > 0 ? 'Failure' : 'Completed';
    const summary: OrgSummary = {
        ...baseSummary
    };
    console.log('Final Summary:', summary);
    finish(orgSummaryDirectory, summary, keepData);
    return summary;
}

async function checkLimits(instanceURL: string, accessToken: string) {
    const limitsApiUrl = `${instanceURL}/services/data/v50.0/limits/`;
    try {
        const limitsApiResponse = await axios.get(limitsApiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const limitsData = limitsApiResponse.data;

        // Initialize an empty object for limits
        const limits = {};

        // Iterate over keys in limitsData
        for (const key in limitsData) {
            if (limitsData.hasOwnProperty(key)) {
                const limitInfo = limitsData[key];
                const description = `Description for ${key}`;

                // Check if the limit has Max and Remaining properties
                if (limitInfo && limitInfo.Max !== undefined && limitInfo.Remaining !== undefined) {
                    limits[key] = {
                        Max: limitInfo.Max,
                        Remaining: limitInfo.Remaining,
                        Usage: limitInfo.Max - limitInfo.Remaining,
                        Description: description,
                    };
                } else {
                    // Handle the case where Max or Remaining is undefined
                    console.warn(`Skipping limit ${key} due to missing Max or Remaining.`);
                }
            }
        }

        return limits;
    } catch (error) {
        console.error('Error fetching limits from Salesforce API:', error.message);
    }
}

function calculateComponentSummary(selectedDataPoints: string[], queryResults: { [key: string]: QueryResult[] }): { [key: string]: ComponentSummary } {
    const componentSummary: { [key: string]: ComponentSummary } = {};
    for (const dataPoint of selectedDataPoints) {
        const key = dataPoint;
        if (queryResults[dataPoint]) {
            const results = queryResults[dataPoint];
            const resultLength = results.length;
            if (resultLength > 0) {
                const lastRecord = results[0];
                const lastModifiedDate = lastRecord.LastModifiedDate;
                componentSummary[key] = {
                    Total: resultLength,
                    LastModifiedDate: lastModifiedDate
                };
            } else {
                // Handle the case where the query returned no results
                componentSummary[key] = { Total: 'N/A' };
            }
        } else {
            // Handle the case where the query failed
            componentSummary[key] = { Total: 'N/A' };
        }
    }
    return componentSummary;
}


function buildQuery(dataPoint: string): string {
    return `SELECT CreatedBy.Name, CreatedDate, Id, LastModifiedBy.Name, LastModifiedDate FROM ${dataPoint} ORDER BY LastModifiedDate DESC`;
}

function queryMetadata(query: string, outputCsv: string, orgAlias?: string) {
    let command;
    if (orgAlias) {
        command = `sfdx data:query --query "${query}" --target-org "${orgAlias}" --result-format csv --use-tooling-api > ${outputCsv}`;
    } else {
        command = `sfdx data:query --query "${query}" --result-format csv --use-tooling-api > ${outputCsv}`;
    }
    try {
        execSync(command);
        const csvData = fs.readFileSync(outputCsv, 'utf8');
        return parse(csvData, { columns: true });
    } catch (error) {
        handleQueryError(query, error, []);
        return [];
    }
}

function handleQueryError(dataPoint: string, error: any, errors: any[]) {
    // Handle errors related to unsupported sObject types
    if (error.stderr.includes('sObject type') && error.stderr.includes('is not supported')) {
        console.error(`Query for '${dataPoint}' is not supported. Defaulting to 'N/A' in the summary.`);
        errors.push(null); // Push a null value to indicate a handled error
    } else {
        console.error(`Error executing query for '${dataPoint}': ${error.message}`);
        errors.push(error);
    }
}

function finish(orgSummaryDirectory: string, summarizedOrg: OrgSummary, keepData: boolean) {
    if (!keepData) {
        const cleanUpDirectory = () => {
            console.log('Cleaning up...');
            const files = fs.readdirSync(orgSummaryDirectory);
            for (const file of files) {
                const filePath = `${orgSummaryDirectory}/${file}`;
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath); // Remove the file
                } else {
                    fse.removeSync(filePath); // Remove subdirectories
                }
            }
        };
        cleanUpDirectory();
    }
    const saveSummaryAsJson = (summaryData: OrgSummary) => {
        const jsonFilePath = `${orgSummaryDirectory}/orgsummary.json`;
        fs.writeFileSync(jsonFilePath, JSON.stringify(summaryData, null, 2), 'utf8');
        console.log(`Summary saved as: ${jsonFilePath}`);
    };
    saveSummaryAsJson(summarizedOrg);
}

function extractTestRunId(jsonFilePath: string): string | null {
    try {
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const regex = /-i\s*([0-9A-Za-z]{15})/;
        const match = jsonData.match(regex);
        if (match?.[1]) {
            return match[1];
        } else {
            console.error('Test run ID not found in the JSON file.');
            return null;
        }
    } catch (error) {
        console.error('Error reading JSON file:', error.message);
        return null;
    }
}

async function pollTestRunResult(jobId: string, path: string, orgAlias?: string) {
    let status = 'Queued';
    while (status === 'Queued' || status === 'Processing') {
        try {
            const query = `SELECT Id, Status FROM AsyncApexJob WHERE Id = '${jobId}' LIMIT 1`;
            // eslint-disable-next-line no-await-in-loop
            const result = await queryMetadata(query, path + '/testRunResult.json', orgAlias);
            if (result.length > 0) {
                const testJob = result[0];
                status = testJob.Status;
            } else {
                console.log('No AsyncApexJob found for the given jobId.');
            }
        } catch (error) {
            console.error('Error polling for test run result:', error.message);
            status = 'Failed';
        }
        console.log(`Test Run Status: ${status}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.log('Polling complete - Final Status:', status);
    return status;
}

function queryDataPoints(selectedDataPoints: string[], orgSummaryDirectory: string, orgAlias?: string | undefined) {
    // QUERY TOOLING API DATAPOINTS
    const queryResults: { [key: string]: QueryResult[] } = {};
    for (const dataPoint of selectedDataPoints) {
        try {
            const query = buildQuery(dataPoint);
            const result = queryMetadata(query, (orgSummaryDirectory + '/' + dataPoint + '.csv'), orgAlias);
            queryResults[dataPoint] = result instanceof Array ? result : [];
        } catch (error) {
            // Errors are now handled in queryMetadata
        }
    }
    return queryResults
}

async function getTestRunDetails(jobId: string, path: string, orgAlias?: string): Promise<{ outcome: string; runtime: number; methodsCompleted: number; methodsFailed: number } | null> {
    try {
        const query = `SELECT Id, AsyncApexJobId, Status, StartTime, EndTime, TestTime, MethodsCompleted, MethodsFailed FROM ApexTestRunResult WHERE AsyncApexJobId = '${jobId}'`;
        const results = await queryMetadata(query, path + '/testRunDetails.json', orgAlias);
        if (results.length > 0) {
            const testRunResult = results[0];
            const outcome = testRunResult.Status === 'Completed' && testRunResult.MethodsFailed === 0 ? 'Pass' : 'Fail';
            const runtime = testRunResult.TestTime;
            const methodsCompleted = testRunResult.MethodsCompleted;
            const methodsFailed = testRunResult.MethodsFailed;
            console.log(`Test Run Outcome: ${outcome}, Runtime: ${runtime}s`);
            return { outcome, runtime, methodsCompleted, methodsFailed };
        } else {
            console.log('No ApexTestRunResult found for the given jobId.');
            return null;
        }
    } catch (error) {
        console.error('Error getting test run details:', error.message);
        return null;
    }
}

async function getOrgWideApexCoverage(path: string, orgAlias?: string): Promise<number | null> {
    try {
        const query = 'SELECT PercentCovered FROM ApexOrgWideCoverage';
        const results = await queryMetadata(query, path + '/orgWideApexCoverage.json', orgAlias);
        const overallCoverage = results.reduce((sum: any, result: { PercentCovered: any }) => sum + result.PercentCovered, 0) / results.length;
        return overallCoverage;
    } catch (error) {
        console.error('Error getting org-wide Apex coverage:', error.message);
        return null;
    }
}

function calculateCodeLines(orgAlias?: string): {
    ApexClass: { Lang: string; Total: number; Comments: number; Code: number };
    ApexTrigger: { Lang: string; Total: number; Comments: number; Code: number };
    AuraDefinitionBundle: { Lang: string; Total: number; Comments: number; Code: number };
    LightningComponentBundle: { Lang: string; Total: number; Comments: number; Code: number };
    StaticResource: { Lang: string; Total: number; Comments: number; Code: number };
} {
    const retrieveCommand = orgAlias ? `sf project retrieve start --metadata ApexClass ApexTrigger AuraDefinitionBundle LightningComponentBundle StaticResource --target-org ${orgAlias}` :
        'sf project retrieve start --metadata ApexClass ApexTrigger AuraDefinitionBundle LightningComponentBundle StaticResource';
    execSync(retrieveCommand, { encoding: 'utf8' });
    return {
        ApexClass: countCodeLines('./force-app/main/default/classes', '.cls', 'apex'),
        ApexTrigger: countCodeLines('./force-app/main/default/triggers', '.trigger', 'apex'),
        AuraDefinitionBundle: countCodeLines('./force-app/main/default/aura', '.js', 'javascript'),
        LightningComponentBundle: countCodeLines('./force-app/main/default/lwc', '.js', 'javascript'),
        StaticResource: countCodeLines('./force-app/main/default/lwc', '.js', 'javascript')
    };
}

interface QueryResult {
    attributes: {
        type: string;
        url: string;
    };
    CreatedBy: {
        attributes: {
            type: string;
            url: string;
        };
        Name: string;
    };
    CreatedDate: string;
    Id: string;
    LastModifiedBy: {
        attributes: {
            type: string;
            url: string;
        };
        Name: string;
    };
    LastModifiedDate: string;
}

interface OrgInfo {
    username: string;
    accessToken: string;
    instanceUrl: string;
    orgId: string;
}

function getOrgInfo(orgAlias?: string): OrgInfo {

    try {
        const command = orgAlias ? `sfdx force:org:display --verbose --json --targetusername ${orgAlias}` : 'sfdx force:org:display --verbose --json';
        const output = execSync(command, { encoding: 'utf8' });
        const orgInfo = JSON.parse(output);
        return {
            username: orgInfo.result.username,
            accessToken: orgInfo.result.accessToken,
            instanceUrl: orgInfo.result.instanceUrl,
            orgId: orgInfo.result.id
        };
    } catch (error) {
        console.error('Error getting org information:', error.message);
    }
    return {
        username: '',
        accessToken: '',
        instanceUrl: '',
        orgId: ''
    }
}