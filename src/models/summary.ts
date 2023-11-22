export type summary = {
  SummaryDate: string;
  ResultState: string;
  OrgId: string;
  OrgInstanceURL: string;
  Username: string;
  Components?: {
    [key: string]: ComponentSummary;
  };
  Tests?: {
    ApexUnitTests: number;
    TestDuration: string;
    TestMethodsCompleted: number;
    TestMethodsFailed: number;
    TestOutcome: string;
    OrgWideApexCoverage: number;
    OrgWideFlowCoverage: number;
  };
  LinesOfCode?: {
    [key: string]: {
      Total: number;
      Comments: number;
      Code: number;
    };
  };
};

export interface ComponentSummary {
  Total: number | 'N/A';
  LastModifiedDate?: string;
}
