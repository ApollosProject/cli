import { execa } from 'execa';
import { Command, Option } from 'commander';
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

  const churchOption = new Option(
    '--church <slug>',
    'specify church app to configure',
  ).env('CHURCH');

  const keyOption = new Option('--api-key <key>', 'Apollos API key').env(
    'APOLLOS_API_KEY',
  );

  const linking = new Command('linking')
    .description('Adds Universal and Deep Linking')
    .action(async (options) => {
      const questions = [
        {
          type: options.church ? null : 'text',
          name: 'church',
          message: 'Apollos API Key?',
        },
        {
          type: options.apiKey ? null : 'text',
          name: 'key',
          message: 'Apollos API Key?',
        },
      ];

      const response = await prompts(questions);
      const church = options.church || response.church;
      const key = options.apiKey || response.key;
      if (church && key) {
        try {
          await execa(`${scriptsDir}/add-linking.sh`, [key, options.church]);
        } catch (e) {
          consola.error(e.stdout);
          process.exit(1);
        }
      }
    });

  linking.addOption(churchOption);
  linking.addOption(keyOption);

  add.addCommand(linking);
  return add;
};
