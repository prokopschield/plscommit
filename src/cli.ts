#!/usr/bin/env node

import { go_through_files } from '.';

go_through_files(...process.argv.slice(2));
