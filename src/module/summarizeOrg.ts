import { execSync } from 'child_process';
import fs = require('fs');
import parse = require('csv-parse/lib/sync');
import { summary } from '../models/summary';

const dataPoints = [
    'Profile',
    'ApexPage',
    'CustomObject',
    'CustomApplication',
    'ValidationRule',
    'CustomTab',
    'CustomField',
    'InboundNetworkConnection',
    'OutboundNetworkConnection',
    'PermissionSet',
    'PermissionSetGroup',
    'PlatformEventChannel',
    'QuickActionDefinition',
    'RecordType',
    'RemoteProxy',
    'RestrictionRule',
    'OrgDomainLog',
    'CleanDataService',
    'AIApplication',
    'BrandingSet',
    'ExternalDataSource',
    'CustomHttpHeader',
    'EmbeddedServiceCustomComponent',
    'ExternalCredential',
    'TransactionSecurityPolicy',
    'Group',
    'ApexClass',
    'ApexTrigger',
    'AuraDefinitionBundle',
    'FlowDefinition',
    'LightningComponentBundle',
    'StaticResource'
];

export function summarizeOrg(orgAlias?: string): summary {
    const queryResults: Record<string, any[]> = {};
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
        ...calculateSummaryStats(queryResults),
    };

    console.log('Summary:', summary);
    return summary;
}

function calculateSummaryStats(queryResults: Record<string, any[]>): Record<string, number> {
    const summaryStats: Record<string, number> = {};
    for (const dataPoint in queryResults) {
        if (queryResults.hasOwnProperty(dataPoint)) {
            summaryStats[dataPoint] = queryResults[dataPoint].length;
        }
    }
    return summaryStats;
}

function buildQuery(dataPoint: string): string {
    return `SELECT CreatedBy.Name, CreatedDate, Id, LastModifiedBy.Name, LastModifiedDate FROM ${dataPoint}`;
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
        console.error(`Error executing command: ${command}`);
        throw error;
    }
}
