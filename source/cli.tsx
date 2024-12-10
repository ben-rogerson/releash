#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './app.js'
import { config } from './utils/config.js'
import { handler } from './utils/setup.js'

// Start with a blank slate
// console.clear()

const cli = meow(
  `
	Usage
	  $ releash

	Options
		--project  Your project name in Unleash

	Examples
	  $ releash --project Dingoes
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
      },
    },
  }
)

if (!config.isValid()) {
  handler()
} else {
  render(<App project={cli.flags.project} />)
}
