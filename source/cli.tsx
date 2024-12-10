#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './app.js'
import { config } from './utils/config.js'
import { handler } from './setup.js'

const cli = meow(
  `
	Usage
	  $ releash

	Options
		-p  Your project name in Unleash
		-s    Run the setup wizard

	Examples
	  $ releash -p <project-name>
	  $ releash -s
`,
  {
    importMeta: import.meta,
    flags: {
      project: {
        type: 'string',
        alias: 'p',
      },
      setup: {
        type: 'boolean',
        alias: 's',
      },
    },
  }
)

if (!config.isValid()) {
  handler()
} else if (cli.flags.setup) {
  handler()
} else {
  render(<App project={cli.flags.project} />)
}
