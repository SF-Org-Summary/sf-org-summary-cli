/* eslint-disable no-console */
import { OrgSummary, buildBaseSummary, summarizeOrg } from 'sf-org-summary-core';

export interface cliflags {
  [key: string]: string | boolean | undefined;
  metadata?: string;
  nohealthcheck?: boolean;
  keepdata?: boolean;
  nolimits?: boolean;
  nocodeanalysis?: boolean;
  notests?: boolean;
  nocodelines?: boolean;
  targetusername?: string;
  outputdirectory?: string;
}

export interface FlagObject {
  [key: string]: string | boolean | undefined;
  targetusername?: string;
}

export async function summarize(passedFlags: cliflags): Promise<OrgSummary> {
  let baseSummary: OrgSummary = await buildBaseSummary(passedFlags.targetusername);
  const keepData = passedFlags.keepdata ?? false;
  // boolean flag logic
  for (const flag of ['nohealthcheck', 'nolimits', 'notests', 'nocodeanalysis']) {
    const flagObject: FlagObject = { targetusername: passedFlags.targetusername };

    if (Object.prototype.hasOwnProperty.call(passedFlags, flag) && passedFlags[flag] === true) {
      continue;
    } else {
      switch (flag) {
        case 'nohealthcheck':
          flagObject['healthcheck'] = true;
          break;
        case 'nolimits':
          flagObject['limits'] = true;
          break;
        case 'notests':
          flagObject['tests'] = true;
          break;
        case 'nocodeanalysis':
          flagObject['codeanalysis'] = true;
          break;
      }
      flagObject['keepdata'] = keepData;
      if (typeof passedFlags.outputdirectory === 'string') {
        flagObject['outputdirectory'] = passedFlags.outputdirectory;
      }
      flagObject['metadata'] = '';
      console.debug(flagObject);
      // eslint-disable-next-line no-await-in-loop
      const orgSummary: OrgSummary = await summarizeOrg(flagObject, baseSummary);
      baseSummary = { ...baseSummary, ...orgSummary };
    }
  }

  // Check if metadata is either undefined or a non-empty string
  if (passedFlags.metadata ?? typeof passedFlags.metadata === 'undefined') {
    const commonFlagProperties: FlagObject = {
      targetusername: passedFlags.targetusername,
      keepdata: keepData,
    };
    commonFlagProperties['metadata'] = passedFlags.metadata;
    if (typeof passedFlags.outputdirectory === 'string') {
      commonFlagProperties['outputdirectory'] = passedFlags.outputdirectory;
    }
    // Call summarizeOrg and update baseSummary
    const orgSummary: OrgSummary = await summarizeOrg(commonFlagProperties, baseSummary);
    baseSummary = { ...baseSummary, ...orgSummary };
  }

  baseSummary.ResultState = 'Completed';
  const summary: OrgSummary = {
    ...baseSummary,
  };
  console.log('Final Summary:', summary);
  return summary;
}
