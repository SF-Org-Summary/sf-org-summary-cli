export type OrgSummary = {
  SummaryDate: string;
  Timestamp: string;
  ResultState: string;
  OrgId: string;
  OrgInstanceURL: string;
  Username: string;
} & Partial<{
  Components: { [key: string]: ComponentSummary };
  Limits: { [key: string]: Limit };
  LinesOfCode: { [key: string]: LinesOfCode };
  Tests: TestSummary;
}>;

export interface ComponentSummary {
  Total: number | 'N/A';
  LastModifiedDate?: string;
}

export interface Limit {
  Description: string;
  Max: number | 'N/A';
  Remaining: number | 'N/A';
  Usage: number | 'N/A';
}

export interface LinesOfCode {
  Total: number;
  Comments: number;
  Code: number;
}

export interface TestSummary {
  ApexUnitTests: number;
  TestDuration: string;
  TestMethodsCompleted: number;
  TestMethodsFailed: number;
  TestOutcome: string;
  OrgWideApexCoverage: number;
  OrgWideFlowCoverage: number;
}
