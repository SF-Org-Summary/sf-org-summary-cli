/* eslint-disable @typescript-eslint/member-ordering */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { uploadSummary, UploadSummaryResult } from 'sf-org-summary-core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('sf-org-summary', 'orgsummary.upload');

export default class OrgsummaryUpload extends SfCommand<UploadSummaryResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  protected static requiresUsername = false;
  protected static supportsDevhubUsername = false;
  protected static supportsUsername = true;

  public static readonly flags = {
    targetusername: Flags.string({
      summary: messages.getMessage('flags.targetusername.summary'),
      description: messages.getMessage('flags.targetusername.description'),
      char: 'u',
      required: false,
    }),
    summaryfile: Flags.file({
      summary: messages.getMessage('flags.summaryfile.summary'),
      description: messages.getMessage('flags.summaryfile.description'),
      char: 'f',
      required: false,
    }),
  };

  public async run(): Promise<UploadSummaryResult> {
    const { flags } = await this.parse(OrgsummaryUpload);
    return uploadSummary(flags.summaryfile as string, flags.targetusername as string);
  }
}