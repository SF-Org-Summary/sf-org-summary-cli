# summary

Get Org Summary 

# description

Quickly gather valuable insights into key metadata, test results, code metrics, usage of limit-related resources, linter results, and more.

# flags.targetusername.summary

Select Org

# flags.targetusername.description

Specifies the Salesforce Org username for which you want to generate the summary.

# flags.notests.summary

Skip Apex Tests

# flags.notests.description

Skips the execution of Apex tests during the summary process.

# flags.metadata.summary

Set Metadata To Query

# flags.metadata.description

Specifies the Metadata data points to include in the summary. Use commas to separate multiple components.

# flags.keepdata.summary

Keep Data Files

# flags.keepdata.description

 Retains the intermediate data files generated during the summary process.

# flags.nolimits.summary

Display Org Limits

# flags.nolimits.description

Skips fetching and displaying Salesforce Org limits during the summary process.

# flags.nohealthcheck.summary

Skip Health Check

# flags.nohealthcheck.description

Skips fetching and displaying Salesforce Health Check Score and Risks during the summary process.

# flags.nocodeanalysis.description
Skips running the code analysis process during the summary.

# flags.nocodeanalysis.summary

Skip Code Analysis

# flags.nohealthcheck.summary

Keep Data Files

# flags.nohealthcheck.description

Keep Data Files

# flags.noscan.description

Keep Data Files

# flags.noscan.summary

Keep Data Files

# flags.outputdirectory.description

Set a path to store the org summary result.

# flags.outputdirectory.summary

Store Summary

# examples

- <%= config.bin %> <%= command.id %>

