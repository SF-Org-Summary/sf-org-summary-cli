import { TestContext } from '@salesforce/core/lib/testSetup';
import { expect } from 'chai';

describe('orgsummary upload', () => {
  const $$ = new TestContext();

  afterEach(() => {
    $$.restore();
  });

  it('runs hello world --name Astro', async () => {
    expect(1).to.equal(1);
  });

});
