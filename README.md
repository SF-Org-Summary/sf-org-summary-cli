# SF Org Summary

## Overview
SF Org Summary is a Salesforce CLI plugin designed to provide a comprehensive summary of your Salesforce Org instance(s). It offers insights into your Org's key metadata, test results, code line metrics, usage of limit related resources and more, helping you understand and monitor your Salesforce environment.

## Features

- **Component Summary:** Utilize the Tooling API to aggregate and track metadata details. Get a quick overview of component totals, including the last modified date.

- **Tests Summary:** Run Apex tests and analyze the health of your codebase. Evaluate the overall test coverage of your Apex code and Flows.

- **Lines of Code Summary:** Measure the lines of code in your Apex Classes, Triggers, Aura Components, Lightning Web Components, and Static Resources. Breakdown includes total lines, comments, and actual code lines.

- **Org Limits Overview:** Fetch actual usage related to Salesforce Org limits to ensure you stay within the allowed thresholds.

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
    -k, --keepdata: Keep the intermediate data files generated during the summary process.
    -l, --nolimits: Skip fetching and displaying Salesforce Org limits.
    -n, --nocodelines: Skip counting lines of code.
    -t, --notests: Skip running Apex tests during the summary.
    -u, --targetusername <username>: Specify the target Salesforce Org username.

### Examples

Run the summary for a specific Salesforce org:
```bash
sfdx summarize:org -u my-org-username
```
Run the summary with specific data points while skipping apex tests:
```bash
sfdx summarize:org -u my-org-username --notests -c ApexClass,ApexTrigger,LightningComponentBundle
```