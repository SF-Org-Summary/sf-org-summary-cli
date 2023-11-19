/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable sf-plugin/no-hardcoded-messages-flags */
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
import { summary } from '../../models/summary'
import { dataPoints } from '../../data/DataPoints';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-org-summary', 'summarize');

export default class Summarize extends SfCommand<summary> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static supportsUsername = true;

  public static readonly flags = {
    targetusername: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'u',
      required: false,
    }),
    notests: Flags.boolean({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 't',
      required: false,
    }),
    datapoints: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'd',
      required: false,
    })
  };

  public async run(): Promise<summary> {
    const { flags } = await this.parse(Summarize);

    const selectedDataPoints = flags.datapoints ? (flags.datapoints).split(',') : dataPoints;

    if (flags.targetusername && flags.notests) {
      return summarizeOrg(selectedDataPoints, flags.targetusername, flags.notests);
    } else if (flags.targetusername) {
      return summarizeOrg(selectedDataPoints, flags.targetusername);
    } else {
      return summarizeOrg(selectedDataPoints);
    }
  }

}
