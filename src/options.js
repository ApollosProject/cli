import { Option } from 'commander';

export const makeChurchOption = () => new Option('--church <slug>', 'specify church app to configure').env(
  'CHURCH',
);

export const makeAPIKeyOption = () => new Option('--api-key <key>', 'Apollos API key').env('APOLLOS_API_KEY');
