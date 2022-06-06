import { Command } from 'commander';
import prompts from 'prompts';
import { execa } from 'execa';

import scriptsDir from '../../utils/get-scripts-dir.cjs';
import logo from './logo.js';
import makeDeployCommand from './deploy.js';

export default () => {
  const mobile = new Command('mobile');
  mobile.description('Manage Apollos mobile apps');
  mobile.addCommand(makeDeployCommand());

  mobile
    .command('init')
    .description('Create new mobile app')
    .action(() => {
      const questions = [
        {
          type: 'text',
          name: 'appName',
          message: 'App name?',
        },
        {
          type: 'text',
          name: 'iosID',
          message: 'iOS Bundle Identifier?',
          initial: (prev) => `com.apollos.${prev.toLowerCase().replace(/ /g, '-')}`,
          validate: (value) => (value.match(/[A-Za-z0-9-.]+/)[0] === value
            ? true
            : 'Alphanumeric, hyphens, and periods only!'),
        },
        {
          type: 'text',
          name: 'androidID',
          message: 'Android App ID?',
          initial: (prev) => prev,
          validate: (value) => (value.match(/[A-Za-z0-9-.]+/)[0] === value
            ? true
            : 'Alphanumeric, hyphens, and periods only!'),
        },
        {
          type: 'text',
          name: 'serverURL',
          message: 'Server URL?',
          validate: (value) => (value.match(/^http.*/)[0] === value ? true : 'Must be a valid URL!'),
        },
        {
          type: 'text',
          name: 'googleMapsKey',
          message: 'Google Maps API Key?',
        },
        {
          type: 'text',
          name: 'encryptionKey',
          message: 'Encryption Key?',
        },
      ];

      (async () => {
        const response = await prompts(questions);
        if (Object.keys(response).length === questions.length) {
          try {
            execa(`${scriptsDir}/create-mobile.sh`, [
              response.appName,
              response.iosID,
              response.androidID,
              response.serverURL,
              response.googleMapsKey,
              response.encryptionKey,
            ]).stdout.pipe(process.stdout);
          } catch (e) {
            console.log(e);
          }
        }
      })();
    });

  mobile
    .command('logo')
    .description('Edit app icons and splash screen')
    .action(() => logo());

  mobile
    .command('versions')
    .description('Get current App Store and Play Store versions')
    .action(() => {
      const questions = [
        {
          type: 'text',
          name: 'appleID',
          message: 'Apple ID?',
        },
      ];
      (async () => {
        const response = await prompts(questions);
        if (Object.keys(response).length === 1) {
          try {
            execa(`${scriptsDir}/get-mobile-versions.sh`, [
              response.appleID,
            ]).stdout.pipe(process.stdout);
          } catch (e) {
            console.log(e);
          }
        }
      })();
    });
  return mobile;
};
