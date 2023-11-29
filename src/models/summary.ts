export type OrgSummary = {
  SummaryDate: string;
  Timestamp: string;
  ResultState: string;
  OrgId: string;
  OrgInstanceURL: string;
  Username: string;
} & Partial<{
  Components: { [key: string]: ComponentSummary };
  LinesOfCode: { [key: string]: LinesOfCode };
  HealthCheck: HealthCheckSummary;
  Limits: LimitSummary;
  Tests: TestSummary;
  TestCoverageApex: TestCoverageApex;
  TestCoverageFlow: TestCoverageFlow;
}>;

export interface ComponentSummary {
  Total: number | 'N/A';
  LastModifiedDate?: string;
}

export interface LimitSummary {
  Applicable: number;
  Reached: number;
  Unattained: number;
  Details: Limit[];
}

export interface FlowCoverage {
  Flow: number | 'N/A';
  CoveragePercentage: number | 'N/A';
}

export interface TestCoverageFlow {
  Total: number | 'N/A';
  Details: FlowCoverage[];
}

export interface TestCoverageApex {
  Total: number | 'N/A';
  Details: ApexClassCoverage[];
}

export interface ApexClassCoverage {
  Class: number | 'N/A';
  CoveragePercentage: number | 'N/A';
}

export interface HealthCheckSummary {
  Score: number | 'N/A';
  Criteria: number | 'N/A';
  Compliant: number | 'N/A';
  Risks: number | 'N/A';
  Details: HealthCheckRisk[];

}

export interface HealthCheckRisk {
  OrgValue: string;
  RiskType: string;
  Setting: string;
  SettingGroup: string;
  SettingRiskCategory: string;
}

export interface Limit {
  Name: string;
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
}
