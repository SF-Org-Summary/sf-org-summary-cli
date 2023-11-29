/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { summarizeOrg } from '../../module/summarizeOrg';
import { OrgSummary } from '../../models/summary'

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
    nocodelines: Flags.boolean({
      summary: messages.getMessage('flags.nocodelines.summary'),
      description: messages.getMessage('flags.nocodelines.description'),
      char: 'n',
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
    })
  };

  public async run(): Promise<OrgSummary> {
    const { flags } = await this.parse(Summarize);
    return summarizeOrg(flags)
  }

}
