import { Command } from 'commander';
import prompts from 'prompts';
import { execa } from 'execa';
import consola from 'consola';

import scriptsDir from '../utils/get-scripts-dir.cjs';
import { makeChurchOption, makeAPIKeyOption } from '../options.js';

export default () => {
  const config = new Command('config');
  config.description('Manage Apollos configuration variables');

  // get
  const get = new Command('get')
    .description('Gets church config values')
    .argument('[value]')
    .action(async (value, options) => {
      const questions = [
        {
          type: options.church ? null : 'text',
          name: 'church',
          message: 'Church?',
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
        const path = `${church}${value ? `/${value}` : ''}`;
        try {
          const { stdout } = await execa(`${scriptsDir}/get-config.sh`, [
            key,
            path,
          ]);
          consola.log(stdout);
        } catch (e) {
          consola.error(e);
        }
      }
    });
  get.addOption(makeChurchOption());
  get.addOption(makeAPIKeyOption());
  config.addCommand(get);

  // set
  const set = new Command('set')
    .description('Sets church config values')
    .argument('<key>')
    .argument('<value>')
    .option('--encrypted', 'Should the value be encrypted?')
    .option('--json', 'Is the value JSON?')
    .action(async (key, value, options) => {
      const questions = [
        {
          type: options.church ? null : 'text',
          name: 'church',
          message: 'Church?',
        },
        {
          type: options.apiKey ? null : 'text',
          name: 'apiKey',
          message: 'Apollos API Key?',
        },
      ];
      const response = await prompts(questions);
      const church = options.church || response.church;
      const apiKey = options.apiKey || response.apiKey;
      if (church && key) {
        try {
          const body = {
            key,
            value: options.json ? JSON.parse(value) : value,
            encrypted: !!options.encrypted,
            json: !!options.json,
          };
          const { stdout } = await execa(`${scriptsDir}/set-config.sh`, [
            apiKey,
            church,
            JSON.stringify(body),
          ]);
          consola.log(stdout);
        } catch (e) {
          consola.error(e);
        }
      }
    });
  set.addOption(makeChurchOption());
  set.addOption(makeAPIKeyOption());

  config.addCommand(set);
  return config;
};
