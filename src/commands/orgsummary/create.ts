/* eslint-disable @typescript-eslint/member-ordering */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
// import { OrgSummary } from 'sf-org-summary-core';
import { OrgSummary } from '/Users/rubenhalman/Projects/sf-org-summary-core/dist';
import { summarize } from '../../module/summarizer';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-org-summary', 'orgsummary.create');

export default class OrgsummaryCreate extends SfCommand<OrgSummary> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static supportsUsername = true;

  public static readonly flags = {
    metadata: Flags.string({
      summary: messages.getMessage('flags.metadata.summary'),
      description: messages.getMessage('flags.metadata.description'),
      char: 'm',
      required: false,
    }),
    nohealthcheck: Flags.boolean({
      summary: messages.getMessage('flags.nohealthcheck.summary'),
      description: messages.getMessage('flags.nohealthcheck.description'),
      char: 'g',
      required: false,
    }),
    keepdata: Flags.boolean({
      summary: messages.getMessage('flags.keepdata.summary'),
      description: messages.getMessage('flags.keepdata.description'),
      char: 'k',
      required: false,
    }),
    nolimits: Flags.boolean({
      summary: messages.getMessage('flags.nolimits.summary'),
      description: messages.getMessage('flags.nolimits.description'),
      char: 'l',
      required: false,
    }),
    nocodeanalysis: Flags.boolean({
      summary: messages.getMessage('flags.nocodeanalysis.summary'),
      description: messages.getMessage('flags.nocodeanalysis.description'),
      char: 's',
      required: false,
    }),
    notests: Flags.boolean({
      summary: messages.getMessage('flags.notests.summary'),
      description: messages.getMessage('flags.notests.description'),
      char: 't',
      required: false,
    }),
    targetusername: Flags.string({
      summary: messages.getMessage('flags.targetusername.summary'),
      description: messages.getMessage('flags.targetusername.description'),
      char: 'u',
      required: false,
    }),
    outputdirectory: Flags.string({
      summary: messages.getMessage('flags.outputdirectory.summary'),
      description: messages.getMessage('flags.outputdirectory.description'),
      char: 'd',
      required: false,
    }),
  };

  public async run(): Promise<OrgSummary> {
    const { flags } = await this.parse(OrgsummaryCreate);
    return summarize(flags);
  }
}
