/* eslint-disable no-console */
import { OrgSummary, buildBaseSummary, summarizeOrg } from '/Users/rubenhalman/Projects/sf-org-summary-core/dist';

export interface cliflags {
  [key: string]: string | boolean | undefined;
  components?: string;
  nohealthcheck?: boolean;
  keepdata?: boolean;
  nolimits?: boolean;
  nocodeanalysis?: boolean;
  notests?: boolean;
  nocodelines?: boolean;
  targetusername?: string;
}

export interface FlagObject {
  [key: string]: string | boolean | undefined;
  targetusername?: string;
}

export async function summarize(passedFlags: cliflags): Promise<OrgSummary> {
  let baseSummary: OrgSummary = await buildBaseSummary(passedFlags.targetusername);

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
      flagObject['keepdata'] = passedFlags.keepdata;
      if (typeof passedFlags.outputdirectory === 'string') {
        flagObject['outputdirectory'] = passedFlags.outputdirectory;
      }
      flagObject['metadata'] = '';
      console.debug(flagObject);
      // eslint-disable-next-line no-await-in-loop
      const orgSummary: OrgSummary = await summarizeOrg(flagObject, baseSummary);
      console.debug(orgSummary);
      baseSummary = { ...baseSummary, ...orgSummary };
    }
  }

  baseSummary.ResultState = 'Completed';
  const summary: OrgSummary = {
    ...baseSummary,
  };
  console.log('Final Summary:', summary);
  // finish(orgSummaryDirectory, summary, keepData);
  return summary;
}
