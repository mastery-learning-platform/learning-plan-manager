# Using alpine node as the base image
FROM mhart/alpine-node:10.0.0

# Use the app as the working directory
WORKDIR /usr/src/app

# Copy all the package.json to the folder
COPY package*.json yarn.lock ./

# Install all the dependencies
RUN yarn install

# Copy all the remaining files to the working dir
COPY . ./

# Start the application
CMD yarn start
