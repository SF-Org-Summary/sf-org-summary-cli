# SF Org Summary

SF Org Summary is a Salesforce CLI plugin designed to provide a comprehensive summary of your Salesforce Org instance(s). It offers insights into your Org's key metadata, test results, code line metrics, usage of limit-related resources, linter results and more, helping you understand and monitor your Salesforce environment.

## Features

- **Component Summary:** Utilize the Tooling API to aggregate and track metadata details. Get a quick overview of component totals, including the last modified date.

- **Tests Summary:** Run Apex tests and analyze the health of your codebase. Evaluate the overall test coverage of your Apex code and Flows.

- **Org Limits Overview:** Fetch actual usage related to Salesforce Org limits to ensure you stay within the allowed thresholds.

- **Code Analyzer:** Identify and analyze potential risks in your codebase. Receive insights into various aspects such as severity, file location, and suggested improvements. Also measures the lines of code in your Apex Classes, Triggers, Aura Components, Lightning Web Components, and Static Resources to put the amount of issues into context by calculating the average amount of issues per line of code. The breakdown of lines of code includes total lines, comments, and actual code lines.

- **Health Check Score:** Assess the health of your Salesforce instance with a comprehensive health check score. Understand the amount of open risks versus compliance, and detailed get information about security-related settings.

## Installation

Install the SF Org Summary plugin seamlessly into your Salesforce CLI environment:

```bash
sfdx plugins:install sf-org-summary
```

## Usage

```bash
sfdx summarize:org [flags]
```

### Options

    -c, --components <datapoint1,datapoint2>: Specify the data points to include in the summary.
    -g, --nohealthcheck: Skip fetching and displaying Salesforce Health Check Score and Risks.
    -k, --keepdata: Keep the intermediate data files generated during the summary process.
    -l, --nolimits: Skip fetching and displaying Salesforce Org limits.
    -s, --nocodeanalysis: Skip counting lines of code.
    -t, --notests: Skip running Apex tests during the summary.
    -u, --targetusername <username>: Specify the target Salesforce Org username.

### Examples

Get a summary for a Salesforce org:
```bash
sfdx summarize:org -u my-org-username
```
Get a summary of specific components while skipping apex tests:
```bash
sfdx summarize:org -u my-org-username --notests -c ApexClass,ApexTrigger,LightningComponentBundle
```