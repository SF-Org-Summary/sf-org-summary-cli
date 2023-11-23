/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable sf-plugin/no-hardcoded-messages-flags */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { execSync } from 'node:child_process';

interface FlowCoverageResult {
  status: number;
  result: {
    done: boolean;
    totalSize: number;
    records: Array<{
      type: string;
      url: string;
      Id: string;
      ApexTestClassId: string;
      TestMethodName: string;
      FlowVersionId: string;
      NumElementsCovered: number;
      NumElementsNotCovered: number;
    }>;
  };
}

function getFlowCoverage(orgAlias?: string): FlowCoverageResult {
  const command = `sfdx force:data:soql:query -q "SELECT Id, ApexTestClassId, TestMethodName, FlowVersionId, NumElementsCovered, NumElementsNotCovered FROM FlowTestCoverage" -u ${orgAlias} -t --json`;
  const output = execSync(command, { encoding: 'utf8' });
  return JSON.parse(output) as FlowCoverageResult;
}

export function calculateFlowCoverage(orgAlias?: string): number[] {
  const flowCoverage = [];
  try {
    const flowCoverageResults = orgAlias ? getFlowCoverage(orgAlias) : getFlowCoverage();
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

export function calculateFlowOrgWideCoverage(flowCoverage: number[]): number {
  if (flowCoverage.length === 0) {
    return 0;
  }
  const totalCoverage = flowCoverage.reduce((sum, coverage) => sum + coverage, 0);
  return totalCoverage / flowCoverage.length;
}