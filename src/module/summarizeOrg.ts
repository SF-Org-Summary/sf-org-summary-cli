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
import { GetFlowCoverage } from '../libs/GetFlowCoverage';

const dataPoints = [
    'AIApplication',
    'ApexClass',
    'ApexExecutionOverlayAction',
    'ApexPage',
    'ApexTrigger',
    'AuraDefinitionBundle',
    'AutoResponseRule',
    'BusinessProcessDefinition',
    'BrandingSet',
    'CleanDataService',
    'CleanRule',
    'CustomApplication',
    'CustomField',
    'CustomHttpHeader',
    'CspTrustedSite',
    'CustomObject',
    'CustomTab',
    'DataIntegrationRecordPurchasePermission',
    'DuplicateJobDefinition',
    'EmailTemplate',
    'ExternalDataSource',
    'FieldSet',
    'FlowDefinition',
    'GlobalValueSet',
    'Group',
    'HomePageLayout',
    'InboundNetworkConnection',
    'LightningComponentBundle',
    'Layout',
    'LookupFilter',
    'MatchingRule',
    'MarketingAppExtension',
    'NamedCredential',
    'OpportunitySplitType',
    'OrgDomainLog',
    'OutboundNetworkConnection',
    'Package2',
    'PathAssistant',
    'PermissionSet',
    'PermissionSetGroup',
    'PermissionSet',
    'PlatformEventChannel',
    'PostTemplate',
    'Profile',
    'QuickActionDefinition',
    'FieldSet',
    'RecordType',
    'RecommendationStrategy',
    'RemoteProxy',
    'RestrictionRule',
    'SchedulingRule',
    'Scontrol',
    'StaticResource',
    'TransactionSecurityPolicy',
    'ValidationRule',
    'WebLink'
];

export function summarizeOrg(orgAlias?: string): summary {
    // PREP
    const dataDirectory = './orgdata';
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory);
    }
    let initialMessage;
    if (orgAlias) {
        initialMessage = `Running queries on the Org with the Alias "${orgAlias}"`;
    } else {
        initialMessage = 'No Org Alias provided, queries will be running on the set default Org';
    }

    console.log(initialMessage);

    const orgIdCommand = `sfdx force:org:display --target-org "${orgAlias}" --json`;
    const orgIdOutput = execSync(orgIdCommand, { encoding: 'utf8' });
    const orgId = JSON.parse(orgIdOutput).result.id;
    const instanceURL = JSON.parse(orgIdOutput).result.instanceUrl;
    const username = JSON.parse(orgIdOutput).result.username;

    // RUN
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
                                const flowCoverage = getFlowCoverage(orgAlias);

                                const apexClasses = queryApexClasses(orgAlias);
                                const apexTriggers = queryApexTriggers(orgAlias);
                                const auraComponents = queryAuraComponents(orgAlias);
                                const lwcComponents = queryLWCComponents(orgAlias);
                                const staticResources = queryStaticResources(orgAlias);
                                // todo here: calculate lines of code in Apex Classes. In this make a distinction between the total, lines that represent comments, and the deduction of the comments from the total representing the actual lines of code.

                                const queryResults: Record<string, unknown[]> = {};
                                const errors = [];

                                for (const dataPoint of dataPoints) {
                                    try {
                                        const query = buildQuery(dataPoint);
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
                                    OrgId: orgId,
                                    Username: username,
                                    OrgInstanceURL: instanceURL,
                                    Components: calculateComponentSummary(queryResults),
                                    TestResults: {
                                        ApexTestOutcome: testResult?.outcome || 'N/A',
                                        ApexTestDuration: testResult?.runtime.toString() || 'N/A',
                                        ApexUnitTests: testResult?.methodsCompleted || 0,
                                        ApexTestMethodsCompleted: testResult?.methodsCompleted || 0,
                                        ApexTestMethodsFailed: testResult?.methodsFailed || 0,
                                        ApexOrgWideCoverage: orgWideApexCoverage || 0,
                                        FlowOrgWideCoverage: calculateFlowOrgWideCoverage(flowCoverage)
                                    },
                                    // todo here: Add the calculated scores of the like suggested in the structucre of the commented 'CodeLines' below.
                                    // CodeLines: {
                                    //     Apex: { Classes: { Total: number; Comments: number; Code: number }
                                    // },
                                };

                                console.log('Summary:', summary);
                                return summary;
                            });
                    });
            });
    }
}

function calculateFlowOrgWideCoverage(flowCoverage: Record<string, number>[]): number {
    if (flowCoverage.length === 0) {
        return 0;
    }

    const totalCoverage = flowCoverage.reduce((sum, coverage) => sum + coverage, 0);
    return totalCoverage / flowCoverage.length;
}

function getFlowCoverage(username: string): Record<string, number>[] {
    const flowCoverage = [];
    try {
        const flowCoverageResults = new GetFlowCoverage().getFlowCoverage(username);

        for (const record of flowCoverageResults.result.records) {
            const coveragePercentage =
                (record.NumElementsCovered / (record.NumElementsCovered + record.NumElementsNotCovered)) * 100;
            flowCoverage.push(coveragePercentage);
        }
    } catch (error) {
        console.error('Error getting flow coverage:', error.message);
    }
    return flowCoverage;
}

function calculateComponentSummary(queryResults: Record<string, unknown[]>): Record<string, unknown> {
    const componentSummary: Record<string, unknown> = {};

    for (const dataPoint of dataPoints) {
        if (queryResults[dataPoint]) {
            const results = queryResults[dataPoint];
            const resultLength = results.length;

            if (resultLength > 0) {
                const lastRecord = results[0];
                const lastModifiedDate = lastRecord.LastModifiedDate;

                componentSummary[dataPoint] = {
                    LastModifiedDate: lastModifiedDate,
                    Total: resultLength
                };
            } else {
                componentSummary[dataPoint] = { Total: 0 };
            }
        } else {
            // Handle the case where the query failed
            console.error(`Query for '${dataPoint}' failed. Defaulting to 'N/A' in the summary.`);
            componentSummary[dataPoint] = { Total: 'N/A' };
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
        // Handle errors related to unsupported sObject types
        if (error.stderr.includes("sObject type") && error.stderr.includes("is not supported")) {
            console.error(`Query for '${query}' is not supported. Defaulting to 'N/A' in the summary.`);
            return [];
        } else {
            console.error(`Error executing command: ${command}`);
            throw error;
        }
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
        const query = 'SELECT PercentCovered FROM ApexOrgWideCoverage';
        const results = await queryMetadata(query, './orgdata/orgWideApexCoverage.json', orgAlias);
        const overallCoverage = results.reduce((sum, result) => sum + result.PercentCovered, 0) / results.length;
        return overallCoverage;
    } catch (error) {
        console.error('Error getting org-wide Apex coverage:', error.message);
        return null;
    }
}

function queryApexClasses(orgAlias?: string): any[] {
    const query = 'SELECT Id, CreatedDate, LastModifiedDate, CreatedBy.name, LastModifiedBy.name, APIVersion, Name, NamespacePrefix, LengthWithoutComments FROM ApexClass ORDER BY LastModifiedDate DESC';
    return queryMetadata(query, './orgdata/ApexClasses.csv', orgAlias);
}

function queryApexTriggers(orgAlias?: string): any[] {
    const query = 'SELECT Id, CreatedDate, LastModifiedDate, CreatedBy.name, LastModifiedBy.name, TableEnumOrId, Status, APIVersion, Name, NamespacePrefix, LengthWithoutComments FROM ApexTrigger ORDER BY LastModifiedDate DESC';
    return queryMetadata(query, './orgdata/ApexTriggers.csv', orgAlias);
}

function queryAuraComponents(orgAlias?: string): any[] {
    const query = 'SELECT ApiVersion, CreatedDate, CreatedBy.name, Id, LastModifiedDate, LastModifiedBy.name, Description, DeveloperName, ManageableState, MasterLabel, NamespacePrefix FROM AuraDefinitionBundle ORDER BY LastModifiedDate DESC';
    return queryMetadata(query, './orgdata/AuraComponents.csv', orgAlias);
}

function queryLWCComponents(orgAlias?: string): any[] {
    const query = 'SELECT CreatedDate, CreatedBy.name, Id, LastModifiedDate, LastModifiedBy.name, DeveloperName, ApiVersion, MasterLabel, NamespacePrefix, TargetConfigs, Description, IsExposed, IsExplicitImport FROM LightningComponentBundle ORDER BY LastModifiedDate DESC';
    return queryMetadata(query, './orgdata/WebComponents.csv', orgAlias);
}

function queryStaticResources(orgAlias?: string): any[] {
    const query = 'SELECT CacheControl, ContentType, CreatedBy.Name, CreatedDate, Id, LastModifiedBy.Name, LastModifiedDate, ManageableState, Name FROM StaticResource ORDER BY LastModifiedDate DESC';
    return queryMetadata(query, './orgdata/StaticResources.csv', orgAlias);
}