FROM node:18.18-alpine AS BUILD_IMAGE

WORKDIR /app

ARG TARGETPLATFORM
ENV TARGETPLATFORM=${TARGETPLATFORM:-linux/amd64}

# Set a specific version
ARG VERSION=v1.33.2
ENV VERSION=${VERSION}

RUN \
  case "${TARGETPLATFORM}" in \
  'linux/arm64' | 'linux/arm/v7') \
  apk update && \
  apk add --no-cache python3 make g++ gcc libc6-compat bash && \
  yarn global add node-gyp \
  ;; \
  esac

# Add build dependencies
RUN apk add --no-cache python3 make g++ gcc sqlite sqlite-dev

COPY package.json yarn.lock ./
RUN CYPRESS_INSTALL_BINARY=0 yarn install --frozen-lockfile --network-timeout 1000000

COPY . ./

ENV COMMIT_TAG=${VERSION}

RUN yarn build

# remove development dependencies but keep native modules
RUN yarn install --production --prefer-offline

RUN rm -rf src server .next/cache

RUN touch config/DOCKER

RUN echo "{\"commitTag\": \"${VERSION}\"}" > committag.json


FROM node:18.18-alpine

WORKDIR /app

# Add runtime dependencies
RUN apk add --no-cache tzdata tini sqlite-dev python3 make g++ gcc && rm -rf /tmp/*

# copy from build image
COPY --from=BUILD_IMAGE /app ./

# Rebuild native modules for the current environment
RUN cd /app && yarn rebuild bcrypt sqlite3

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "yarn", "start" ]

EXPOSE 5055
