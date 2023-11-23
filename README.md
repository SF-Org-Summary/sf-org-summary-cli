# SF Org Summary

## Overview
SF Org Summary is a Salesforce CLI plugin designed to provide a comprehensive summary of various data points within your Salesforce Org instance(s). It allows you to quickly gather essential information including key metatdata, Apex test results, code line counters and thereby aiding in the analysis and understanding of your Salesforce environment. 

## Features

- **Component Summary:** Leverage the Tooling API to aggregate and track essential metadata details, providing a quick overview of component totals and last modified dates. 

- **Tests Summary :** Run Apex tests, retrieve test results to assess the health of your codebase, and evaluate the overall test coverage of your Apex and Flows.

- **Lines of Code Summary:** Measure the lines of code in your Apex Classes, Triggers, Aura Components, Lightning Web Components, and Static Resources.

## Installation

Install the Salesforce Org Summary plugin using the Salesforce CLI:

```bash
sfdx plugins:install sf-org-summary
```

## Usage

```bash
sfdx summarize:org [flags]
```

### Options

    -u, --targetusername <username>: Specify the target Salesforce Org username.
    -t, --notests: Skip running Apex tests during the summary.
    -d, --datapoints <datapoint1,datapoint2>: Specify the data points to include in the summary.

### Examples

Run the summary for a specific org:
```bash
sfdx summarize:org -u my-org-username
```
Run the summary with specific data points and skip tests:
```bash
sfdx summarize:org -u my-org-username -t -d ApexClass,ApexTrigger,LightningComponentBundle
```
