import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { summarizeOrg } from '../../module/summarizeOrg';
import {summary} from "../../models/summary"

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
  };

  public async run(): Promise<summary> {
    const { flags } = await this.parse(Summarize);
    if (flags.targetusername) {
      return summarizeOrg(flags.targetusername);
    } else {
    return summarizeOrg();
    }
  }

}
