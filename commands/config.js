import { Command } from 'commander';
import prompts from 'prompts';
import { execa } from 'execa';
import consola from 'consola';

import scriptsDir from '../utils/get-scripts-dir.cjs';

export default () => {
  const config = new Command('config');
  config.description('Manage Apollos configuration');

  config
    .command('get <church>')
    .description('Gets church config values')
    .option('-k, --key <variable>', 'Add to get specific config value')
    .action(async (church, options) => {
      const questions = [
        {
          type: 'text',
          name: 'apiKey',
          message: 'Apollos API Key?',
        },
      ];
      const { apiKey } = await prompts(questions);
      const path = `${church}${options.key ? `/${options.key}` : ''}`;
      if (apiKey) {
        try {
          const { stdout } = await execa(`${scriptsDir}/get-config.sh`, [
            apiKey,
            path,
          ]);
          consola.log(stdout);
        } catch (e) {
          consola.log(e);
        }
      }
    });
  return config;
};
