import { execa } from 'execa';
import { Command } from 'commander';
import prompts from 'prompts';
import consola from 'consola';
import ora from 'ora';

import scriptsDir from '../../utils/get-scripts-dir.cjs';

export default () => {
  const add = new Command('add');
  add.description('Add third party services');

  add
    .command('bugsnag')
    .description('Adds Bugsnag')
    .action(async () => {
      const questions = [
        {
          type: 'text',
          name: 'key',
          message: 'Bugsnag API Key?',
        },
      ];

      const { key } = await prompts(questions);
      if (key) {
        const spinner = ora('Adding Bugsnag').start();
        try {
          await execa(`${scriptsDir}/add-bugsnag.sh`, [key]);
        } catch (e) {
          spinner.fail('Failed');
          consola.log(e.stdout);
          consola.log(e.stderr);
          process.exit(1);
        }
        spinner.succeed('Success!');
      }
    });

  add
    .command('amplitude')
    .description('Adds Amplitude')
    .action(async () => {
      const questions = [
        {
          type: 'text',
          name: 'key',
          message: 'Amplitude API Key?',
        },
        {
          type: 'text',
          name: 'password',
          message: 'Apollos Encryption Key?',
        },
      ];

      const { key, password } = await prompts(questions);
      if (key && password) {
        const spinner = ora('Adding Amplitude').start();
        try {
          await execa(`${scriptsDir}/add-amplitude.sh`, [key, password]);
        } catch (e) {
          spinner.fail('Failed');
          consola.log(e.stdout);
          consola.log(e.stderr);
          process.exit(1);
        }
        spinner.succeed('Success!');
      }
    });
  return add;
};
