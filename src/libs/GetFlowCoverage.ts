import { execSync } from 'child_process';

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
  public async getFlowCoverage(username): Promise<CoverageResult> {
    const command = `sfdx force:data:soql:query -q "SELECT Id, ApexTestClassId, TestMethodName, FlowVersionId, NumElementsCovered, NumElementsNotCovered FROM FlowTestCoverage" -u ${username} -t --json`;

    try {
      const output = execSync(command, { encoding: 'utf8' });
      return JSON.parse(output) as CoverageResult;
    } catch (error) {
      console.error('Error executing Salesforce CLI command:', error.message);
      throw error;
    }
  }
}
