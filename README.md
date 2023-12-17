# SF Org Summary

SF Org Summary is a robust Salesforce CLI plugin designed to offer a comprehensive overview of your Salesforce Org instance(s). This tool provides valuable insights into key metadata, test results, code metrics, usage of limit-related resources, linter results, and more, enabling you to better understand and monitor your Salesforce environment.

## Features

### Component Summary

Utilize the Tooling API to aggregate and track metadata details. Gain a quick overview of component totals, including the last modified date.

### Tests Summary

Run Apex tests and analyze the health of your codebase. Evaluate the overall test coverage of your Apex code and Flows.

### Org Limits Overview

Fetch actual usage related to Salesforce Org limits to ensure you stay within the allowed thresholds.

### Code Analysis

Identify and analyze potential risks in your codebase for Apex and JavaScript. Receive insights into various aspects such as severity, file location, and suggested improvements. The tool also measures the lines of code in your Apex Classes, Triggers, Aura Components, Lightning Web Components, and Static Resources, providing context by calculating the average amount of issues per line of code. The breakdown of lines of code includes total lines, comments, and actual code lines.

### Health Check Score

Assess the health of your Salesforce instance with a comprehensive health check score. Understand the number of open risks versus compliance and receive detailed information about security-related settings.

## Installation

Install the SF Org Summary plugin into your Salesforce CLI environment:

```bash
sf plugins:install sf-org-summary
```

## Usage

### Orgsummary Create

```bash
sf orgsummary create [flags]
```

#### Options

    -m, --metadata <datapoint1,datapoint2>: Specify the data points to include in the summary.
    -g, --nohealthcheck: Skip fetching and displaying Salesforce Health Check Score and Risks.
    -k, --keepdata: Keep the intermediate data files generated during the summary process.
    -l, --nolimits: Skip fetching and displaying Salesforce Org limits.
    -s, --nocodeanalysis: Skip counting lines of code.
    -t, --notests: Skip running Apex tests during the summary.
    -u, --targetusername <username>: Specify the target Salesforce Org username.

#### Examples

Get a summary for a Salesforce org:
```bash
sf orgsummary create  -u my-org-username
```
Get a summary of specific components while skipping apex tests:
```bash
sf orgsummary create  -u my-org-username --notests -c ApexClass,ApexTrigger,LightningComponentBundle
```

### Orgsummary Upload

```bash
sf orgsummary upload [flags]
```

#### Options

    -f, --summaryfile <summary-file-path>: Specify the path to the summary file.
    -u, --targetusername <target-org-username>: Specify the username of the target Salesforce Org.

#### Example

Upload an org summary to a Salesforce org:
```bash
sf orgsummary upload -f path/to/summary-file.json -u my-target-org-username
```
