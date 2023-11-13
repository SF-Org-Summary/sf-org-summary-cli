const { execSync } = require('child_process');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');

function queryMetadata(query, outputCsv) {
    const command = `sfdx data:query --query "${query}" --target-org "hub" --result-format csv --use-tooling-api > ${outputCsv}`;

    try {
        execSync(command);
        const csvData = fs.readFileSync(outputCsv, 'utf8');
        return parse(csvData, { columns: true });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error.message);
        return null;
    }
}

function countLinesOfCode(path, extension) {
    const codeFiles = fs.readdirSync(path).filter(file => file.endsWith(extension) && file !== 'jest.config.js');
    let totalFiles = 0;
    let totalLines = 0;
    let commentLines = 0;

    codeFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        totalFiles += 1;
        totalLines += lines.length;
        lines.forEach(line => {
            const commentMatch = line.match(/^\s*(\/\/[^\n]*|\/\*.*?\*\/)/);
            if (commentMatch) {
                commentLines += 1;
            }
        });
    });

    const totalResults = {
        Files: totalFiles,
        Code: totalLines - commentLines,
        Comments: commentLines,
        Total: totalLines
    };

    console.table([totalResults], ['Files', 'Code', 'Comments', 'Total']);
    return totalResults;
}



// Ensure 'components' directory exists
const componentsDir = './components';
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir);
}

// Query Apex Metadata
const apexClasses = queryMetadata(
    'SELECT Id, CreatedDate, LastModifiedDate, CreatedBy.name, LastModifiedBy.name, APIVersion, Name, NamespacePrefix, LengthWithoutComments FROM ApexClass',
    './components/ApexClasses.csv'
);

const apexTriggers = queryMetadata(
    'SELECT Id, CreatedDate, LastModifiedDate, CreatedBy.name, LastModifiedBy.name, TableEnumOrId, Status, APIVersion, Name, NamespacePrefix, LengthWithoutComments FROM ApexTrigger',
    './components/ApexTriggers.csv'
);

// Query Aura Components
const auraComponents = queryMetadata(
    'SELECT ApiVersion, CreatedDate, CreatedBy.name, Id, LastModifiedDate, LastModifiedBy.name, Description, DeveloperName, ManageableState, MasterLabel, NamespacePrefix FROM AuraDefinitionBundle',
    './components/AuraComponents.csv'
);

// Query LWC Metadata
const webComponents = queryMetadata(
    'SELECT CreatedDate, CreatedBy.name, Id, LastModifiedDate, LastModifiedBy.name, DeveloperName, ApiVersion, MasterLabel, NamespacePrefix, TargetConfigs, Description, IsExposed, IsExplicitImport FROM LightningComponentBundle',
    './components/WebComponents.csv'
);

// Query Static Resources Metadata
const staticResources = queryMetadata(
    'SELECT CacheControl, ContentType, CreatedBy.Name, CreatedDate, Id, LastModifiedBy.Name, LastModifiedDate, ManageableState, Name FROM StaticResource',
    './components/StaticResources.csv'
);

console.log('Apex Classes:', apexClasses);
console.log('Apex Triggers:', apexTriggers);
console.log('Aura Components:', auraComponents);
console.log('LWC Metadata:', webComponents);
console.log('Static Resources:', staticResources);

// Run Apex Tests
console.log('Running Apex Tests...');
const testResultsCommand = `sfdx force:apex:test:run -u "hub" --testlevel RunLocalTests -c --resultformat json`;
const testResults = JSON.parse(execSync(testResultsCommand, { encoding: 'utf8' }));

// Query Test Results and Test Coverage
console.log('Querying Test Results and Test Coverage...');
queryMetadata('SELECT Id, PercentCovered FROM ApexOrgWideCoverage', 'ApexCoverage.csv');
queryMetadata('SELECT ApexClassOrTrigger.Id, ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate', 'ApexClassCoverage.csv');

// Extract relevant information from test results
const testTotalTime = testResults.result.summary.testTotalTime.replace(' ms', '');
const orgWideCoverage = testResults.result.coverage.summary.orgWideCoverage.replace('%', '');
const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
const numberOfApexUnitTests = testResults.result.summary.testsRan;

console.log('Test Total Time:', testTotalTime);
console.log('Org Wide Coverage:', orgWideCoverage);
console.log('Date:', date);
console.log('Number of Apex Unit Tests:', numberOfApexUnitTests);

// Run Apex Tests
console.log('Running Apex Tests...');
// Query Test Results and Test Coverage
console.log('Querying Test Results and Test Coverage...');
queryMetadata('SELECT Id, ApexClass.Name, MethodName, StackTrace, Outcome, RunTime, Message, TestTimestamp FROM ApexTestResult Order By TestTimestamp Desc LIMIT ' + testResults.result.summary.testsRan, 'ApexTestResults.csv');

// Count Code Lines
const currentDir = process.cwd();
const jsInfo = countLinesOfCode(currentDir, '.js');
const apexInfo = countLinesOfCode(currentDir, '.cls');
const triggerInfo = countLinesOfCode(currentDir, '.trigger');

// Summary
const summary = {
    Date: date,
    TestResultsOutcome: testResults.result.summary.outcome,
    TestTotalTime: testTotalTime,
    ApexClasses: apexClasses.length,
    ApexTriggers: apexTriggers.length,
    ApexUnitTests: numberOfApexUnitTests,
    ApexTestsFailing: testResults.result.summary.failing,
    ApexTestsPassing: testResults.result.summary.passing,
    AuraComponents: auraComponents.length,
    LWCComponents: webComponents.length,
    StaticResources: staticResources.length,
    OrgId: testResults.result.summary.orgId,
    orgWideCoverage: orgWideCoverage,
    JavaScriptFiles: jsInfo.Files,
    JavaScriptCode: jsInfo.Code,
    JavaScriptAllLines: jsInfo.Total,
    JavaScriptComments: jsInfo.Comments,
    ApexClassFiles: apexInfo.Files,
    ApexClassCode: apexInfo.Code,
    ApexClassAllLines: apexInfo.Total,
    ApexClassComments: apexInfo.Comments,
    ApexTriggerFiles: triggerInfo.Files,
    ApexTriggerCode: triggerInfo.Code,
    ApexTriggerAllLines: triggerInfo.Total,
    ApexTriggerComments: triggerInfo.Comments
};

fs.writeFileSync('summary.json', JSON.stringify(summary, null, 2));

console.log('Completed All Queries');
