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

export interface CoverageResult {
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

export class GetFlowCoverage {
  public async getFlowCoverage(username: string): Promise<CoverageResult> {
    const command = `sfdx force:data:soql:query -q "SELECT Id, ApexTestClassId, TestMethodName, FlowVersionId, NumElementsCovered, NumElementsNotCovered FROM FlowTestCoverage" -u ${username} -t --json`;
    const output = execSync(command, { encoding: 'utf8' });
    return JSON.parse(output) as CoverageResult;
  }
}