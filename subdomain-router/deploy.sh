#!/bin/bash

# Load .env and export vars
set -a
source .env
set +a

# Use envsubst to replace $KV_BINDING_ID
envsubst < wrangler.template.jsonc > wrangler.jsonc

# Deploy using Wrangler
wrangler deploy

# Clean up the generated file
rm wrangler.jsonc
