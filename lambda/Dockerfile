# Kinetic Video Agent Lambda Container
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy built code and entry wrapper
COPY dist/handler.js ./dist/
COPY entry.js ./

# Lambda handler
CMD ["entry.main"]
