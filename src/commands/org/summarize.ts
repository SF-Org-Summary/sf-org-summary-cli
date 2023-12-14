/* eslint-disable @typescript-eslint/member-ordering */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { OrgSummary } from 'sf-org-summary-core';
import { summarize } from '../../module/summarizer';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-org-summary', 'summarize');

export default class Summarize extends SfCommand<OrgSummary> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static supportsUsername = true;

  public static readonly flags = {
    components: Flags.string({
      summary: messages.getMessage('flags.components.summary'),
      description: messages.getMessage('flags.components.description'),
      char: 'c',
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
  };

  public async run(): Promise<OrgSummary> {
    const { flags } = await this.parse(Summarize);
    return summarize(flags);
  }
}
