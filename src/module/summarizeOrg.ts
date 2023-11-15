/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-shadow */
import { execSync } from 'child_process';
import fs = require('fs');
import parse = require('csv-parse/lib/sync');
import { summary } from '../models/summary';

const dataPoints = [
    'AIApplication',
    'ApexClass',
    'ApexPage',
    'ApexTrigger',
    'AuraDefinitionBundle',
    'BrandingSet',
    'CleanDataService',
    'CustomApplication',
    'CustomField',
    'CustomHttpHeader',
    'CustomObject',
    'CustomTab',
    'EmbeddedServiceCustomComponent',
    'ExternalCredential',
    'ExternalDataSource',
    'FlowDefinition',
    'Group',
    'InboundNetworkConnection',
    'LightningComponentBundle',
    'OrgDomainLog',
    'OutboundNetworkConnection',
    'PermissionSetGroup',
    'PermissionSet',
    'PlatformEventChannel',
    'Profile',
    'QuickActionDefinition',
    'RecordType',
    'RemoteProxy',
    'RestrictionRule',
    'StaticResource',
    'TransactionSecurityPolicy',
    'ValidationRule'
];

export function summarizeOrg(orgAlias?: string): summary {

    // PREP
    const dataDirectory = './orgdata';
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory);
    }
    let initialMessage;
    if (orgAlias) {
        initialMessage = `Running queries on the Org with the Alias "${orgAlias}"`
    } else {
        initialMessage = 'No Org Alias provided, queries will be running on the set default Org'
    }
    console.log(initialMessage);
    // Run Apex Tests
    const testResultsCommand = `sfdx force:apex:test:run --target-org "${orgAlias}" --test-level RunLocalTests --code-coverage --result-format json > ./orgdata/testResults.json`;
    execSync(testResultsCommand, { encoding: 'utf8' });
    const testRunId = extractTestRunId('./orgdata/testResults.json');
    console.log('testRunId', testRunId);
    if (testRunId) {
        console.log(`Checking Status of Job "${testRunId}"...`);
        pollTestRunResult(testRunId, orgAlias)
            .then(() => {
                getTestRunDetails(testRunId, orgAlias)
                    .then(testResult => {
                        getOrgWideApexCoverage(orgAlias)
                            .then(orgWideApexCoverage => {
                                const queryResults: Record<string, unknown[]> = {};
                                const errors = [];
                                for (const dataPoint of dataPoints) {
                                    try {
                                        const query = buildQuery(dataPoint);
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        const result = queryMetadata(query, `./orgdata/${dataPoint}.csv`, orgAlias);
                                        queryResults[dataPoint] = result instanceof Array ? result : [];
                                    } catch (error) {
                                        errors.push(error);
                                    }
                                }

                                let ResultState = 'Completed';
                                if (errors.length > 0) {
                                    ResultState = 'Failed';
                                    process.exitCode = 1;
                                }
                                const summary: summary = {
                                    SummaryDate: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                                    ResultState,
                                    ...calculateSummaryStats(queryResults),
                                    ApexTestOutcome: testResult?.outcome || 'N/A',
                                    ApexTestRuntime: testResult?.runtime || 0,
                                    ApexTestMethodsCompleted: testResult?.methodsCompleted || 0,
                                    ApexTestMethodsFailed: testResult?.methodsFailed || 0,
                                    ApexOrgWideCoverage: orgWideApexCoverage || 0,
                                };

                                console.log('Summary:', summary);
                                return summary;
                            })
                            .catch(error => {
                                console.error('Error getting org-wide Apex coverage:', error.message);
                            });
                    })
                    .catch(error => {
                        console.error('Error getting test run details:', error.message);
                    });
            })
            .catch(error => {
                console.error('Error polling for test run results:', error.message);
            });
    }
}

function calculateSummaryStats(queryResults: Record<string, unknown[]>): Record<string, unknown> {
    const summaryStats: Record<string, unknown> = {};

    for (const dataPoint in queryResults) {
        if (Object.prototype.hasOwnProperty.call(queryResults, dataPoint)) {
            const results = queryResults[dataPoint];
            const resultLength = results.length;

            if (resultLength > 0) {
                const lastRecord = results[0]; // Since we ordered by LastModifiedDate DESC, the first record has the latest modification
                const lastModifiedDate = lastRecord.LastModifiedDate;

                summaryStats[dataPoint] = {
                    Total: resultLength,
                    LastModifiedDate: lastModifiedDate,
                };
            } else {
                summaryStats[dataPoint] = { Total: 0 };
            }
        }
    }

    return summaryStats;
}

function buildQuery(dataPoint: string): string {
    return `SELECT CreatedBy.Name, CreatedDate, Id, LastModifiedBy.Name, LastModifiedDate FROM ${dataPoint} ORDER BY LastModifiedDate DESC`;
}

function queryMetadata(query: string, outputCsv: string, orgAlias?: string) {
    let command;
    if (orgAlias) {
        command = `sfdx data:query --query "${query}" --target-org "${orgAlias}" --result-format csv --use-tooling-api > ${outputCsv} `;
    } else {
        command = `sfdx data:query --query "${query}" --result-format csv --use-tooling-api > ${outputCsv} `;
    }

    try {
        execSync(command);
        const csvData = fs.readFileSync(outputCsv, 'utf8');
        return parse(csvData, { columns: true });
    } catch (error) {
        console.error(`Error executing command: ${command} `);
        throw error;
    }
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

async function pollTestRunResult(jobId: string, orgAlias?: string) {
    let status = 'Queued';
    while (status === 'Queued' || status === 'Processing') {
        try {
            const query = `SELECT Id, Status FROM AsyncApexJob WHERE Id = '${jobId}' LIMIT 1`;
            // eslint-disable-next-line no-await-in-loop
            const result = await queryMetadata(query, './orgdata/testRunResult.json', orgAlias);
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

async function getTestRunDetails(jobId: string, orgAlias?: string): Promise<{ outcome: string; runtime: number; methodsCompleted: number; methodsFailed: number } | null> {
    try {
        const query = `SELECT Id, AsyncApexJobId, Status, StartTime, EndTime, TestTime, MethodsCompleted, MethodsFailed FROM ApexTestRunResult WHERE AsyncApexJobId = '${jobId}'`;
        const results = await queryMetadata(query, './orgdata/testRunDetails.json', orgAlias);

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

async function getOrgWideApexCoverage(orgAlias?: string): Promise<number | null> {
    try {
        // Formulate SOQL query to get org-wide Apex coverage
        const query = 'SELECT PercentCovered FROM ApexOrgWideCoverage';
        const results = await queryMetadata(query, './orgdata/orgWideApexCoverage.json', orgAlias);

        // Calculate overall Apex coverage (average, sum, or as needed)
        const overallCoverage = results.reduce((sum, result) => sum + result.PercentCovered, 0) / results.length;

        console.log(`Org-wide Apex Coverage: ${overallCoverage}%`);

        return overallCoverage;
    } catch (error) {
        console.error('Error getting org-wide Apex coverage:', error.message);
        return null;
    }
}

