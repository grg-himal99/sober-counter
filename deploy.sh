#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Generate static files
echo "Generating static files..."
npm run generate

# The static files will be in the dist/ directory
echo "Deployment files are ready in the dist/ directory"
echo "You can now upload these files to your hosting provider"