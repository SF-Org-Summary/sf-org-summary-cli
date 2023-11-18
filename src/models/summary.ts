export type summary = {
  SummaryDate: string;
  ResultState: string;
  OrgId: string;
  OrgInstanceURL: string;
  Username: string;
  Components: {
    AIApplication: { Total: number; LastModifiedDate?: string };
    ApexClass: { Total: number; LastModifiedDate?: string };
    ApexExecutionOverlayAction: { Total: number; LastModifiedDate?: string };
    ApexPage: { Total: number; LastModifiedDate?: string };
    ApexTrigger: { Total: number; LastModifiedDate?: string };
    AuraDefinitionBundle: { Total: number; LastModifiedDate?: string };
    AutoResponseRule: { Total: number; LastModifiedDate?: string };
    BusinessProcessDefinition: { Total: number; LastModifiedDate?: string };
    BrandingSet: { Total: number; LastModifiedDate?: string };
    CleanDataService: { Total: number; LastModifiedDate?: string };
    CleanRule: { Total: number; LastModifiedDate?: string };
    CustomApplication: { Total: number; LastModifiedDate?: string };
    CustomField: { Total: number; LastModifiedDate?: string };
    CustomHttpHeader: { Total: number; LastModifiedDate?: string };
    CspTrustedSite: { Total: number; LastModifiedDate?: string };
    CustomObject: { Total: number; LastModifiedDate?: string };
    CustomTab: { Total: number; LastModifiedDate?: string };
    DataIntegrationRecordPurchasePermission: { Total: number; LastModifiedDate?: string };
    DuplicateJobDefinition: { Total: number; LastModifiedDate?: string };
    EmailTemplate: { Total: number; LastModifiedDate?: string };
    ExternalDataSource: { Total: number; LastModifiedDate?: string };
    FieldSet: { Total: number; LastModifiedDate?: string };
    FlowDefinition: { Total: number; LastModifiedDate?: string };
    GlobalValueSet: { Total: number; LastModifiedDate?: string };
    Group: { Total: number; LastModifiedDate?: string };
    HomePageLayout: { Total: number; LastModifiedDate?: string };
    InboundNetworkConnection: { Total: number; LastModifiedDate?: string };
    LightningComponentBundle: { Total: number; LastModifiedDate?: string };
    Layout: { Total: number; LastModifiedDate?: string };
    LookupFilter: { Total: number; LastModifiedDate?: string };
    MatchingRule: { Total: number; LastModifiedDate?: string };
    MarketingAppExtension: { Total: number; LastModifiedDate?: string };
    NamedCredential: { Total: number; LastModifiedDate?: string };
    OpportunitySplitType: { Total: number; LastModifiedDate?: string };
    OrgDomainLog: { Total: number; LastModifiedDate?: string };
    OutboundNetworkConnection: { Total: number; LastModifiedDate?: string };
    Package2: { Total: number; LastModifiedDate?: string };
    PathAssistant: { Total: number; LastModifiedDate?: string };
    PermissionSet: { Total: number; LastModifiedDate?: string };
    PermissionSetGroup: { Total: number; LastModifiedDate?: string };
    PlatformEventChannel: { Total: number; LastModifiedDate?: string };
    PostTemplate: { Total: number; LastModifiedDate?: string };
    Profile: { Total: number; LastModifiedDate?: string };
    QuickActionDefinition: { Total: number; LastModifiedDate?: string };
    RecordType: { Total: number; LastModifiedDate?: string };
    RecommendationStrategy: { Total: number; LastModifiedDate?: string };
    RemoteProxy: { Total: number; LastModifiedDate?: string };
    RestrictionRule: { Total: number; LastModifiedDate?: string };
    SchedulingRule: { Total: number; LastModifiedDate?: string };
    Scontrol: { Total: number; LastModifiedDate?: string };
    StaticResource: { Total: number; LastModifiedDate?: string };
    TransactionSecurityPolicy: { Total: number; LastModifiedDate?: string };
    ValidationRule: { Total: number; LastModifiedDate?: string };
    WebLink: { Total: number; LastModifiedDate?: string };
  };
  Tests: {
    TestOutcome: string;
    TestDuration: string;
    ApexUnitTests: number;
    TestMethodsCompleted: number;
    TestMethodsFailed: number;
    OrgWideApexCoverage: number;
    OrgWideFlowCoverage: number;
  };
  CodeLines: {
    ApexClass: {
      Total: number;
      Comments: number;
      Code: number;
    };
    ApexTrigger: {
      Total: number;
      Comments: number;
      Code: number;
    };
    AuraDefinitionBundle: {
      Total: number;
      Comments: number;
      Code: number;
    };
    LightningComponentBundle: {
      Total: number;
      Comments: number;
      Code: number;
    };
    StaticResource: {
      Total: number;
      Comments: number;
      Code: number;
    };
  };
};
